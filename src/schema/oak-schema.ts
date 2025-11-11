import type { StandardSchemaV1 } from '@standard-schema/spec'

/**
 * Optionality configuration for a parameter.
 */
export type Optionality<___T = unknown> =
  | { _tag: 'required' }
  | { _tag: 'optional'; omittedValue?: null | undefined }
  | { _tag: 'default'; getValue: () => ___T }

/**
 * Structured schema type information extracted from the underlying schema library.
 *
 * This provides type structure for Oak's internal logic (type detection, deserialization, etc.)
 * without relying on string parsing.
 */
export type SchemaType =
  | { _tag: 'string' }
  | { _tag: 'number' }
  | { _tag: 'boolean' }
  | { _tag: 'literal'; value: unknown }
  | { _tag: 'enum'; values: unknown[] }
  | { _tag: 'union'; members: SchemaType[] }

/**
 * Oak's internal schema representation.
 *
 * Wraps a Standard Schema V1 compliant schema with CLI-specific metadata.
 */
export interface OakSchema<___Input = unknown, ___Output = ___Input> {
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
     * Structured type information for internal Oak logic.
     *
     * Used for type detection, deserialization, and CLI behavior.
     */
    schema: SchemaType

    /**
     * Optional hints for help text generation.
     *
     * These can be auto-generated from `schema` if not provided.
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
