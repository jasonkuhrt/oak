import { Either as Ef } from 'effect'
import type { MoltSchema } from './molt-schema.js'
import { isFailure, isSuccess, validateWithStandardSchema } from './standard-schema.js'

/**
 * Validate a value using a MoltSchema.
 *
 * Returns Either.Right on success or Either.Left with validation errors.
 *
 * Note: Assumes synchronous validation. Molt only uses synchronous schemas (via Zod).
 */
export const validate = <___Input, ___Output>(
  schema: MoltSchema<___Input, ___Output>,
  value: unknown,
): Ef.Either<{ value: unknown; errors: string[] }, ___Output | undefined> => {
  // Cast to synchronous result - molt only uses sync schemas
  const result = validateWithStandardSchema(schema.standardSchema, value) as any

  if (isSuccess(result)) {
    return Ef.right(result.value) as any
  }

  if (isFailure(result)) {
    const errors = result.issues?.map((issue) => issue.message ?? 'Validation failed') ?? ['Validation failed']
    return Ef.left({ value, errors }) as any
  }

  return Ef.left({ value, errors: ['Unknown validation error'] }) as any
}

/**
 * Deserialize a string value into the schema's type.
 *
 * This attempts to parse common formats (JSON for objects, plain strings for strings, numbers, etc.)
 */
export const deserialize = <___Input, ___Output>(
  schema: MoltSchema<___Input, ___Output>,
  serializedValue: string,
): Ef.Either<Error, ___Output> => {
  // Try to infer the type from metadata hints
  const displayType = schema.metadata.helpHints?.displayType ?? 'unknown'

  let parsedValue: unknown

  // Handle string - just use the value as-is
  if (displayType === 'string') {
    parsedValue = serializedValue
  } // Handle boolean
  else if (displayType === 'boolean') {
    const lower = serializedValue.toLowerCase()
    if (lower === 'true' || lower === '1' || lower === 'yes') parsedValue = true
    else if (lower === 'false' || lower === '0' || lower === 'no') parsedValue = false
    else parsedValue = serializedValue
  } // Handle number
  else if (displayType === 'number') {
    const num = Number(serializedValue)
    parsedValue = Number.isNaN(num) ? serializedValue : num
  } // Handle literal or enum (quoted values)
  else if (displayType.includes("'")) {
    // Extract the literal value without quotes
    const match = displayType.match(/'([^']+)'/)
    parsedValue = match ? match[1] : serializedValue
  } // Default: try JSON parse, fall back to string
  else {
    try {
      parsedValue = JSON.parse(serializedValue)
    } catch {
      parsedValue = serializedValue
    }
  }

  // Validate the parsed value
  // Cast to synchronous result - molt only uses sync schemas
  const result = validateWithStandardSchema(schema.standardSchema, parsedValue) as any

  if (isSuccess(result)) {
    return Ef.right(result.value as ___Output)
  }

  if (isFailure(result)) {
    const errors = result.issues?.map((issue) => issue.message ?? 'Validation failed').join(', ')
      ?? 'Validation failed'
    return Ef.left(new Error(`Deserialization failed: ${errors}`))
  }

  return Ef.left(new Error('Unknown deserialization error'))
}

/**
 * Get the display type string for help output.
 */
export const display = <___Input, ___Output>(schema: MoltSchema<___Input, ___Output>): string => {
  return schema.metadata.helpHints?.displayType ?? 'unknown'
}

/**
 * Get the expanded display type string for help output.
 */
export const displayExpanded = <___Input, ___Output>(schema: MoltSchema<___Input, ___Output>): string => {
  return schema.metadata.helpHints?.displayTypeExpanded ?? display(schema)
}

/**
 * Get the schema tag (for backwards compatibility).
 *
 * Since MoltSchema doesn't have _tag, we derive it from the display type.
 */
export const getTag = <___Input, ___Output>(schema: MoltSchema<___Input, ___Output>): string => {
  const displayType = display(schema)
  if (displayType === 'boolean') return 'TypeBoolean'
  if (displayType === 'number') return 'TypeNumber'
  if (displayType === 'string') return 'TypeString'
  if (displayType.includes('|')) return 'TypeUnion'
  return 'TypeScalar'
}

/**
 * Generate help text for a schema (used in CLI help output).
 *
 * Returns formatted text showing type, description, and refinements.
 */
export const help = <___Input, ___Output>(
  schema: MoltSchema<___Input, ___Output>,
  _settings?: any,
): string => {
  const parts: string[] = []

  // Add display type
  parts.push(displayExpanded(schema))

  // Add description if present
  if (schema.metadata.description) {
    parts.push(`\n${schema.metadata.description}`)
  }

  // Add refinements if present
  if (schema.metadata.helpHints?.refinements && schema.metadata.helpHints.refinements.length > 0) {
    parts.push(`\n• ${schema.metadata.helpHints.refinements.join('\n• ')}`)
  }

  return parts.join('')
}
