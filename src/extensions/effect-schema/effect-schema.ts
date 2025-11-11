import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { Fn, Ts } from '@wollybeard/kit'
import * as _ from '@wollybeard/kit/fn'
import { Option, Schema, SchemaAST } from 'effect'
import { createExtension } from '../../extension.js'
import type { Optionality, SchemaType } from '../../schema/oak-schema.js'

export type SupportedType = Schema.Schema.All

/**
 * Effect Schema guard that rejects Schema.NullOr patterns.
 * CLI users cannot pass literal null values - they can only omit parameters.
 * Use Schema.UndefinedOr instead for optional parameters.
 */
export interface EffectSchemaGuard extends Fn.Kind.Kind {
  // @ts-expect-error - Intentional HKT pattern
  return: this['parameters'][0] extends Schema.NullOr<any> ? Ts.Err.StaticError<
      ['schema', 'nullor-not-supported'],
      {
        message:
          'Schema.NullOr() is not supported in CLI parameters. Use Schema.UndefinedOr() instead, as CLI users can only omit parameters (undefined), not pass literal null.'
      }
    >
    : never // Valid schema - return never so ApplyGuard passes through original
}

export const EffectSchema = createExtension<SupportedType, EffectSchemaGuard>({
  name: `EffectSchema`,

  // Guard that rejects Schema.NullOr at compile-time
  guard: undefined as any,
  type: undefined as any,

  toStandardSchema: (schema: unknown): StandardSchemaV1<any, any> => {
    const effectSchema = schema as Schema.Schema<any, any, never>

    // Check if this is Schema.Option - if so, wrap it to accept plain values
    // For CLI purposes, we want to accept T | undefined instead of { _tag: "None" } | { _tag: "Some", value: T }
    if (isOptionSchema(effectSchema.ast)) {
      // Extract the inner type from the Option's "Some" branch
      const transformation = effectSchema.ast as SchemaAST.Transformation
      const fromUnion = transformation.from as SchemaAST.Union
      const someType = fromUnion.types.find((t) => {
        if (t._tag !== `TypeLiteral`) return false
        const typeLiteral = t as SchemaAST.TypeLiteral
        const tagProp = typeLiteral.propertySignatures.find((p) => p.name === `_tag`)
        if (!tagProp) return false
        const tagType = tagProp.type
        if (tagType._tag !== `Literal`) return false
        return (tagType as SchemaAST.Literal).literal === `Some`
      })

      if (someType && someType._tag === `TypeLiteral`) {
        const valueProp = (someType as SchemaAST.TypeLiteral).propertySignatures.find((p) => p.name === `value`)
        if (valueProp) {
          // Build inner schema from AST and wrap it to handle Option encoding
          const innerSchema = buildSchemaFromAST(valueProp.type)
          const wrappedSchema = Schema.transform(
            Schema.UndefinedOr(innerSchema),
            effectSchema as any,
            {
              strict: true,
              decode: (value) => (value === undefined ? { _tag: `None` as const } : { _tag: `Some` as const, value }),
              encode: (optionValue: any) => (optionValue._tag === `None` ? undefined : optionValue.value),
            },
          )
          return Schema.standardSchemaV1(wrappedSchema as any)
        }
      }
    }

    // Effect Schema provides standardSchemaV1() to convert to Standard Schema V1
    return Schema.standardSchemaV1(effectSchema)
  },

  extractMetadata: (schema: unknown) => {
    const effectSchema = schema as Schema.Schema.All
    const { description, optionality, schemaType, helpHints } = extractEffectSchemaMetadata(effectSchema)

    return {
      description,
      optionality,
      schema: schemaType,
      helpHints,
    }
  },
})

/**
 * Extract metadata from an Effect Schema for CLI help generation.
 */
