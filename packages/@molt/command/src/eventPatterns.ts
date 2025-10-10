import type { Errors } from './Errors/index.js'
import type { ArgumentValue } from './executor/types.js'
import type { OpeningArgs } from './OpeningArgs/index.js'
import type { ParameterBasicData } from './Parameter/basic.js'
import type { Pattern } from './Pattern/Pattern.js'
import type { MoltSchema } from './schema/molt-schema.js'

export type EventPatternsInputAtLeastOne<$Schema extends MoltSchema> = 'optional' extends $Schema['metadata']['optionality']['_tag']
  ? Pattern<BasicParameterParseEvent, 'result'>
  : 'default' extends $Schema['metadata']['optionality']['_tag'] ? Pattern<BasicParameterParseEvent, 'result'>
  : Pattern<BasicParameterParseEventAccepted | BasicParameterParseEventRejected, 'result'>

export type EventPatternsInput<$Schema extends MoltSchema> = $Schema['metadata']['optionality']['_tag'] extends 'optional'
  ? Pattern<BasicParameterParseEvent, 'result'>
  : $Schema['metadata']['optionality']['_tag'] extends 'default' ? Pattern<BasicParameterParseEvent, 'result'>
  : Pattern<BasicParameterParseEventAccepted | BasicParameterParseEventRejected, 'result'>

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
