import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { Fn, Ts } from '@wollybeard/kit'
import type { z } from 'zod/v4'
import { createExtension } from '../../extension.js'
import type { Optionality, SchemaType } from '../../schema/oak-schema.js'
import { isBoolean, isDefault, isEnum, isLiteral, isNumber, isOptional, isString, isUnion } from './guards.js'

// Supported Zod schema types for CLI parameters
// Explicitly excludes ZodUnknown and other types that don't make sense for CLI
// Note: ZodNativeEnum doesn't have an exported type in Zod v4, but is handled at runtime
type SupportedZodType =
  | z.ZodString
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodEnum<any>
  | z.ZodLiteral<any>
  | z.ZodUnion<any>
  | z.ZodOptional<any>
  | z.ZodDefault<any>

export interface ZodGuard extends Fn.Kind.Kind {
  // @ts-expect-error - Intentional HKT pattern
  return: this['parameters'][0] extends SupportedZodType ? never
    : Ts.Err.StaticError<
      ['schema', 'unsupported-zod-type'],
      {
        message:
          'Unsupported Zod schema type. Supported types: string, number, boolean, enum, literal, union, optional, default. Not supported: nullable, nullish, unknown.'
      }
    >
}

export const Zod = createExtension<ZodGuard>({
  name: `Zod`,

  guard: undefined as any,

  toStandardSchema: (schema: unknown): StandardSchemaV1<any, any> => {
    const zodSchema = schema as any

    // Reject unsupported schema types
    // z.unknown() doesn't have a meaningful CLI representation - everything is a string input
    if (zodSchema._def?.type === `unknown`) {
      throw new Error(
        `Unsupported Zod schema type: z.unknown() cannot be used as a CLI parameter. Use z.string() if you want to accept any string value.`,
      )
    }

    // Zod v4 schemas already implement Standard Schema V1
    return schema as StandardSchemaV1<any, any>
  },

  extractMetadata: (schema: unknown) => {
    const zodSchema = schema as z.ZodType
    const { description, optionality, schemaType, helpHints } = extractZodMetadata(zodSchema)

    return {
      description,
      optionality,
      schema: schemaType,
      helpHints,
    }
  },
})

/**
 * Extract metadata from a Zod schema for CLI help generation.
 */
