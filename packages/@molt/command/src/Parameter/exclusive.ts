import { Cli } from '@wollybeard/kit'
import { Alge } from 'alge'
import type { BuilderCommandState } from '../builders/command/state.js'
import { S } from '../deps/effect.js'
import type { Pam } from '../lib/Pam/index.js'
import type { MoltSchema } from '../schema/molt-schema.js'
import type { Settings } from '../Settings/index.js'
import { processEnvironment } from './helpers/environment.js'
import type { Environment } from './helpers/types.js'

export interface ParameterExclusiveInput<
  $State extends BuilderCommandState.Base = BuilderCommandState.BaseEmpty,
> {
  _tag: 'Exclusive'
  label: string
  optionality:
    | { _tag: 'required' }
    | { _tag: 'optional' }
    | { _tag: 'default'; tag: string; value: Pam.Value | (() => Pam.Value) }
  description?: string
  parameters: {
    nameExpression: string
    type: MoltSchema
  }[]
}

export interface ParameterExclusive {
  _tag: 'Exclusive'
  name: Cli.FlagName
  type: MoltSchema
  description: string | null
  environment: Environment
  group: ParameterExclusiveGroup
}

export interface ParameterExclusiveGroup {
  // _tag: 'Exclusive'
  label: string
  optionality: ParameterExclusiveOptionality
  parameters: Record<string, ParameterExclusive>
}

export type ParameterExclusiveOptionality =
  | { _tag: 'required' }
  | { _tag: 'optional' }
  | { _tag: 'default'; tag: string; getValue: () => Pam.Value }

export const parameterExclusiveCreate = (
  input: ParameterExclusiveInput,
  settings: Settings.Output,
): ParameterExclusive[] => {
  const parameters: ParameterExclusive[] = input.parameters.map((_) => {
    const name = S.decodeSync(Cli.FlagName.String)(_.nameExpression)
    const environment = processEnvironment(settings, name)
    return {
      _tag: `Exclusive`,
      description: _.type.metadata.description ?? null,
      type: _.type,
      environment,
      name,
      // See comment/code below: (1)
      group: null as any,
    }
  })

  /**
   * (1) Link up the group to each value and vice versa. Cannot do this in the above constructor since
   * it would create a copy of group for each value.
   */
  const group: ParameterExclusiveGroup = {
    label: input.label,
    // Input exclusive default allows default to be value or thunk,
    // while output is always thunk.
    optionality: Alge.match(input.optionality)
      .default(
        (_): ParameterExclusiveOptionality => ({
          _tag: `default`,
          tag: _.tag,
          getValue: () => (typeof _.value === `function` ? _.value() : _.value),
        }),
      )
      .else((_) => _),
    parameters: {},
  }

  parameters.forEach((_) => {
    _.group = group
    group.parameters[_.name.canonical] = _
  })

  return parameters
}
