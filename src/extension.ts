import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { MoltSchema } from './schema/molt-schema.js'

export type SomeExtension = Extension<any>

/**
 * Extension interface for schema libraries (Zod, Effect, etc.).
 *
 * Extensions convert library-specific schemas to Standard Schema V1
 * and extract metadata for better CLI help generation.
 */
export interface Extension<Type = unknown> {
  /**
   * Extension name (e.g., "Zod", "Effect").
   */
  name: string

  /**
   * The type constraint that this extension accepts.
   * This is used for compile-time type checking of parameters.
   *
   * For example, the Zod extension would use `z.ZodType`.
   */
  type: Type

  /**
   * Convert a library-specific schema to Standard Schema V1.
   *
   * For libraries that already implement Standard Schema (like Zod v4),
   * this can be a simple type assertion. For others (like Effect Schema),
   * this might need to call a conversion function.
   */
  toStandardSchema: (schema: unknown) => StandardSchemaV1<any, any>

  /**
   * Extract CLI-specific metadata from a library schema.
   *
   * This is optional but enables better help text generation.
   * Extracts information like descriptions, default values, type names, etc.
   */
  extractMetadata?: (schema: unknown) => MoltSchema<any, any>['metadata']
}

/**
 * Create an extension with the given configuration.
 */
export const createExtension = <Type>(config: Extension<Type>): Extension<Type> => config
