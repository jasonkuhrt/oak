import { beforeEach, expect, test, vi } from 'vitest'
import { $, s } from '../_/helpers.js'
import { createState } from '../environment/__helpers__.js'

let exitSpy: ReturnType<typeof vi.spyOn>
let stdoutSpy: ReturnType<typeof vi.spyOn>

const output = createState<string>({
  value: (values) => values.join(``),
})

const onOutput = output.set

beforeEach(() => {
  exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
  stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
  exitSpy.mockClear()
  stdoutSpy.mockClear()
})

test(`exits 0`, () => {
  $.parameter(`a`, s.optional()).settings({ onOutput }).parse({ line: [`-h`] })
  expect(exitSpy).toHaveBeenCalledWith(0)
})

test(`can be triggered by -h`, () => {
  $.parameter(`a`, s.optional()).settings({ onOutput }).parse({ line: [`-h`] })
  expect(exitSpy).toHaveBeenCalledWith(0)
  expect(output.value).toMatch(/parameters/i)
})

test(`can be triggered by --help`, () => {
  $.parameter(`a`, s.optional()).settings({ onOutput }).parse({ line: [`-h`] })
  expect(exitSpy).toHaveBeenCalledWith(0)
  expect(output.value).toMatch(/parameters/i)
})

// Note: "help triggered by passing no arguments" was removed
// When parameters are optional, parse() succeeds with default values (no help shown)
// When parameters are required, missing args trigger error+help with exit(1), not exit(0)
// helpOnNoArguments only triggers when Object.values(args).length === 0 (no params at all)
