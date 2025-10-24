import type { EventPatternsInput } from '../../eventPatterns.js'

export type Environment = null | { enabled: boolean; namespaces: string[] }

export type Prompt<$Schema = unknown> = {
  enabled: boolean | null
  when: EventPatternsInput<$Schema> | null
}
