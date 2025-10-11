import type { EventPatternsInput } from '../eventPatterns.js'
import type { MoltSchema } from '../schema/molt-schema.js'
import type { ParameterBasic } from './basic.js'
import type { ParameterExclusive } from './exclusive.js'

export type Parameter = ParameterBasic | ParameterExclusive

export type Prompt<$Schema = unknown> =
  | null
  | boolean
  | {
    enabled?: boolean
    when?: EventPatternsInput<$Schema>
  }
