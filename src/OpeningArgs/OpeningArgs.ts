import { Alge } from 'alge'
import { Errors } from '../Errors/_.ts'
import { errorFromUnknown, groupBy } from '../lib/prelude.js'
import type { ParameterExclusive } from '../Parameter/exclusive.js'
import type { Parameter } from '../Parameter/types.js'
import * as SchemaRuntime from '../schema/schema-runtime.js'
import { Environment } from './Environment/_.ts'
import { Line } from './Line/_.ts'
import type { ArgumentReport, ParseResult } from './types.js'
export { Environment } from './Environment/_.ts'
export { Line } from './Line/_.ts'
export * from './types.js'

export const parse = ({
  parameters,
  line,
  environment,
}: {
  parameters: Parameter[]
  line: Line.RawInputs
  environment: Environment.RawInputs
}): ParseResult => {
  const result: ParseResult = {
    globalErrors: [],
    basicParameters: {},
    mutuallyExclusiveParameters: {},
  }
  const envParseResult = Environment.parse(environment, parameters)
  const lineParseResult = Line.parse(line, parameters)

  result.globalErrors.push(...lineParseResult.globalErrors, ...envParseResult.globalErrors)

  const specsByVariant = groupBy(parameters, `_tag`)

  const specVariantsBasic = specsByVariant.Basic ?? []

  /**
   * Handle "basic" parameters. This excludes "Exclusive Parameter Groups" which are handled later.
   */

  for (const parameter of specVariantsBasic) {
    /**
     * A note about types.
     *
     * The parse result of lines and environment arg inputs contains the associated spec
     * object. The results are generic and the spec variant is not known. In this loop we
     * deal with Basic spec variant only. Thus the args picked must be associated with
     * a Basic spec variant too. But the static type of arg.spec does not reflect this fact.
     * It has not been narrowed.
     *
     * No matter, we can just ignore the possibility to use arg.spec here anyways.
     */

    // todo, a strict mode where errors are NOT ignored from env parsing when line is present
    const argReport = lineParseResult.reports[parameter.name.canonical]
      ?? envParseResult.reports[parameter.name.canonical]

    /**
     * An opening argument was given. Process it.
     */

    if (argReport) {
      /**
       * If there were any errors during the input parsing phase then do not continue with the parameter.
       */
      if (argReport.errors.length > 0) {
        result.basicParameters[argReport.parameter.name.canonical] = {
          _tag: `error`,
          errors: argReport.errors,
          parameter,
        }
        continue
      }

      /**
       * Given a raw value was correctly passed, validate it according to the parameter spec.
       */
      result.basicParameters[argReport.parameter.name.canonical] = Alge.match(argReport.value)
        .boolean((argReportValue) => {
          return {
            _tag: `supplied` as const,
            parameter,
            value: argReportValue.negated ? !argReportValue.value : argReportValue.value,
          }
        })
        .else((argReportValue) => {
          // Note: OakSchema doesn't have transform, we just validate directly
          const validationResult = SchemaRuntime.validate(parameter.type, argReportValue.value)
          return Alge.match(validationResult)
            .Right((result) => {
              return {
                _tag: `supplied` as const,
                parameter: parameter,
                value: result.right as any, // Cast validated value to ArgumentValue
              }
            })
            .Left((result) => {
              return {
                _tag: `error` as const,
                parameter,
                errors: [
                  new Errors.ErrorInvalidArgument({
                    spec: parameter,
                    validationErrors: result.left.errors,
                    value: result.left.value,
                  }),
                ],
              }
            })
            .done()
        })
      continue
    }

    /**
     * No opening argument was given. Process this fact according to spec (e.g. ok b/c optional, apply default, ... etc.)
     */

    result.basicParameters[parameter.name.canonical] = Alge.match(parameter.type.metadata.optionality)
      .default((optionality) => {
        let defaultValue
        try {
          defaultValue = optionality.getValue()
        } catch (someError) {
          return {
            _tag: `error` as const,
            parameter,
            errors: [
              new Errors.ErrorFailedToGetDefaultArgument({
                spec: parameter,
                cause: errorFromUnknown(someError),
              }),
            ],
          }
        }
        return {
          _tag: `supplied` as const,
          parameter,
          value: defaultValue as any, // Cast default value to ArgumentValue
        }
      })
      .required(() => {
        return {
          _tag: `error` as const,
          parameter: parameter,
          errors: [new Errors.ErrorMissingArgument({ parameter })],
        }
      })
      .optional(() => {
        return {
          _tag: `omitted` as const,
          parameter,
        }
      })
      .done()
  }

  // todo this should be turned into a separate sub parser that just returns the object assigned to mutuallyExclusiveParameters
  /**
   * Handle exclusive parameter groups:
   *
   * 1. We must handle each group exactly once.
   * 2. If a group is optional and none of its parameters was given an arg then OK
   * 3. If a group is not optional and none of its parameters was given an arg then error
   * 4. If a group has more than one parameter with an arg then error
   * 5. If a group has exactly one parameter with an arg then OK
   */
  const exclusiveGroupSpecsByGroupLabel = groupBy(specsByVariant.Exclusive ?? [], (spec) => spec.group.label)

  for (const specs of Object.values(exclusiveGroupSpecsByGroupLabel)) {
    const group = specs[0]!.group
    const argsToGroup = specs
      .map((_) => lineParseResult.reports[_.name.canonical] ?? envParseResult.reports[_.name.canonical])
      .filter((_): _ is ArgumentReport<ParameterExclusive> => _ !== undefined)

    if (argsToGroup.length === 0) {
      if (group.optionality._tag === `optional`) {
        result.mutuallyExclusiveParameters[group.label] = {
          _tag: `omitted`,
          parameter: group,
        }
        continue
      }

      if (group.optionality._tag === `default`) {
        // Find the parameter that this default targets
        const tag = group.optionality.tag
        const parameter = specs.find((_) => _.name.canonical === tag)
        if (!parameter) {
          throw new Error(`Failed to find parameter for exclusive group default. This should be impossible.`)
        }
        // TODO handle error getting default?
        const defaultValue = group.optionality.getValue()
        if (defaultValue) {
          result.mutuallyExclusiveParameters[group.label] = {
            _tag: `supplied`,
            spec: group,
            parameter,
            value: {
              _tag: tag, // todo there wsa a bug here that was not captured by tests, add coverage.
              value: defaultValue,
            },
          }
          continue
        }
      }

      result.mutuallyExclusiveParameters[group.label] = {
        _tag: `error`,
        parameter: group,
        errors: [
          new Errors.ErrorMissingArgumentForMutuallyExclusiveParameters({
            group,
          }),
        ],
      }
      continue
    }

    if (argsToGroup.length > 1) {
      result.mutuallyExclusiveParameters[group.label] = {
        _tag: `error`,
        parameter: group,
        errors: [
          new Errors.ErrorArgumentsToMutuallyExclusiveParameters({
            offenses: argsToGroup.map((_) => ({ spec: _.parameter, arg: _ })),
          }),
        ],
      }
      continue
    }

    if (argsToGroup.length === 1) {
      const arg = argsToGroup[0]!

      // Check for errors during parsing
      if (arg.errors.length > 0) {
        result.mutuallyExclusiveParameters[group.label] = {
          _tag: `error`,
          parameter: group,
          errors: arg.errors,
        }
        continue
      }

      result.mutuallyExclusiveParameters[group.label] = {
        _tag: `supplied`,
        spec: group,
        parameter: arg.parameter,
        value: {
          _tag: arg.parameter.name.canonical,
          value: arg.value.value,
        },
      }
      continue
    }
  }

  return result
}