const extractEffectSchemaMetadata = (
  effectSchema: Schema.Schema.All,
  previous?: { description?: string; optionality?: Optionality<any> },
): { description?: string; optionality: Optionality<any>; schemaType: SchemaType; helpHints?: any } => {
  const ast = effectSchema.ast

  // Extract description from annotations
  const descriptionOpt = SchemaAST.getDescriptionAnnotation(ast)
  const description = previous?.description ?? (Option.isSome(descriptionOpt) ? descriptionOpt.value : undefined)

  // Detect optionality by analyzing the AST structure
  let optionality: Optionality<any>
  let unwrappedAst = ast

  if (previous?.optionality) {
    optionality = previous.optionality
  } else if (isOptionSchema(ast)) {
    // Schema.Option(T) - optional, returns Option.none() when omitted
    optionality = { _tag: `optional`, omittedValue: undefined }
    // Extract the underlying type from the Option transformation
    // The 'to' side of the transformation is the Option<T> type
    // We want to extract T from inside the Option
    const transformation = ast as SchemaAST.Transformation
    const toAst = transformation.to
    // The 'to' side might be a Transformation or Declaration wrapping the Option type
    // For help text purposes, we'll extract from the 'from' side's "Some" branch
    const fromUnion = transformation.from as SchemaAST.Union
    const someType = fromUnion.types.find((t) => {
      if (t._tag !== `TypeLiteral`) return false
      const typeLiteral = t as SchemaAST.TypeLiteral
      const tagProp = typeLiteral.propertySignatures.find((p) => p.name === `_tag`)
      if (!tagProp) return false
      const tagType = tagProp.type
      if (tagType._tag !== `Literal`) return false
      return (tagType as SchemaAST.Literal).literal === `Some`
    })
    if (someType && someType._tag === `TypeLiteral`) {
      const valueProp = (someType as SchemaAST.TypeLiteral).propertySignatures.find((p) => p.name === `value`)
      if (valueProp) {
        unwrappedAst = valueProp.type
      } else {
        unwrappedAst = toAst // fallback
      }
    } else {
      unwrappedAst = toAst // fallback
    }
  } else if (ast._tag === `Transformation`) {
    // Check if this is a transformation from UndefinedOr -> Type (indicates default pattern)
    const fromAst = (ast as SchemaAST.Transformation).from
    if (fromAst._tag === `Union` && hasUndefinedMember(fromAst as SchemaAST.Union)) {
      // This is a default value pattern (e.g., transform(UndefinedOr(Boolean), Boolean, ...))
      // We can't extract the actual default value from the transformation function,
      // but we can detect the pattern and mark it as having a default
      const defaultAnnotationOpt = SchemaAST.getDefaultAnnotation(ast)
      const defaultValue = Option.isSome(defaultAnnotationOpt) ? defaultAnnotationOpt.value : undefined
      optionality = { _tag: `default`, getValue: () => defaultValue }
      unwrappedAst = (ast as SchemaAST.Transformation).to
    } else {
      optionality = { _tag: `required` }
      unwrappedAst = (ast as SchemaAST.Transformation).to
    }
  } else if (ast._tag === `Union`) {
    const unionAst = ast as SchemaAST.Union
    const hasUndefined = hasUndefinedMember(unionAst)
    const hasNull = hasNullMember(unionAst)

    if (hasUndefined || hasNull) {
      // Schema.UndefinedOr(T), Schema.NullOr(T), or Schema.NullishOr(T)
      // Determine what value to return when the parameter is omitted
      const omittedValue = hasUndefined && !hasNull
        ? undefined // UndefinedOr - return undefined
        : !hasUndefined && hasNull
        ? null // NullOr - return null
        : undefined // NullishOr (both) - return undefined by convention
      optionality = { _tag: `optional`, omittedValue }
      // Remove both undefined and null members to get the underlying type
      unwrappedAst = removeNullishFromUnion(unionAst)
    } else {
      optionality = { _tag: `required` }
    }
  } else {
    optionality = { _tag: `required` }
  }

  // Extract schema type and help hints from unwrapped AST
  const { schemaType, refinements, displayType, priority } = extractSchemaTypeInfo(unwrappedAst)

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
 * Extract schema type information from an AST node.
 */
const extractSchemaTypeInfo = (
  ast: SchemaAST.AST,
): { schemaType: SchemaType; refinements: string[]; displayType: string; priority: number } => {
  // Handle refinements (wrapped types with constraints)
  if (ast._tag === `Refinement`) {
    return extractRefinementInfo(ast as SchemaAST.Refinement)
  }

  // Handle transformations by recursing into the 'to' type
  if (ast._tag === `Transformation`) {
    return extractSchemaTypeInfo((ast as SchemaAST.Transformation).to)
  }

  // Handle basic types
  if (ast._tag === `StringKeyword`) {
    return {
      schemaType: { _tag: `string` },
      refinements: [],
      displayType: `string`,
      priority: 1,
    }
  }

  if (ast._tag === `NumberKeyword`) {
    return {
      schemaType: { _tag: `number` },
      refinements: [],
      displayType: `number`,
      priority: 2,
    }
  }

  if (ast._tag === `BooleanKeyword`) {
    return {
      schemaType: { _tag: `boolean` },
      refinements: [],
      displayType: `boolean`,
      priority: 3,
    }
  }

  if (ast._tag === `Literal`) {
    const value = (ast as SchemaAST.Literal).literal
    return {
      schemaType: { _tag: `literal`, value },
      refinements: [],
      displayType: typeof value === `string` ? `'${value}'` : String(value),
      priority: 5,
    }
  }

  if (ast._tag === `Union`) {
    return extractUnionInfo(ast as SchemaAST.Union)
  }

  // Fallback for unknown types
  return {
    schemaType: { _tag: `string` },
    refinements: [],
    displayType: `unknown`,
    priority: 0,
  }
}

/**
 * Extract refinement information from a Refinement AST node.
 */
const extractRefinementInfo = (
  ast: SchemaAST.Refinement,
): { schemaType: SchemaType; refinements: string[]; displayType: string; priority: number } => {
  // Get the underlying type
  const baseInfo = extractSchemaTypeInfo(ast.from)

  // Extract refinement details from JSONSchema annotation
  const jsonSchemaOpt = SchemaAST.getJSONSchemaAnnotation(ast)

  if (Option.isNone(jsonSchemaOpt)) {
    return baseInfo
  }

  const jsonSchema = jsonSchemaOpt.value as any
  const refinements: string[] = [...baseInfo.refinements]

  // String refinements
  if (`minLength` in jsonSchema) {
    refinements.push(`min length: ${jsonSchema.minLength}`)
  }
  if (`maxLength` in jsonSchema) {
    refinements.push(`max length: ${jsonSchema.maxLength}`)
  }
  if (`pattern` in jsonSchema) {
    refinements.push(`pattern: ${jsonSchema.pattern}`)
  }

  // Number refinements
  if (`type` in jsonSchema && jsonSchema.type === `integer`) {
    refinements.push(`integer`)
  }
  if (`minimum` in jsonSchema && !(`exclusiveMinimum` in jsonSchema)) {
    refinements.push(`min: ${jsonSchema.minimum}`)
  }
  if (`maximum` in jsonSchema && !(`exclusiveMaximum` in jsonSchema)) {
    refinements.push(`max: ${jsonSchema.maximum}`)
  }
  if (`exclusiveMinimum` in jsonSchema) {
    refinements.push(`> ${jsonSchema.exclusiveMinimum}`)
  }
  if (`exclusiveMaximum` in jsonSchema) {
    refinements.push(`< ${jsonSchema.exclusiveMaximum}`)
  }
  if (`multipleOf` in jsonSchema) {
    refinements.push(`multiple of: ${jsonSchema.multipleOf}`)
  }

  return {
    ...baseInfo,
    refinements,
  }
}

/**
 * Extract information from a Union AST node.
 */
const extractUnionInfo = (
  ast: SchemaAST.Union,
): { schemaType: SchemaType; refinements: string[]; displayType: string; priority: number } => {
  // Check if all members are literals (enum-like)
  const allLiterals = ast.types.every((t) => t._tag === `Literal`)

  if (allLiterals) {
    const values = ast.types.map((t) => (t as SchemaAST.Literal).literal)
    const displayType = values.map((v) => (typeof v === `string` ? `'${v}'` : String(v))).join(` | `)

    return {
      schemaType: { _tag: `enum`, values },
      refinements: [],
      displayType,
      priority: 4,
    }
  }

  // Mixed union - extract each member
  const memberInfos = ast.types.map(extractSchemaTypeInfo)
  const displayType = memberInfos.map((m) => m.displayType).join(` | `)

  return {
    schemaType: { _tag: `union`, members: memberInfos.map((m) => m.schemaType) },
    refinements: [],
    displayType,
    priority: 0,
  }
}

/**
 * Build a Schema from an AST node.
 * This handles basic types and delegates to Schema.make for complex types.
 */
const buildSchemaFromAST = (ast: SchemaAST.AST): Schema.Schema.All => {
  // Handle basic keyword types
  switch (ast._tag) {
    case `StringKeyword`:
      return Schema.String
    case `NumberKeyword`:
      return Schema.Number
    case `BooleanKeyword`:
      return Schema.Boolean
    case `Literal`:
      // For literals, we need to use Schema.Literal with the actual value
      const literalValue = (ast as SchemaAST.Literal).literal
      return Schema.Literal(literalValue)
    default:
      // For complex types, use Schema.make to construct from AST
      return Schema.make(ast)
  }
}

/**
 * Check if this is a Schema.Option transformation.
 * Schema.Option creates a transformation from { _tag: "None" } | { _tag: "Some", value: T }
 */
const isOptionSchema = (ast: SchemaAST.AST): boolean => {
  if (ast._tag !== `Transformation`) return false

  const transformation = ast as SchemaAST.Transformation
  const fromAst = transformation.from

  // Check if the 'from' side is a TypeLiteral union with _tag discriminator
  // This is a heuristic - Schema.Option has a specific structure
  if (fromAst._tag === `Union`) {
    const union = fromAst as SchemaAST.Union
    // Look for { _tag: "None" } and { _tag: "Some", value: ... } pattern
    const hasNoneAndSome = union.types.some((t) => {
      if (t._tag !== `TypeLiteral`) return false
      const typeLiteral = t as SchemaAST.TypeLiteral
      // Check for _tag property with "None" or "Some" literal
      return typeLiteral.propertySignatures.some((p) => {
        if (p.name !== `_tag`) return false
        const type = p.type
        if (type._tag !== `Literal`) return false
        const literal = (type as SchemaAST.Literal).literal
        return literal === `None` || literal === `Some`
      })
    })
    return hasNoneAndSome
  }

  return false
}

/**
 * Check if a Union contains an UndefinedKeyword member.
 */
const hasUndefinedMember = (ast: SchemaAST.Union): boolean => {
  return ast.types.some((t) => t._tag === `UndefinedKeyword`)
}

/**
 * Check if a Union contains a null Literal member.
 * In Effect Schema, null is represented as Literal with literal: null
 */
const hasNullMember = (ast: SchemaAST.Union): boolean => {
  return ast.types.some((t) => t._tag === `Literal` && (t as SchemaAST.Literal).literal === null)
}

/**
 * Remove UndefinedKeyword and null Literal from a Union and return the remaining type.
 * Handles Schema.UndefinedOr, Schema.NullOr, and Schema.NullishOr patterns.
 */
const removeNullishFromUnion = (ast: SchemaAST.Union): SchemaAST.AST => {
  const nonNullishTypes = ast.types.filter((t) =>
    t._tag !== `UndefinedKeyword` && !(t._tag === `Literal` && (t as SchemaAST.Literal).literal === null)
  )

  // If no types remain (shouldn't happen), return the original
  if (nonNullishTypes.length === 0) {
    return ast
  }

  // If only one type remains, return it directly
  if (nonNullishTypes.length === 1) {
    return nonNullishTypes[0]!
  }

  // Otherwise, return a new union without undefined/null
  return SchemaAST.Union.make(nonNullishTypes, ast.annotations)
}
