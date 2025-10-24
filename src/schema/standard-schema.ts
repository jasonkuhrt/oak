import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { z } from 'zod/v4'

/**
 * Extract the Output type from a schema.
 *
 * This works with:
 * - Zod schemas (via Standard Schema V1 type parameters)
 * - Standard Schema V1 compliant schemas (extracts Output type parameter)
 * - OakSchema (extracts from nested standardSchema)
 *
 * We use Standard Schema V1's type parameters rather than library-specific inference
 * (like z.infer) to support multiple schema libraries through a common interface.
 */
export type InferOutput<$Schema> = $Schema extends StandardSchemaV1<any, infer ___Output> ? ___Output : never

/**
 * Validate a value using a Standard Schema.
 *
 * @param schema - Standard Schema V1 compliant schema
 * @param value - Value to validate
 * @returns Validation result with either success value or failure issues (may be async)
 */
export const validateWithStandardSchema = <___Input, ___Output>(
  schema: StandardSchemaV1<___Input, ___Output>,
  value: unknown,
): StandardSchemaV1.Result<___Output> | Promise<StandardSchemaV1.Result<___Output>> => {
  return schema[`~standard`].validate(value)
}

/**
 * Check if a validation result is a success.
 */
export const isSuccess = <___Output>(
  result: StandardSchemaV1.Result<___Output>,
): result is StandardSchemaV1.SuccessResult<___Output> => {
  return `value` in result
}

/**
 * Check if a validation result is a failure.
 */
export const isFailure = <___Output>(
  result: StandardSchemaV1.Result<___Output>,
): result is StandardSchemaV1.FailureResult => {
  return `issues` in result
}
