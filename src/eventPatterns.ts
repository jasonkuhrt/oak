import type { Errors } from './Errors/_.ts'
import type { ArgumentValue } from './executor/types.js'
import type { OpeningArgs } from './OpeningArgs/_.ts'
import type { ParameterBasicData } from './Parameter/basic.js'
import type { Pattern } from './Pattern/Pattern.js'
import type { OakSchema } from './schema/oak-schema.js'

// Event patterns are runtime-only, so we accept any schema type
// At runtime, the actual OakSchema will be used for pattern matching
export type EventPatternsInputAtLeastOne<$Schema = unknown> = Pattern<BasicParameterParseEvent, 'result'>

export type EventPatternsInput<$Schema = unknown> = Pattern<BasicParameterParseEvent, 'result'>

export type BasicParameterParseEvent =
  | BasicParameterParseEventAccepted
  | BasicParameterParseEventRejected
  | BasicParameterParseEventOmitted

export interface BasicParameterParseEventOmitted {
  result: 'omitted'
  spec: ParameterBasicData
}

export interface BasicParameterParseEventAccepted {
  result: 'accepted'
  spec: ParameterBasicData
  value: ArgumentValue
}

export interface BasicParameterParseEventRejected {
  result: 'rejected'
  spec: ParameterBasicData
  error: Errors.ErrorMissingArgument['name'] | Errors.ErrorInvalidArgument['name']
}

export const createEvent = (parseResult: OpeningArgs.ParseResultBasic) => {
  const specData: ParameterBasicData = {
    ...parseResult.parameter,
    _tag: `BasicData` as const,
    optionality: parseResult.parameter.type.metadata.optionality[`_tag`],
  }
  // : {
  //     ...parseResult.spec,
  //     _tag: `UnionData` as const,
  //     optionality: parseResult.spec.optionality[`_tag`],
  //     types: parseResult.spec.types.map(({ zodType: _, ...rest }) => rest),
  //   }
  return parseResult._tag === `supplied`
    ? { result: `accepted`, spec: specData, value: parseResult.value }
    : parseResult._tag === `omitted`
    ? { result: `omitted`, spec: specData }
    : parseResult._tag === `error`
        && parseResult.errors.length > 0
        // If there are any other kinds of errors than the two named below then we do not, currently, support prompting for that case.
        && parseResult.errors.filter(
            (_) => [`ErrorInvalidArgument`, `ErrorMissingArgument`].includes(_.name) === false,
          ).length === 0
    // It is not possible to have invalid argument and missing argument errors at once.
    ? {
      result: `rejected`,
      spec: specData,
      error: parseResult.errors[0]!.name as `ErrorInvalidArgument` | `ErrorMissingArgument`,
    }
    : null
}

export const eventPatterns = {
  always: {},
  omitted: {
    result: `omitted`,
  },
  omittedWithoutDefault: {
    result: `omitted`,
    spec: {
      optionality: `optional`,
    },
  },
  omittedWithDefault: {
    result: `omitted`,
    spec: {
      optionality: `default`,
    },
  },
  rejectedMissingOrInvalid: {
    result: `rejected`,
    error: [`ErrorInvalidArgument`, `ErrorMissingArgument`],
  },
} satisfies Record<string, Pattern<BasicParameterParseEvent>>
