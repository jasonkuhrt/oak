import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { z } from 'zod'
import { createExtension } from '../../extension.js'
import type { Optionality } from '../../schema/molt-schema.js'
import {
  isBoolean,
  isDefault,
  isEnum,
  isLiteral,
  isNativeEnum,
  isNumber,
  isOptional,
  isString,
  isUnion,
} from './guards.js'

export const Zod = createExtension({
  name: `Zod`,

  toStandardSchema: (schema: unknown): StandardSchemaV1<any, any> => {
    // Zod v4 schemas already implement Standard Schema V1
    return schema as StandardSchemaV1<any, any>
  },

  extractMetadata: (schema: unknown) => {
    const zodSchema = schema as z.ZodType
    const { description, optionality, helpHints } = extractZodMetadata(zodSchema)

    return {
      description,
      optionality,
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
): { description?: string; optionality: Optionality<any>; helpHints?: any } => {
  const schema = zodSchema as any
  const description = previous?.description ?? schema.description

  const defaultGetter = isDefault(zodSchema) ? (schema._def?.defaultValue as () => unknown) : null
  const optionality: Optionality<any> = previous?.optionality ?? (defaultGetter
    ? { _tag: `default`, getValue: () => defaultGetter() }
    : isOptional(zodSchema)
    ? { _tag: `optional` }
    : { _tag: `required` })

  let displayType = 'unknown'
  let refinements: string[] = []
  let priority = 0

  if (isString(zodSchema)) {
    displayType = 'string'
    refinements = extractStringRefinements(zodSchema)
    priority = 1
  } else if (isNumber(zodSchema)) {
    displayType = 'number'
    refinements = extractNumberRefinements(zodSchema)
    priority = 2
  } else if (isBoolean(zodSchema)) {
    displayType = 'boolean'
    priority = 3
  } else if (isEnum(zodSchema)) {
    const members = schema._def?.values as string[] ?? []
    displayType = members.map((m) => `'${m}'`).join(' | ')
    priority = 4
  } else if (isNativeEnum(zodSchema)) {
    const members = Object.values(schema._def?.values ?? {})
    displayType = members.map((m) => `'${m}'`).join(' | ')
    priority = 4
  } else if (isLiteral(zodSchema)) {
    const value = schema._def?.value
    displayType = typeof value === 'string' ? `'${value}'` : String(value)
    priority = 5
  } else if (isDefault(zodSchema)) {
    return extractZodMetadata(schema._def?.innerType, { description, optionality })
  } else if (isOptional(zodSchema)) {
    return extractZodMetadata(schema._def?.innerType, { description, optionality })
  } else if (isUnion(zodSchema)) {
    const options = (schema._def?.options as z.ZodType[]) ?? []
    displayType = options.map((opt) => extractZodMetadata(opt).helpHints?.displayType ?? 'unknown').join(' | ')
    priority = 0
  }

  return {
    description,
    optionality,
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
    const kind = (check as any).kind
    if (kind === 'min') refinements.push(`min length: ${(check as any).value}`)
    else if (kind === 'max') refinements.push(`max length: ${(check as any).value}`)
    else if (kind === 'length') refinements.push(`length: ${(check as any).value}`)
    else if (kind === 'email') refinements.push('email format')
    else if (kind === 'url') refinements.push('URL format')
    else if (kind === 'uuid') refinements.push('UUID format')
    else if (kind === 'cuid') refinements.push('CUID format')
    else if (kind === 'cuid2') refinements.push('CUID2 format')
    else if (kind === 'ulid') refinements.push('ULID format')
    else if (kind === 'regex') refinements.push(`pattern: ${(check as any).regex}`)
    else if (kind === 'startsWith') refinements.push(`starts with: "${(check as any).value}"`)
    else if (kind === 'endsWith') refinements.push(`ends with: "${(check as any).value}"`)
    else if (kind === 'includes') refinements.push(`contains: "${(check as any).value}"`)
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
    const kind = (check as any).kind
    if (kind === 'min') refinements.push(`min: ${(check as any).value}`)
    else if (kind === 'max') refinements.push(`max: ${(check as any).value}`)
    else if (kind === 'int') refinements.push('integer')
    else if (kind === 'multipleOf') refinements.push(`multiple of: ${(check as any).value}`)
    else if (kind === 'finite') refinements.push('finite')
  }

  return refinements
}
