import { beforeEach, vi } from 'vitest'

export let exit: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
})
