import type { StandardSchemaV1 } from '@standard-schema/spec'

/**
 * Optionality configuration for a parameter.
 */
export type Optionality<___T = unknown> =
  | { _tag: 'required' }
  | { _tag: 'optional' }
  | { _tag: 'default'; getValue: () => ___T }

/**
 * Molt's internal schema representation.
 *
 * Wraps a Standard Schema V1 compliant schema with CLI-specific metadata.
 */
export interface MoltSchema<___Input = unknown, ___Output = ___Input> {
  /**
   * The Standard Schema V1 compliant schema used for validation.
   */
  standardSchema: StandardSchemaV1<___Input, ___Output>

  /**
   * CLI-specific metadata extracted from the schema or provided by extensions.
   */
  metadata: {
    /**
     * Human-readable description of the parameter.
     */
    description?: string

    /**
     * Whether the parameter is required, optional, or has a default value.
     */
    optionality: Optionality<___Output>

    /**
     * Hints for help text generation.
     */
    helpHints?: {
      /**
       * Display name for the type (e.g., "string", "number", "'json' | 'yaml'").
       */
      displayType: string

      /**
       * Expanded display for complex types (e.g., union with descriptions).
       */
      displayTypeExpanded?: string

      /**
       * List of validation/refinement rules for help text (e.g., ["min: 5", "email format"]).
       */
      refinements?: string[]

      /**
       * Priority for union type parsing (higher priority types are tried first).
       */
      priority?: number
    }
  }
}
