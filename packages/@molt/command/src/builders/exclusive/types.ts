import type { InferOutput } from '../../schema/standard-schema.js'
import type { BuilderCommandState } from '../command/state.js'
import type { BuilderParameterExclusiveState, ExclusiveBuilderStateSymbol } from './state.js'

export interface ExclusiveParameterConfiguration<$State extends BuilderCommandState.Base> {
  schema: $State['Schema']
}

interface Parameter<$State extends BuilderCommandState.Base, Label extends string> {
  <NameExpression extends string, Configuration extends ExclusiveParameterConfiguration<$State>>(
    name: BuilderCommandState.ValidateNameExpression<$State, NameExpression>,
    configuration: Configuration,
  ): BuilderExclusiveInitial<
    BuilderCommandState.AddExclusiveParameter<$State, Label, NameExpression, Configuration>,
    Label
  >

  <NameExpression extends string>(
    name: BuilderCommandState.ValidateNameExpression<$State, NameExpression>,
    schema: any,
  ): any // Accept any extension schema type - runtime wraps via typeMapper
}

export interface BuilderExclusiveInitial<$State extends BuilderCommandState.Base, Label extends string> {
  [ExclusiveBuilderStateSymbol]: BuilderParameterExclusiveState<$State>
  parameter: Parameter<$State, Label>
  optional: () => BuilderExclusiveAfterOptional<BuilderCommandState.SetExclusiveOptional<$State, Label, true>>
  default: <Tag extends keyof $State['ParametersExclusive'][Label]['Parameters']>(
    tag: Tag,
    value: InferOutput<$State['ParametersExclusive'][Label]['Parameters'][Tag]['Schema']['standardSchema']>,
  ) => BuilderExclusiveAfterDefault<BuilderCommandState.SetExclusiveOptional<$State, Label, false>>
}

export type BuilderExclusiveAfterOptional<$State extends BuilderCommandState.Base> = {
  [ExclusiveBuilderStateSymbol]: BuilderParameterExclusiveState<$State>
}

export type BuilderExclusiveAfterDefault<$State extends BuilderCommandState.Base> = {
  [ExclusiveBuilderStateSymbol]: BuilderParameterExclusiveState<$State>
}

export interface SomeParameter<$State extends BuilderCommandState.Base> {
  (nameExpression: any, schema: $State['Schema']): any // eslint-disable-line
  (nameExpression: any, configuration: ExclusiveParameterConfiguration<$State>): any // eslint-disable-line
}

export type SomeBuilderExclusiveInitial<
  $State extends BuilderCommandState.Base = BuilderCommandState.BaseEmpty,
> = {
  [ExclusiveBuilderStateSymbol]: BuilderParameterExclusiveState<$State>
  parameter: SomeParameter<$State>
  optional: any // eslint-disable-line
  default: (tag: any, value: any) => any // eslint-disable-line
}

export type BuilderMutuallyExclusiveAfterOptional<$State extends BuilderCommandState.Base> =
  BuilderExclusiveAfterOptional<$State>

export type BuilderExclusive<$State extends BuilderCommandState.Base> =
  | SomeBuilderExclusiveInitial<$State>
  | BuilderMutuallyExclusiveAfterOptional<$State>
