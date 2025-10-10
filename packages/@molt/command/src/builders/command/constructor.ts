import { parse } from '../../executor/parse.js'
import type { SomeExtension } from '../../extension.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from '../../helpers.js'
import type { ParameterBasicInput } from '../../Parameter/basic.js'
import { Settings } from '../../Settings/index.js'
import * as ExclusiveBuilder from '../exclusive/constructor.js'
import { ExclusiveBuilderStateSymbol } from '../exclusive/state.js'
import type { BuilderCommandState } from './state.js'
import { createState } from './state.js'
import type { CommandBuilder, ParameterConfiguration, RawArgInputs } from './types.js'

export const create = (): CommandBuilder => {
  return create_(createState())
}

const create_ = (state: BuilderCommandState): CommandBuilder => {
  // Cast to any internally - the type system tracks state transformations correctly
  // at the public API level, but the implementation is too complex for TS to verify
  const builder: CommandBuilder = {
    use: (extension) => {
      const newState: BuilderCommandState = {
        ...state,
        extension,
        typeMapper: (schema: unknown) => {
          const standardSchema = extension.toStandardSchema(schema)
          const metadata = extension.extractMetadata?.(schema) ?? {
            description: undefined,
            optionality: { _tag: `required` },
          }
          return {
            standardSchema,
            metadata,
          }
        },
      }
      return create_(newState)
    },
    description: (description) => {
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
    settings: (newSettings) => {
      const newState = {
        ...state,
        newSettingsBuffer: [...state.newSettingsBuffer, newSettings],
      }
      return create_(newState)
    },
    parameter: (nameExpression, typeOrConfiguration: any) => {
      const configuration = `type` in typeOrConfiguration
        ? typeOrConfiguration
        : { type: typeOrConfiguration }
      const prompt = configuration.prompt ?? null
      const schema = state.typeMapper(configuration.type)
      const parameter: ParameterBasicInput = {
        _tag: `Basic`,
        type: schema,
        nameExpression,
        prompt: prompt as any, // eslint-disable-line
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
    parametersExclusive: (label, builderContainer) => {
      const exclusiveBuilderState = builderContainer(ExclusiveBuilder.create(label, state))[ExclusiveBuilderStateSymbol] // eslint-disable-line
      const newState = {
        ...state,
        parameterInputs: {
          ...state.parameterInputs,
          [label]: exclusiveBuilderState, // eslint-disable-line
        },
      }
      return create_(newState)
    },
    parse: (argInputs) => {
      const argInputsEnvironment = argInputs?.environment
        ? lowerCaseObjectKeys(argInputs.environment)
        : getLowerCaseEnvironment()
      state.settings = {
        ...Settings.getDefaults(argInputsEnvironment),
      }
      state.newSettingsBuffer.forEach((newSettings) =>
        Settings.change(state.settings!, newSettings, argInputsEnvironment)
      )
      state.settings.typeMapper = state.typeMapper
      return parse(state.settings, state.parameterInputs, argInputs)
    },
  } as any

  return builder
}

//
// Internal Types
// (Not needed - using CommandBuilder directly)
//
