import type { InferOutput } from '../../schema/standard-schema.js'
import type { BuilderCommandState } from '../command/state.js'
import type { ApplyGuard } from '../command/types.js'
import type { BuilderParameterExclusiveState, ExclusiveBuilderStateSymbol } from './state.js'

export interface ExclusiveParameterConfiguration<$State extends BuilderCommandState.Base> {
  type: BuilderCommandState.Type<$State>
}

interface Parameter<$State extends BuilderCommandState.Base, Label extends string> {
  // TODO: Apply guard to configuration parameter (e.g., configuration: Configuration & { type: ApplyGuard<...> })
  <NameExpression extends string, Configuration extends ExclusiveParameterConfiguration<$State>>(
    name: BuilderCommandState.ValidateNameExpression<$State, NameExpression>,
    configuration: Configuration,
  ): BuilderExclusiveInitial<
    BuilderCommandState.AddExclusiveParameter<$State, Label, NameExpression, Configuration>,
    Label
  >

  <NameExpression extends string, $Schema extends BuilderCommandState.Type<$State>>(
    name: BuilderCommandState.ValidateNameExpression<$State, NameExpression>,
    type: ApplyGuard<$State, $Schema>,
  ): BuilderExclusiveInitial<
    BuilderCommandState.AddExclusiveParameter<$State, Label, NameExpression, { type: $Schema }>,
    Label
  >
}

export interface BuilderExclusiveInitial<$State extends BuilderCommandState.Base, Label extends string> {
  [ExclusiveBuilderStateSymbol]: BuilderParameterExclusiveState<$State>
  parameter: Parameter<$State, Label>
  optional: () => BuilderExclusiveAfterOptional<BuilderCommandState.SetExclusiveOptional<$State, Label, true>>
  default: <Tag extends keyof $State['ParametersExclusive'][Label]['Parameters']>(
    tag: Tag,
    value: InferOutput<$State['ParametersExclusive'][Label]['Parameters'][Tag]['Schema']>,
  ) => BuilderExclusiveAfterDefault<BuilderCommandState.SetExclusiveOptional<$State, Label, false>>
}

export type BuilderExclusiveAfterOptional<$State extends BuilderCommandState.Base> = {
  [ExclusiveBuilderStateSymbol]: BuilderParameterExclusiveState<$State>
}

export type BuilderExclusiveAfterDefault<$State extends BuilderCommandState.Base> = {
  [ExclusiveBuilderStateSymbol]: BuilderParameterExclusiveState<$State>
}

export interface SomeParameter<$State extends BuilderCommandState.Base> {
  (nameExpression: any, type: BuilderCommandState.Type<$State>): any
  (nameExpression: any, configuration: ExclusiveParameterConfiguration<$State>): any
}

export type SomeBuilderExclusiveInitial<
  $State extends BuilderCommandState.Base = BuilderCommandState.BaseEmpty,
> = {
  [ExclusiveBuilderStateSymbol]: BuilderParameterExclusiveState<$State>
  parameter: SomeParameter<$State>
  optional: any
  default: (tag: any, value: any) => any
}

export type BuilderMutuallyExclusiveAfterOptional<$State extends BuilderCommandState.Base> =
  BuilderExclusiveAfterOptional<$State>

export type BuilderExclusive<$State extends BuilderCommandState.Base> =
  | SomeBuilderExclusiveInitial<$State>
  | BuilderMutuallyExclusiveAfterOptional<$State>
