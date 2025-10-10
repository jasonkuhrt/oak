import type { Effect } from 'effect'
import type { MoltSchema } from '../../../schema/molt-schema.js'
import type { InferOutput } from '../../../schema/standard-schema.js'
import type { Pam } from '../../Pam/index.js'
import type { PromptEngine } from '../../PromptEngine/PromptEngine.js'
import { Text } from '../../Text/index.js'

export interface Prompter {
  /**
   * Send output to the user.
   */
  say: (text: string) => void
  /**
   * Receive input from the user.
   * TODO remove prompt config from here.
   */
  ask: <$Schema extends MoltSchema>(params: {
    parameter: Pam.Parameter<$Schema>
    prompt: string
    question: string
    marginLeft?: number
  }) => Effect.Effect<never, never, InferOutput<$Schema['standardSchema']>>
}

export const create = (channels: PromptEngine.Channels): Prompter => {
  return {
    say: (value: string) => {
      channels.output(value + Text.chars.newline)
    },
    ask: (params) => {
      channels.output(params.question + Text.chars.newline)
      // TODO: Implement prompt functionality for MoltSchema
      // For now, return a simple prompt that reads a string
      throw new Error(`Prompting not yet implemented for MoltSchema`)
    },
  }
}
