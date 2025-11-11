import type { Fn, Obj } from '@wollybeard/kit'
import type { SomeExtension } from '../../extension.js'
import type { Prompter } from '../../lib/Prompter/__.ts'
import type { OpeningArgs } from '../../OpeningArgs/_.ts'
import type { Prompt } from '../../Parameter/types.js'
import type { Settings } from '../../Settings/_.ts'
import type { ExclusiveBuilderStateSymbol } from '../exclusive/state.js'
import type { BuilderExclusive, BuilderExclusiveInitial } from '../exclusive/types.js'
import type { BuilderCommandState } from './state.js'

/**
 * Apply extension's guard HKT to validate schema at compile-time.
 * Returns the schema unchanged if valid, or Ts.Err.StaticError if invalid.
 * Defaults to pass-through when no extension is configured.
 */
// dprint-ignore
export type ApplyGuard<$State extends BuilderCommandState.Base, $Schema> =
  $State['Extension'] extends null
    ? $Schema // No extension = pass through
    : $State['Extension'] extends { guard: infer $Guard extends Fn.Kind.Kind }
      ? [Fn.Kind.Apply<$Guard, [$Schema]>] extends [never]
        ? $Schema
        : Fn.Kind.Apply<$Guard, [$Schema]>
      : $Schema // Fallback = pass through

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
      // Store the full extension (for accessing the guard)
      Extension: $Extension
    }>
  >
  description(this: void, description: string): CommandBuilder<$State>
  // TODO: Apply guard to configuration parameter (e.g., configuration: Configuration & { type: ApplyGuard<...> })
  parameter<NameExpression extends string, const Configuration extends ParameterConfiguration<$State>>(
    this: void,
    name: BuilderCommandState.ValidateNameExpression<$State, NameExpression>,
    configuration: Configuration,
  ): CommandBuilder<
    BuilderCommandState.AddParameter<
      $State,
      NameExpression,
      Obj.Replace<Configuration, { type: Configuration['type'] }>
    >
  >
  parameter<NameExpression extends string, $Schema extends $State['Schema']>(
    this: void,
    name: BuilderCommandState.ValidateNameExpression<$State, NameExpression>,
    type: ApplyGuard<$State, $Schema>,
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
