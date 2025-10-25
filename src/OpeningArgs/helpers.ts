import { Cli, Str } from '@wollybeard/kit'
import { Either } from 'effect'
import type { Parameter } from '../Parameter/types.js'
import * as SchemaRuntime from '../schema/schema-runtime.js'
import type { Value } from './types.js'

export const parseSerializedValue = (name: string, serializedValue: string, spec: Parameter): Value => {
  const either = SchemaRuntime.deserialize(spec.type, serializedValue)

  if (Either.isLeft(either)) {
    // Preserve the actual validation error message from the schema
    throw either.left
  }
  // TODO make return unknown
  const value = either.right
  const type = typeof value
  if (type === `string`) return { _tag: `string`, value: value as string }
  if (type === `number`) return { _tag: `number`, value: value as number }
  if (type === `undefined`) return { _tag: `undefined`, value: undefined }
  if (type === `boolean`) {
    // dump(isEnvarNegated(name, spec))
    return { _tag: `boolean`, value: value as boolean, negated: isEnvarNegated(name, spec) }
  }
  throw new Error(`Supported type ${type}.`)
}

/**
 * Is the environment variable input negated? Unlike line input the environment can be
 * namespaced so a bit more work is needed to parse out the name pattern.
 *
 * Uses Cli.Arg to detect negation prefix pattern.
 */
export const isEnvarNegated = (name: string, spec: Parameter): boolean => {
  const nameWithNamespaceStripped = stripeNamespace(name, spec)
  // Use Cli.Arg to detect negation pattern (--no-* pattern in camelCase)
  const analyzed = Cli.Arg.analyze(`--${nameWithNamespaceStripped}`)
  return analyzed._tag === `long-flag` ? analyzed.negated : false
}

const stripeNamespace = (name: string, spec: Parameter): string => {
  for (const namespace of spec.environment?.namespaces ?? []) {
    if (name.startsWith(namespace)) return Str.Case.camel(name.slice(namespace.length))
  }
  return name
}
