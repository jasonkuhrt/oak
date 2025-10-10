import type { Name } from '@molt/name'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { Obj, Ts } from '@wollybeard/kit'
import type { SomeExtension } from '../../extension.js'
import type { Values } from '../../helpers.js'
import type { HKT } from '../../helpers.js'
import type { ParameterBasicInput } from '../../Parameter/basic.js'
import type { ParameterExclusiveInput } from '../../Parameter/exclusive.js'
import type { Prompt } from '../../Parameter/types.js'
import type { MoltSchema } from '../../schema/molt-schema.js'
import type { InferOutput } from '../../schema/standard-schema.js'
import type { Settings } from '../../Settings/index.js'
import type { ExclusiveParameterConfiguration } from '../exclusive/types.js'
import type { IsPromptEnabledInParameterSettings, ParameterConfiguration } from './types.js'

export const createState = (): BuilderCommandState => {
  return {
    extension: null,
    newSettingsBuffer: [],
    settings: null,
    parameterInputs: {},
  }
}

export interface BuilderCommandState {
  extension: SomeExtension | null
  settings: null | Settings.Output
  newSettingsBuffer: Settings.Input[]
  parameterInputs: Record<string, ParameterBasicInput | ParameterExclusiveInput>
}

export namespace BuilderCommandState {
  export interface BaseEmpty extends Base {
    IsPromptEnabled: false
    ParametersExclusive: {} // eslint-disable-line
    Parameters: {} // eslint-disable-line
    Schema: StandardSchemaV1
  }

  export type Base = {
    IsPromptEnabled: boolean
    Schema: unknown // The constraint type from the extension (e.g., z.ZodType)
    ParametersExclusive: {
      [label: string]: {
        Optional: boolean
        Parameters: {
          [canonicalName: string]: {
            NameParsed: Name.Data.NameParsed
            NameUnion: string
            Schema: StandardSchemaV1 // Always store Standard Schema V1
          }
        }
      }
    }
    Parameters: {
      [nameExpression: string]: {
        NameParsed: Name.Data.NameParsed
        NameUnion: string
        Schema: StandardSchemaV1 // Always store Standard Schema V1
      }
    }
  }

  type ReservedParameterNames = 'help' | 'h'

  export type ValidateNameExpression<State extends Base, NameExpression extends string> = Name.Data.IsParseError<
    Name.Parse<NameExpression, { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>
  > extends true ? Name.Parse<NameExpression, { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>
    : NameExpression

  export type GetUsedNames<State extends Base> = Values<State['Parameters']>['NameUnion']

  export type ParametersConfigBase = Record<
    string,
    {
      type: ParameterConfiguration['type']
      prompt?: Prompt<any>
    }
  >

  export type SetExclusiveOptional<
    $State extends Base,
    Label extends string,
    Value extends boolean,
  > = Obj.Replace<$State, {
    ParametersExclusive:
      & $State['ParametersExclusive']
      & {
        [_ in Label]: {
          Optional: Value
          Parameters: $State['ParametersExclusive'][_]['Parameters']
        }
      }
  }>

  export type SetIsPromptEnabled<$State extends Base, value extends boolean> = Obj.Replace<$State, {
    IsPromptEnabled: $State['IsPromptEnabled'] extends true ? true : value
  }>

  export type AddParameter<
    $State extends Base,
    NameExpression extends string,
    Configuration extends ParameterConfiguration<$State>,
  > = Obj.Replace<$State, {
    Parameters:
      & $State['Parameters']
      & {
        [_ in NameExpression]: CreateParameter<$State, NameExpression, Configuration>
      }
    IsPromptEnabled: $State['IsPromptEnabled'] extends true ? true : IsPromptEnabledInParameterSettings<Configuration>
  }>

  export type AddExclusiveParameter<
    $State extends Base,
    Label extends string,
    NameExpression extends string,
    Configuration extends ExclusiveParameterConfiguration<$State>,
  > = Obj.Replace<$State, {
    ParametersExclusive:
      & $State['ParametersExclusive']
      & {
        [_ in Label]: {
          Optional: $State['ParametersExclusive'][_]['Optional']
          Parameters: {
            [_ in NameExpression as Name.Data.GetCanonicalNameOrErrorFromParseResult<Name.Parse<NameExpression>>]: {
              // Store the schema as StandardSchemaV1 to extract Output type
              Schema: Configuration['type'] extends StandardSchemaV1 ? Configuration['type'] : never
              NameParsed: Name.Parse<
                NameExpression,
                { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }
              >
              NameUnion: Name.Data.GetNamesFromParseResult<
                Name.Parse<NameExpression, { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }>
              >
            }
          }
        }
      }
  }>

  export type CreateParameter<
    $State extends Base,
    NameExpression extends string,
    Configuration extends ParameterConfiguration<$State>,
  > = {
    // Store the schema as StandardSchemaV1 to extract Output type
    // Configuration['type'] is constrained to be a StandardSchemaV1
    Schema: Configuration['type'] extends StandardSchemaV1 ? Configuration['type'] : never
    NameParsed: Name.Parse<NameExpression, { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }>
    NameUnion: Name.Data.GetNamesFromParseResult<
      Name.Parse<NameExpression, { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }>
    >
  }

  export type ToArgs<$State extends Base> = $State['IsPromptEnabled'] extends true ? Promise<ToArgs_<$State>>
    : ToArgs_<$State>

  type ToArgs_<$State extends Base> = Ts.Simplify<
    & {
      [Name in keyof $State['Parameters'] & string as $State['Parameters'][Name]['NameParsed']['canonical']]:
        InferOutput<$State['Parameters'][Name]['Schema']>
    }
    & {
      [Label in keyof $State['ParametersExclusive'] & string]:
        | Ts.Simplify<
          Values<
            {
              [Name in keyof $State['ParametersExclusive'][Label]['Parameters']]: {
                _tag: $State['ParametersExclusive'][Label]['Parameters'][Name]['NameParsed']['canonical']
                value: InferOutput<$State['ParametersExclusive'][Label]['Parameters'][Name]['Schema']>
              }
            }
          >
        >
        | ($State['ParametersExclusive'][Label]['Optional'] extends true ? undefined : never)
    }
  >

  export type ToTypes<$State extends BuilderCommandState.Base> = {
    [K in keyof $State['Parameters'] & string as $State['Parameters'][K]['NameParsed']['canonical']]:
      $State['Parameters'][K]['Schema']
  }
}
