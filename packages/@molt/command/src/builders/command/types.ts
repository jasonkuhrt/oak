import type { Obj } from '@wollybeard/kit'
import type { SomeExtension } from '../../extension.js'
import type { HKT } from '../../helpers.js'
import type { Prompter } from '../../lib/Prompter/Prompter.js'
import type { OpeningArgs } from '../../OpeningArgs/index.js'
import type { Prompt } from '../../Parameter/types.js'
import type { MoltSchema } from '../../schema/molt-schema.js'
import type { Settings } from '../../Settings/index.js'
import type { ExclusiveBuilderStateSymbol } from '../exclusive/state.js'
import type { BuilderExclusive, BuilderExclusiveInitial } from '../exclusive/types.js'
import type { BuilderCommandState } from './state.js'

export interface ParameterConfiguration<
  $State extends BuilderCommandState.Base = BuilderCommandState.BaseEmpty,
> {
  type: $State['Schema']
  prompt?: Prompt<this['type']>
}

export type IsHasKey<Obj extends object, Key> = Key extends keyof Obj ? true : false

export type IsPromptEnabledInParameterSettings<P extends ParameterConfiguration<any>> = IsHasKey<P, 'prompt'> extends
  false ? false
  : IsPromptEnabled<P['prompt']>

export type IsPromptEnabledInCommandSettings<P extends Settings.Input<any>> = IsHasKey<P, 'prompt'> extends false
  ? false
  : IsPromptEnabled<P['prompt']>

export type IsPromptEnabled<P extends Prompt<any> | undefined> = P extends undefined ? false
  : P extends false ? false
  : P extends true ? true
  : P extends null ? false
  : Exclude<P, undefined | boolean | null>['enabled'] extends false ? false
  : true

export interface CommandBuilder<$State extends BuilderCommandState.Base = BuilderCommandState.BaseEmpty> {
  use<$Extension extends SomeExtension>(
    extension: $Extension,
  ): CommandBuilder<
    Obj.Replace<$State, {
      // Store the extension's type constraint (e.g., z.ZodType) for compile-time validation
      Schema: $Extension extends { type: infer __type__ } ? __type__ : $State['Schema']
    }>
  >
  description(this: void, description: string): CommandBuilder<$State>
  parameter<NameExpression extends string, const Configuration extends ParameterConfiguration<$State>>(
    this: void,
    name: BuilderCommandState.ValidateNameExpression<$State, NameExpression>,
    configuration: Configuration,
  ): CommandBuilder<BuilderCommandState.AddParameter<$State, NameExpression, Configuration>>
  parameter<NameExpression extends string, $Schema extends $State['Schema']>(
    this: void,
    name: BuilderCommandState.ValidateNameExpression<$State, NameExpression>,
    type: $Schema,
  ): CommandBuilder<BuilderCommandState.AddParameter<$State, NameExpression, { type: $Schema }>>
  parametersExclusive<Label extends string, $BuilderExclusive extends BuilderExclusive<$State>>(
    this: void,
    label: Label,
    ExclusiveBuilderContainer: (builder: BuilderExclusiveInitial<$State, Label>) => $BuilderExclusive,
  ): CommandBuilder<$BuilderExclusive[ExclusiveBuilderStateSymbol]['commandBuilderState']>
  settings<S extends Settings.Input<$State>>(
    this: void,
    newSettings: S,
  ): CommandBuilder<
    Obj.Replace<$State, {
      IsPromptEnabled: $State['IsPromptEnabled'] extends true ? true : IsPromptEnabledInCommandSettings<S>
    }>
  >
  parse(this: void, inputs?: RawArgInputs): BuilderCommandState.ToArgs<$State>
}

export type RawArgInputs = {
  line?: OpeningArgs.Line.RawInputs
  environment?: OpeningArgs.Environment.RawInputs
  tty?: Prompter
}

export type SomeArgsNormalized = Record<string, unknown>
