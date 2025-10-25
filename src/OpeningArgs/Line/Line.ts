import { Cli } from '@wollybeard/kit'
import { Errors } from '../../Errors/index.js'
import type { Index } from '../../lib/prelude.js'
import { findByName, isOrHasType } from '../../Parameter/helpers/CommandParameter.js'
import type { Parameter } from '../../Parameter/types.js'
import { parseSerializedValue } from '../helpers.js'
import type { ArgumentReport } from '../types.js'

export type RawInputs = string[]

export type GlobalParseErrors = Errors.Global.ErrorUnknownFlag

export type LocalParseErrors = Errors.ErrorMissingArgument | Errors.ErrorDuplicateLineArg | Errors.ErrorInvalidArgument

interface ParsedInputs {
  globalErrors: GlobalParseErrors[]
  reports: Index<ArgumentReport>
}

/**
 * Parse line input into an intermediary representation that is suited to comparison against
 * the parameter specs.
 */
export const parse = (rawLineInputs: RawInputs, parameters: Parameter[]): ParsedInputs => {
  const globalErrors: GlobalParseErrors[] = []

  const rawLineInputsPrepared = rawLineInputs.flatMap((lineInput) => {
    // Skip standalone equals
    if (lineInput.trim() === `=`) return []

    const analyzed = Cli.Arg.analyze(lineInput.trim())

    // Handle short flag clusters (e.g., -abc → [-a, -b, -c])
    if (analyzed._tag === `short-flag-cluster`) {
      return analyzed.flags.flatMap((flag) => {
        if (flag.value !== null && flag.value !== ``) {
          // Split flag and value into separate tokens
          return [flag.original.split(`=`)[0]!, flag.value]
        }
        return [flag.original]
      })
    }

    // Handle flags with values (e.g., --foo=bar → [--foo, bar])
    if ((analyzed._tag === `long-flag` || analyzed._tag === `short-flag`) && analyzed.value !== null) {
      // Preserve molt's behavior of dropping empty values
      if (analyzed.value === ``) return [analyzed.original.split(`=`)[0]!]
      return [analyzed.original.split(`=`)[0]!, analyzed.value]
    }

    // Pass through everything else unchanged
    return [lineInput]
  })

  const reports: Index<ArgumentReport> = {}

  let currentReport: null | ArgumentReport = null

  const finishPendingReport = (pendingReport: ArgumentReport) => {
    if (pendingReport.value === PENDING_VALUE) {
      /**
       * We have gotten something like this: --foo --bar.
       * We are parsing "foo". Its spec could be a union containing a boolean or just a straight up boolean, or something else.
       * If union with boolean or boolean then we interpret foo argument as being a boolean.
       * Otherwise it is an error.
       */
      if (isOrHasType(pendingReport.parameter, `TypeBoolean`)) {
        pendingReport.value = {
          value: true,
          _tag: `boolean`,
          negated: pendingReport.source._tag === `line` ? pendingReport.source.negated : false,
        }
      } else {
        pendingReport.errors.push(new Errors.ErrorMissingArgument({ parameter: pendingReport.parameter }))
      }
    }
  }

  // Do processing

  for (const rawLineInput of rawLineInputsPrepared) {
    const analyzed = Cli.Arg.analyze(rawLineInput)

    if (analyzed._tag === `long-flag` || analyzed._tag === `short-flag`) {
      if (currentReport) {
        finishPendingReport(currentReport)
        currentReport = null
      }

      // analyzed.name is already camelCase with negation prefix stripped (if applicable)
      const parameter = findByName(analyzed.name, parameters)
      if (!parameter) {
        globalErrors.push(new Errors.Global.ErrorUnknownFlag({ flagName: analyzed.name }))
        continue
      }

      const existing = reports[parameter.name.canonical]
      if (existing) {
        // TODO Handle once we support multiple values (arrays).
        // TODO richer structured info about the duplication. For example if
        // duplicated across aliases, make it easy to report a nice message explaining that.
        existing.errors.push(
          new Errors.ErrorDuplicateLineArg({
            parameter,
            flagName: analyzed.name,
          }),
        )
        continue
      }

      currentReport = {
        parameter,
        errors: [],
        value: PENDING_VALUE,
        source: {
          _tag: `line`,
          name: analyzed.name,
          negated: analyzed._tag === `long-flag` ? analyzed.negated : false,
        },
      }

      reports[parameter.name.canonical] = currentReport

      continue
    } else if (currentReport) {
      try {
        currentReport.value = parseSerializedValue(
          currentReport.parameter.name.canonical,
          rawLineInput,
          currentReport.parameter,
        )
      } catch (error) {
        // Validation errors during deserialization are captured here and wrapped in ErrorInvalidArgument
        const errorMessage = error instanceof Error
          ? error.message.replace(/^Deserialization failed: /, ``)
          : String(error)
        currentReport.errors.push(
          new Errors.ErrorInvalidArgument({
            spec: currentReport.parameter,
            validationErrors: [errorMessage],
            value: rawLineInput,
          }),
        )
      }
      currentReport = null
      continue
    } else {
      // TODO We got an argument without a flag, we should report an error? Or just ignore?
    }
  }

  if (currentReport) {
    finishPendingReport(currentReport)
    currentReport = null
  }

  return {
    globalErrors,
    reports,
  }
}

const PENDING_VALUE = `__PENDING__` as any
