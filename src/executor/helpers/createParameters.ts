import { Alge } from 'alge'
import { Either } from 'effect'
import type { ParameterBasic, ParameterBasicInput } from '../../Parameter/basic.js'
import { parameterBasicCreate } from '../../Parameter/basic.js'
import type { ParameterExclusive, ParameterExclusiveInput } from '../../Parameter/exclusive.js'
import { parameterExclusiveCreate } from '../../Parameter/exclusive.js'
import type { Parameter } from '../../Parameter/types.js'
import type { OakSchema } from '../../schema/oak-schema.js'
import type { Settings } from '../../Settings/_.ts'

/**
 * Process the spec input into a normalized spec.
 */
export const createParameters = (
  inputs: Record<string, ParameterBasicInput | ParameterExclusiveInput>,
  settings: Settings.Output,
): Parameter[] => {
  const inputsWithHelp: Record<string, ParameterBasicInput | ParameterExclusiveInput> = settings.help
    ? {
      ...inputs,
      '-h --help': helpParameter,
    }
    : inputs
  const outputs = Object.values(inputsWithHelp).flatMap((input): (ParameterBasic | ParameterExclusive)[] =>
    Alge.match(input)
      .Basic((input) => [parameterBasicCreate(input, settings)])
      .Exclusive((input) => parameterExclusiveCreate(input, settings))
      .done()
  )

  // dump({ outputs })
  return outputs
}

// Simple boolean schema for the built-in help parameter
const booleanSchema: OakSchema<boolean, boolean> = {
  standardSchema: {
    '~standard': {
      version: 1,
      vendor: `oak`,
      validate: (value) => {
        if (typeof value === `boolean`) {
          return { value }
        }
        if (value === `true` || value === `1`) {
          return { value: true }
        }
        if (value === `false` || value === `0`) {
          return { value: false }
        }
        return {
          issues: [{ message: `Expected boolean value` }],
        }
      },
    },
  },
  metadata: {
    description: undefined,
    optionality: { _tag: `default`, getValue: () => false },
    schema: { _tag: `boolean` },
    helpHints: {
      displayType: `boolean`,
      priority: 3,
    },
  },
}

const helpParameter: ParameterBasicInput = {
  _tag: `Basic`,
  type: booleanSchema,
  nameExpression: `-h --help`,
  prompt: false as any,
}
