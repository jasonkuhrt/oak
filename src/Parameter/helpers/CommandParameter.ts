import { Either } from 'effect'
import { stripeNegatePrefix } from '../../helpers.js'
import * as SchemaRuntime from '../../schema/schema-runtime.js'
import type { Parameter } from '../types.js'

export const validate = <T>(parameter: Parameter, value: unknown) => {
  if (parameter.type.metadata.optionality._tag === `optional` && value === undefined) {
    // Use the omittedValue if specified (e.g., null for NullOr schemas)
    const result = parameter.type.metadata.optionality.omittedValue ?? value
    return Either.right(result as T)
  }
  return SchemaRuntime.validate(parameter.type, value) as any
}

export const findByName = (name: string, specs: Parameter[]): null | Parameter => {
  for (const spec of specs) {
    const result = hasName(spec, name)
    if (result !== null) return spec
  }
  return null
}

/**
 * Get all the names of a parameter in array form.
 */
export const getNames = (parameter: Parameter): [string, ...string[]] => {
  return [
    ...parameter.name.aliases.long,
    ...parameter.name.aliases.short,
    ...(parameter.name.long === null ? [] : [parameter.name.long]),
    ...(parameter.name.short === null ? [] : [parameter.name.short]),
  ] as [string, ...string[]]
}

type NameHit =
  | {
    kind: 'long' | 'longAlias'
    /**
     * Was the given name in negated format? e.g. noFoo instead of foo
     */
    negated: boolean
  }
  | {
    kind: 'short' | 'shortAlias'
  }

/**
 * Is one of the parameter's names the given name?
 */
export const hasName = (parameter: Parameter, name: string): null | NameHit => {
  const result = parameterSpecHasNameDo(parameter, name, false)

  if (isOrHasType(parameter, `TypeBoolean`)) {
    const nameWithoutNegatePrefix = stripeNegatePrefix(name)
    if (nameWithoutNegatePrefix) {
      return parameterSpecHasNameDo(parameter, nameWithoutNegatePrefix, true)
    }
  }

  return result
}

export const isOrHasType = (parameter: Parameter, typeTag: string): boolean => {
  const schema = parameter.type.metadata.schema

  // Convert typeTag to schema _tag format (e.g., 'TypeBoolean' -> 'boolean')
  const schemaTag = typeTag.replace(`Type`, ``).toLowerCase()

  // Check if this schema is the target type
  if (schema._tag === schemaTag) {
    return true
  }

  // For union types, check if any member is the target type
  if (schema._tag === `union`) {
    return schema.members.some((member) => {
      if (member._tag === schemaTag) {
        return true
      }
      // Recursively check nested unions
      if (member._tag === `union`) {
        return member.members.some((m) => m._tag === schemaTag)
      }
      return false
    })
  }

  return false
}

const parameterSpecHasNameDo = (
  parameter: Parameter,
  name: string,
  negated: boolean,
): null | { kind: 'long' | 'longAlias'; negated: boolean } | { kind: 'short' | 'shortAlias' } => {
  return parameter.name.long === name
    ? { kind: `long`, negated }
    : parameter.name.aliases.long.includes(name)
    ? { kind: `longAlias`, negated }
    // Short names cannot be negated currently so short circuit with the negated check.
    : parameter.name.short === name
    ? { kind: `short` }
    : parameter.name.aliases.short.includes(name)
    ? { kind: `shortAlias` }
    : null
}
