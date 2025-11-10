import type { Pam } from '../lib/Pam/_.ts'

export type ArgumentValueMutuallyExclusive = {
  _tag: string
  value: Pam.Value
}

export type ArgumentValue = undefined | Pam.Value | ArgumentValueMutuallyExclusive
