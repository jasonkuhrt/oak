import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { Fn } from '@wollybeard/kit'
import type { OakSchema } from './schema/oak-schema.js'

export type SomeExtension = Extension

/**
 * Extension interface for schema libraries (Zod, Effect, etc.).
 *
 * Extensions convert library-specific schemas to Standard Schema V1
 * and extract metadata for better CLI help generation.
 */
export interface Extension<
  $Type = any,
  $Guard extends Fn.Kind.Kind = Fn.Kind.Identity,
> {
  /**
   * Extension name (e.g., "Zod", "Effect").
   */
  name: string

  /**
   * Type-level guard for validating schemas at compile-time.
   *
   * The guard is a Higher-Kinded Type (HKT) that receives a schema
   * and returns either:
   * - `never` (if valid - guard passes through original schema)
   * - `Ts.Err.StaticError` (if invalid, causing TypeScript compile error)
   *
   * This allows extensions to reject schemas that don't make sense
   * in a CLI context (e.g., Effect's Schema.NullOr, Zod's .nullable()).
   *
   * Default: Fn.Kind.Identity (accepts all schemas)
   *
   * @example
   * ```ts
   * // Effect Schema guard that rejects NullOr
   * interface EffectSchemaGuard extends Fn.Kind.Kind {
   *   return: this['parameters'][0] extends Schema.NullOr<any>
   *     ? Ts.Err.StaticError<
   *         ['schema', 'nullor-not-supported'],
   *         { message: 'Schema.NullOr() is not supported. Use Schema.UndefinedOr() instead.' }
   *       >
   *     : never
   * }
   * ```
   */
  guard: $Guard
  type: $Type

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
  extractMetadata?: (schema: unknown) => OakSchema<any, any>['metadata']
}

/**
 * Create an extension with the given configuration.
 */
export const createExtension = <
  $Type,
  $Guard extends Fn.Kind.Kind = Fn.Kind.Identity,
>(
  config: Extension<$Type, $Guard>,
): Extension<$Type, $Guard> => config
