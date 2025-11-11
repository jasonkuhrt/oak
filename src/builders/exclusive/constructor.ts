import type { Pam } from '../../lib/Pam/_.ts'
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
    parameter: (nameExpression: string, schemaOrConfig) => {
      // Check if this is a schema (has ~standard property) or a configuration object
      // Standard Schema V1 schemas have a '~standard' property
      const isSchema = schemaOrConfig && typeof schemaOrConfig === `object`
        && `~standard` in schemaOrConfig
      const configuration: any = isSchema
        ? { type: schemaOrConfig }
        : schemaOrConfig

      // Convert raw schema to OakSchema using extension
      if (!commandState.extension) {
        throw new Error(`No extension configured. Call .use() first (e.g., .use(Zod)).`)
      }
      const standardSchema = commandState.extension.toStandardSchema(configuration.type)
      const metadata = commandState.extension.extractMetadata?.(configuration.type) ?? {
        description: undefined,
        optionality: { _tag: `required` } as const,
        schema: { _tag: `string` } as const,
      }
      const oakSchema = {
        standardSchema,
        metadata,
      }

      const newState = {
        ...state,
        parameters: [
          ...state.parameters,
          {
            nameExpression,
            type: oakSchema,
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
