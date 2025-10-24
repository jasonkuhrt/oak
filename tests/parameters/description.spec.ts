import stripAnsi from 'strip-ansi'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { $, s } from '../_/helpers.js'
import { createState } from '../environment/__helpers__.js'

let exitSpy: ReturnType<typeof vi.spyOn>

const output = createState<string>({
  value: (values) => values.join(``),
})

const onOutput = output.set

beforeEach(() => {
  exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
})

describe(`placement of describe method in zod method chain does not matter`, () => {
  it(`description can trail optional`, () => {
    $.parameter(`a`, s.optional().describe(`Blah blah blah.`)).settings({ onOutput }).parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatch(/Blah blah blah./)
  })

  it(`description can lead optional`, () => {
    $.parameter(`a`, s.describe(`Blah blah blah.`).optional()).settings({ onOutput }).parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatch(/Blah blah blah./)
  })

  it(`description can trail default`, () => {
    $.parameter(`a`, s.default(`x`).describe(`Blah blah blah.`)).settings({ onOutput }).parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatch(/Blah blah blah./)
  })

  it(`description can lead default`, () => {
    $.parameter(`a`, s.describe(`Blah blah blah.`).default(`x`)).settings({ onOutput }).parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatch(/Blah blah blah./)
  })
})

describe(`when there are multiple describe methods in the zod method chain only the last (outer most) one is used`, () => {
  it(`last description instance wins`, () => {
    $.parameter(`a`, s.describe(`Blah blah blah 1.`).describe(`Blah blah blah 2.`)).settings({ onOutput }).parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatch(/Blah blah blah 2./)
  })

  it(`last description instance separated by default wins`, () => {
    $.parameter(`a`, s.describe(`Blah blah blah 1.`).default(`x`).describe(`Blah blah blah 2.`)).settings({ onOutput }).parse({
      line: [`-h`],
    })
    expect(stripAnsi(output.value)).toMatch(/Blah blah blah 2./)
  })

  it(`last description instance separated by optional wins`, () => {
    $.parameter(`a`, s.describe(`Blah blah blah 1.`).optional().describe(`Blah blah blah 2.`)).settings({ onOutput }).parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatch(/Blah blah blah 2./)
  })
})
