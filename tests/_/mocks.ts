import { beforeEach, vi } from 'vitest'

export let stdout: ReturnType<typeof vi.spyOn>
export let exit: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
  stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
})

/**
 * Get all stdout write calls as a single aggregated string array.
 *
 * Native process.stdout.write spy captures each write() call separately,
 * but tests expect aggregated output like vitest-mock-process provided.
 */
export const getStdoutCalls = (): string[][] => {
  // Aggregate all write calls into a single call array
  const output = stdout.mock.calls.map(call => call[0] as string).join('')
  return [[output]]
}