const extractZodMetadata = (
  zodSchema: z.ZodType,
  previous?: { description?: string; optionality?: Optionality<any> },
): { description?: string; optionality: Optionality<any>; schemaType: SchemaType; helpHints?: any } => {
  const schema = zodSchema as any
  const description = previous?.description ?? schema.description

  // In Zod v4, _def.defaultValue is a getter that returns the value directly, not a function
  // We need to avoid accessing it during metadata extraction to prevent executing the default function
  // Instead, we just check if it's a default schema and create a getValue thunk
  let optionality: Optionality<any>
  if (previous?.optionality) {
    optionality = previous.optionality
  } else if (isDefault(zodSchema)) {
    // Create a thunk that will access the default value lazily when needed
    optionality = { _tag: `default`, getValue: () => schema._def?.defaultValue }
  } else if (isOptional(zodSchema)) {
    optionality = { _tag: `optional`, omittedValue: undefined }
  } else {
    optionality = { _tag: `required` }
  }

  let displayType = `unknown`
  let refinements: string[] = []
  let priority = 0
  let schemaType: SchemaType

  if (isString(zodSchema)) {
    displayType = `string`
    refinements = extractStringRefinements(zodSchema)
    priority = 1
    schemaType = { _tag: `string` }
  } else if (isNumber(zodSchema)) {
    displayType = `number`
    refinements = extractNumberRefinements(zodSchema)
    priority = 2
    schemaType = { _tag: `number` }
  } else if (isBoolean(zodSchema)) {
    displayType = `boolean`
    priority = 3
    schemaType = { _tag: `boolean` }
  } else if (isEnum(zodSchema)) {
    // Check if this is a native enum or regular enum
    // Native enums have _def.entries (object), regular enums have _def.values (array)
    if (schema._def?.entries) {
      // Native enum
      const enumObj = schema._def.entries
      const members = Object.values(enumObj)
      displayType = members.map((m) => `'${m}'`).join(` | `)
      priority = 4
      schemaType = { _tag: `enum`, values: members }
    } else {
      // Regular enum
      const members = schema._def?.values as string[] ?? []
      displayType = members.map((m) => `'${m}'`).join(` | `)
      priority = 4
      schemaType = { _tag: `enum`, values: members }
    }
  } else if (isLiteral(zodSchema)) {
    const value = schema._def?.value
    displayType = typeof value === `string` ? `'${value}'` : String(value)
    priority = 5
    schemaType = { _tag: `literal`, value }
  } else if (isDefault(zodSchema)) {
    return extractZodMetadata(schema._def?.innerType, { description, optionality })
  } else if (isOptional(zodSchema)) {
    return extractZodMetadata(schema._def?.innerType, { description, optionality })
  } else if (isUnion(zodSchema)) {
    const options = (schema._def?.options as z.ZodType[]) ?? []
    const membersMetadata = options.map((opt) => extractZodMetadata(opt))
    displayType = membersMetadata.map((m) => m.helpHints?.displayType ?? `unknown`).join(` | `)
    priority = 0
    schemaType = { _tag: `union`, members: membersMetadata.map((m) => m.schemaType) }

    return {
      description,
      optionality,
      schemaType,
      helpHints: {
        displayType,
        refinements: refinements.length > 0 ? refinements : undefined,
        priority,
      },
    }
  } else {
    // Fallback for unknown types
    schemaType = { _tag: `string` }
  }

  return {
    description,
    optionality,
    schemaType,
    helpHints: {
      displayType,
      refinements: refinements.length > 0 ? refinements : undefined,
      priority,
    },
  }
}

/**
 * Extract refinement descriptions from a Zod string schema.
 */
const extractStringRefinements = (schema: z.ZodString): string[] => {
  const refinements: string[] = []
  const checks = (schema as any)._def?.checks ?? []

  for (const check of checks) {
    const kind = check.kind
    if (kind === `min`) refinements.push(`min length: ${check.value}`)
    else if (kind === `max`) refinements.push(`max length: ${check.value}`)
    else if (kind === `length`) refinements.push(`length: ${check.value}`)
    else if (kind === `email`) refinements.push(`email format`)
    else if (kind === `url`) refinements.push(`URL format`)
    else if (kind === `uuid`) refinements.push(`UUID format`)
    else if (kind === `cuid`) refinements.push(`CUID format`)
    else if (kind === `cuid2`) refinements.push(`CUID2 format`)
    else if (kind === `ulid`) refinements.push(`ULID format`)
    else if (kind === `regex`) refinements.push(`pattern: ${check.regex}`)
    else if (kind === `startsWith`) refinements.push(`starts with: "${check.value}"`)
    else if (kind === `endsWith`) refinements.push(`ends with: "${check.value}"`)
    else if (kind === `includes`) refinements.push(`contains: "${check.value}"`)
  }

  return refinements
}

/**
 * Extract refinement descriptions from a Zod number schema.
 */
const extractNumberRefinements = (schema: z.ZodNumber): string[] => {
  const refinements: string[] = []
  const checks = (schema as any)._def?.checks ?? []

  for (const check of checks) {
    const kind = check.kind
    if (kind === `min`) refinements.push(`min: ${check.value}`)
    else if (kind === `max`) refinements.push(`max: ${check.value}`)
    else if (kind === `int`) refinements.push(`integer`)
    else if (kind === `multipleOf`) refinements.push(`multiple of: ${check.value}`)
    else if (kind === `finite`) refinements.push(`finite`)
  }

  return refinements
}
