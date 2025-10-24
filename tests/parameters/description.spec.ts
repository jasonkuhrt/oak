import stripAnsi from 'strip-ansi'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { $, s } from '../_/helpers.js'

let exitSpy: ReturnType<typeof vi.spyOn>
let stdoutSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
  stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
})

describe(`placement of describe method in zod method chain does not matter`, () => {
  it(`description can trail optional`, () => {
    $.parameter(`a`, s.optional().describe(`Blah blah blah.`)).parse({ line: [`-h`] })
    const output = stdoutSpy.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah./)
  })

  it(`description can lead optional`, () => {
    $.parameter(`a`, s.describe(`Blah blah blah.`).optional()).parse({ line: [`-h`] })
    const output = stdoutSpy.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah./)
  })

  it(`description can trail default`, () => {
    $.parameter(`a`, s.default(`x`).describe(`Blah blah blah.`)).parse({ line: [`-h`] })
    const output = stdoutSpy.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah./)
  })

  it(`description can lead default`, () => {
    $.parameter(`a`, s.describe(`Blah blah blah.`).default(`x`)).parse({ line: [`-h`] })
    const output = stdoutSpy.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah./)
  })
})

describe(`when there are multiple describe methods in the zod method chain only the last (outer most) one is used`, () => {
  it(`last description instance wins`, () => {
    $.parameter(`a`, s.describe(`Blah blah blah 1.`).describe(`Blah blah blah 2.`)).parse({ line: [`-h`] })
    const output = stdoutSpy.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah 2./)
  })

  it(`last description instance separated by default wins`, () => {
    $.parameter(`a`, s.describe(`Blah blah blah 1.`).default(`x`).describe(`Blah blah blah 2.`)).parse({
      line: [`-h`],
    })
    const output = stdoutSpy.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah 2./)
  })

  it(`last description instance separated by optional wins`, () => {
    $.parameter(`a`, s.describe(`Blah blah blah 1.`).optional().describe(`Blah blah blah 2.`)).parse({ line: [`-h`] })
    const output = stdoutSpy.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah 2./)
  })
})
