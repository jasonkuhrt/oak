import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { Name } from '@molt/name'
import type { Objects, Pipe } from 'hotscript'
import type { Simplify } from 'type-fest'
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
    typeMapper: (type) => type as any,
    newSettingsBuffer: [],
    settings: null,
    parameterInputs: {},
  }
}

export interface BuilderCommandState {
  extension: SomeExtension | null
  typeMapper: (value: unknown) => MoltSchema
  settings: null | Settings.Output
  newSettingsBuffer: Settings.Input[]
  parameterInputs: Record<string, ParameterBasicInput | ParameterExclusiveInput>
}

export namespace BuilderCommandState {
  /**
   * Type mapper for extension-specific schemas.
   *
   * This HKT maps input types to themselves for type-level inference.
   * At RUNTIME, the actual typeMapper function wraps schemas in MoltSchema,
   * but at the TYPE level we keep the raw schema type for InferOutput to work.
   */
  export interface TypeMapper<$Type = unknown> extends HKT.Fn {
    params: $Type
    // Return the input type as-is for type-level inference
    // Runtime behavior is defined in constructor
    return: $Type
  }

  export interface BaseEmpty extends Base {
    IsPromptEnabled: false
    ParametersExclusive: {} // eslint-disable-line
    Parameters: {} // eslint-disable-line
    Type: StandardSchemaV1
    Schema: StandardSchemaV1
    TypeMapper: TypeMapper<StandardSchemaV1>
  }

  export type Base = {
    IsPromptEnabled: boolean
    Type: unknown
    Schema: unknown
    TypeMapper: TypeMapper<unknown>
    ParametersExclusive: {
      [label: string]: {
        Optional: boolean
        Parameters: {
          [canonicalName: string]: {
            NameParsed: Name.Data.NameParsed
            NameUnion: string
            Schema: unknown
          }
        }
      }
    }
    Parameters: {
      [nameExpression: string]: {
        NameParsed: Name.Data.NameParsed
        NameUnion: string
        Schema: unknown
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
  > = Pipe<$State, [
    Objects.Update<
      'ParametersExclusive',
      Objects.Assign<
        {
          [_ in Label]: {
            Optional: Value
            Parameters: $State['ParametersExclusive'][_]['Parameters']
          }
        }
      >
    >,
  ]>

  export type SetIsPromptEnabled<$State extends Base, value extends boolean> = Pipe<
    $State,
    [Objects.Update<'IsPromptEnabled', $State['IsPromptEnabled'] extends true ? true : value>]
  >

  export type AddParameter<
    $State extends Base,
    NameExpression extends string,
    Configuration extends ParameterConfiguration<$State>,
  > = Pipe<
    $State,
    [
      Objects.Update<
        'Parameters',
        Objects.Assign<
          {
            [_ in NameExpression]: CreateParameter<$State, NameExpression, Configuration>
          }
        >
      >,
      Objects.Update<
        'IsPromptEnabled',
        $State['IsPromptEnabled'] extends true ? true : IsPromptEnabledInParameterSettings<Configuration>
      >,
    ]
  >

  export type AddExclusiveParameter<
    $State extends Base,
    Label extends string,
    NameExpression extends string,
    Configuration extends ExclusiveParameterConfiguration<$State>,
  > = Pipe<$State, [
    Objects.Update<
      'ParametersExclusive',
      Objects.Assign<
        & $State['ParametersExclusive']
        & {
          [_ in Label]: {
            Optional: $State['ParametersExclusive'][_]['Optional']
            Parameters: {
              [_ in NameExpression as Name.Data.GetCanonicalNameOrErrorFromParseResult<Name.Parse<NameExpression>>]: {
                Schema: HKT.Call<$State['TypeMapper'], Configuration['type']>
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
      >
    >,
  ]>

  export type CreateParameter<
    $State extends Base,
    NameExpression extends string,
    Configuration extends ParameterConfiguration<$State>,
  > = {
    Schema: HKT.Call<$State['TypeMapper'], Configuration['type']>
    NameParsed: Name.Parse<NameExpression, { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }>
    NameUnion: Name.Data.GetNamesFromParseResult<
      Name.Parse<NameExpression, { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }>
    >
  }

  export type ToArgs<$State extends Base> = $State['IsPromptEnabled'] extends true ? Promise<ToArgs_<$State>>
    : ToArgs_<$State>

  type ToArgs_<$State extends Base> = Simplify<
    & {
      [Name in keyof $State['Parameters'] & string as $State['Parameters'][Name]['NameParsed']['canonical']]:
        InferOutput<$State['Parameters'][Name]['Schema']>
    }
    & {
      [Label in keyof $State['ParametersExclusive'] & string]:
        | Simplify<
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
