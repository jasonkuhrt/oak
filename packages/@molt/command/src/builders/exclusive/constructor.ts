import type { Pam } from '../../lib/Pam/index.js'
import type { BuilderCommandState } from '../command/state.js'
import type { BuilderParameterExclusiveState } from './state.js'
import { createState, ExclusiveBuilderStateSymbol } from './state.js'
import type { SomeBuilderExclusiveInitial } from './types.js'

export const create = (label: string, commandState: BuilderCommandState): SomeBuilderExclusiveInitial => {
  return create_(commandState, createState(label))
}

const create_ = (
  commandState: BuilderCommandState,
  state: BuilderParameterExclusiveState,
): SomeBuilderExclusiveInitial => {
  const builder: SomeBuilderExclusiveInitial = {
    [ExclusiveBuilderStateSymbol]: state,
    parameter: (nameExpression: string, typeOrConfiguration) => {
      // Check if this is a schema (has ~standard property) or a configuration object
      // Standard Schema V1 schemas have a '~standard' property
      const isSchema = typeOrConfiguration && typeof typeOrConfiguration === 'object'
        && '~standard' in typeOrConfiguration
      const configuration = isSchema
        ? { type: typeOrConfiguration }
        : typeOrConfiguration

      // Convert raw schema to MoltSchema using extension
      if (!commandState.extension) {
        throw new Error('No extension configured. Call .use() first (e.g., .use(Zod)).')
      }
      const standardSchema = commandState.extension.toStandardSchema(configuration.type)
      const metadata = commandState.extension.extractMetadata?.(configuration.type) ?? {
        description: undefined,
        optionality: { _tag: `required` } as const,
        schema: { _tag: `string` } as const,
      }
      const moltSchema = {
        standardSchema,
        metadata,
      }

      const newState = {
        ...state,
        parameters: [
          ...state.parameters,
          {
            nameExpression,
            type: moltSchema,
          },
        ],
      }
      return create_(commandState, newState)
    },
    optional: () => {
      const newState = {
        ...state,
        optionality: { _tag: `optional` as const },
      }
      return create_(commandState, newState)
    },
    default: (tag: string, value: Pam.Value) => {
      const newState = {
        ...state,
        optionality: { _tag: `default` as const, tag, value },
      }
      return create_(commandState, newState)
    },
    // _: state,
  }

  return builder
}
