import type { Mock } from 'vitest'
import { beforeEach, vi } from 'vitest'

export let exit: Mock

beforeEach(() => {
  exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
})
