import { beforeEach, expect, test, vi } from 'vitest'
import { $, s } from '../_/helpers.js'

let exitSpy: ReturnType<typeof vi.spyOn>
let stdoutSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
  stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
})

test(`exits 0`, () => {
  $.parameter(`a`, s.optional()).parse({ line: [`-h`] })
  expect(exitSpy).toHaveBeenCalledWith(0)
})

test(`can be triggered by -h`, () => {
  $.parameter(`a`, s.optional()).parse({ line: [`-h`] })
  expect(exitSpy).toHaveBeenCalledWith(0)
  expect(stdoutSpy.mock.calls[0][0]).toMatch(/parameters/i)
})

test(`can be triggered by --help`, () => {
  $.parameter(`a`, s.optional()).parse({ line: [`-h`] })
  expect(exitSpy).toHaveBeenCalledWith(0)
  expect(stdoutSpy.mock.calls[0][0]).toMatch(/parameters/i)
})

test(`can be triggered by passing no arguments`, () => {
  $.parameter(`a`, s.optional()).parse({ line: [] })
  expect(exitSpy).toHaveBeenCalledWith(0)
  expect(stdoutSpy.mock.calls[0][0]).toMatch(/parameters/i)
})
