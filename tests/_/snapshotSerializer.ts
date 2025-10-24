import stripAnsi from 'strip-ansi'

/**
 * Normalize terminal output for consistent snapshots across environments:
 * 1. Strips ANSI codes
 * 2. Normalizes line endings
 * 3. Removes trailing whitespace from lines
 */
export const normalizeTerminalOutput = (output: string | string[]): string => {
  const text = Array.isArray(output) ? output.join('\n') : output

  // Strip ANSI codes
  let normalized = stripAnsi(text)

  // Normalize line endings
  normalized = normalized.replace(/\r\n/g, '\n')

  // Remove trailing whitespace from each line but preserve structure
  normalized = normalized
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')

  // Remove trailing newlines at end of output
  normalized = normalized.replace(/\n+$/, '\n')

  return normalized
}
