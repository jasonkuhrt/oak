import type { StandardSchemaV1 } from '@standard-schema/spec'

/**
 * Extract the Output type from a Standard Schema.
 */
export type InferOutput<$Schema> = $Schema extends StandardSchemaV1<any, infer ___Output>
  ? ___Output
  : unknown

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
  return schema['~standard'].validate(value)
}

/**
 * Check if a validation result is a success.
 */
export const isSuccess = <___Output>(
  result: StandardSchemaV1.Result<___Output>,
): result is StandardSchemaV1.SuccessResult<___Output> => {
  return 'value' in result
}

/**
 * Check if a validation result is a failure.
 */
export const isFailure = <___Output>(
  result: StandardSchemaV1.Result<___Output>,
): result is StandardSchemaV1.FailureResult => {
  return 'issues' in result
}
