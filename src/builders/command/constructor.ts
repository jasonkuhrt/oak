import { parse } from '../../executor/parse.js'
import type { SomeExtension } from '../../extension.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from '../../helpers.js'
import type { ParameterBasicInput } from '../../Parameter/basic.js'
import { Settings } from '../../Settings/_.ts'
import * as ExclusiveBuilder from '../exclusive/constructor.js'
import { ExclusiveBuilderStateSymbol } from '../exclusive/state.js'
import type { BuilderCommandState } from './state.js'
import { createState } from './state.js'
import type { CommandBuilder, RawArgInputs } from './types.js'

export const create = (): CommandBuilder => {
  return create_(createState())
}

const create_ = (state: BuilderCommandState): any => {
  // Cast to any internally - the type system tracks state transformations correctly
  // at the public API level, but the implementation is too complex for TS to verify
  const builder = {
    use: (extension: SomeExtension) => {
      const newState: BuilderCommandState = {
        ...state,
        extension,
      }
      return create_(newState)
    },
    description: (description: string) => {
      const newState = {
        ...state,
        newSettingsBuffer: [
          ...state.newSettingsBuffer,
          {
            description,
          },
        ],
      }
      return create_(newState)
    },
    settings: (newSettings: any) => {
      const newState = {
        ...state,
        newSettingsBuffer: [...state.newSettingsBuffer, newSettings],
      }
      return create_(newState)
    },
    parameter: (nameExpression: string, typeOrConfiguration: any) => {
      // Check if this is a schema or a configuration object
      // - Standard Schema V1 schemas (like Zod v4) have a '~standard' property and are objects
      // - Effect Schemas have an 'ast' property and are functions (classes)
      const isSchema = typeOrConfiguration
        && (typeof typeOrConfiguration === `object` || typeof typeOrConfiguration === `function`)
        && (`~standard` in typeOrConfiguration || `ast` in typeOrConfiguration)
      const configuration = isSchema
        ? { type: typeOrConfiguration }
        : typeOrConfiguration
      const prompt = configuration.prompt ?? null

      // Convert raw schema to OakSchema using extension
      if (!state.extension) {
        throw new Error(`No extension configured. Call .use() first (e.g., .use(Zod)).`)
      }
      const standardSchema = state.extension.toStandardSchema(configuration.type)
      const metadata = state.extension.extractMetadata?.(configuration.type) ?? {
        description: undefined,
        optionality: { _tag: `required` } as const,
        schema: { _tag: `string` } as const,
      }
      const oakSchema = {
        standardSchema,
        metadata,
      }

      const parameter: ParameterBasicInput = {
        _tag: `Basic`,
        type: oakSchema,
        nameExpression,
        prompt: prompt as any,
      }
      const newState = {
        ...state,
        parameterInputs: {
          ...state.parameterInputs,
          [nameExpression]: parameter,
        },
      }
      return create_(newState)
    },
    parametersExclusive: (label: string, builderContainer: any) => {
      const exclusiveBuilderState = builderContainer(ExclusiveBuilder.create(label, state))[ExclusiveBuilderStateSymbol]
      const newState = {
        ...state,
        parameterInputs: {
          ...state.parameterInputs,
          [label]: exclusiveBuilderState,
        },
      }
      return create_(newState)
    },
    parse: (argInputs?: RawArgInputs) => {
      const argInputsEnvironment = argInputs?.environment
        ? lowerCaseObjectKeys(argInputs.environment)
        : getLowerCaseEnvironment()
      state.settings = {
        ...Settings.getDefaults(argInputsEnvironment),
      }
      state.newSettingsBuffer.forEach((newSettings) =>
        Settings.change(state.settings!, newSettings, argInputsEnvironment)
      )
      return parse(state.settings, state.parameterInputs, argInputs as any)
    },
  }

  return builder as any
}
