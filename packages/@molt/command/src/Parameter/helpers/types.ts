import type { EventPatternsInput } from '../../eventPatterns.js'
import type { MoltSchema } from '../../schema/molt-schema.js'

export type Environment = null | { enabled: boolean; namespaces: string[] }

export type Prompt<$Schema = unknown> = {
  enabled: boolean | null
  when: EventPatternsInput<$Schema> | null
}
