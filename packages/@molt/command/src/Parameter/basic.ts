import { Cli } from '@wollybeard/kit'
import type { BuilderCommandState } from '../builders/command/state.js'
import { S } from '../deps/effect.js'
import type { Pam } from '../lib/Pam/index.js'
import type { MoltSchema } from '../schema/molt-schema.js'
import type { Settings } from '../Settings/index.js'
import { processEnvironment } from './helpers/environment.js'
import type { Environment, Prompt } from './helpers/types.js'

export interface ParameterBasicInput<
  $State extends BuilderCommandState.Base = BuilderCommandState.BaseEmpty,
> {
  _tag: 'Basic'
  nameExpression: string
  type: MoltSchema
  prompt: Prompt<$State['Schema']>
}

export interface ParameterBasic extends Omit<Pam.Parameter, '_tag'> {
  _tag: 'Basic'
  environment: Environment
  prompt: Prompt
}

export const parameterBasicCreate = (
  input: ParameterBasicInput,
  settings: Settings.Output,
): ParameterBasic => {
  const name = S.decodeSync(Cli.FlagName.String)(input.nameExpression)
  const environment = processEnvironment(settings, name)
  const prompt = input.prompt as boolean | null | { enabled?: boolean; when?: object }
  const promptEnabled = prompt === true
    ? true
    : prompt === false
    ? false
    : prompt === null
    ? null
    : prompt.enabled ?? null
  const promptEnabledWhen = prompt === null ? null : typeof prompt === `object` ? prompt.when ?? null : null
  return {
    _tag: `Basic`,
    environment,
    name,
    prompt: {
      enabled: promptEnabled,
      when: promptEnabledWhen as any,
    },
    type: input.type,
  }
}

export type ParameterBasicData = Omit<ParameterBasic, '_tag'> & {
  _tag: 'BasicData'
  optionality: MoltSchema['metadata']['optionality']['_tag']
}
