import { describe, expect, it } from 'vitest'
import type { Settings } from '../../src/_entrypoints/default.js'
import type { OakSchema } from '../../src/schema/oak-schema.js'
import { $, s, tryCatch } from '../_/helpers.js'
import { memoryPrompter } from '../_/mocks/tty.js'
import { normalizeTerminalOutput } from '../_/snapshotSerializer.js'

const S = <$Schema extends OakSchema>(settings: Settings.PromptInput<$Schema>) => settings
const foo = [
  { ctrl: false, meta: false, sequence: `f`, shift: false, name: `f` },
  { ctrl: false, meta: false, sequence: `o`, shift: false, name: `o` },
  { ctrl: false, meta: false, sequence: `o`, shift: false, name: `o` },
  { ctrl: false, meta: false, sequence: ``, shift: false, name: `return` },
]

describe(`parameter level`, () => {
  it(`can be passed object`, async () => {
    memoryPrompter.script.keyPress.push(...foo)
    const args = await tryCatch(() =>
      $.parameter(`a`, { type: s, prompt: { enabled: true } })
        .settings({ onError: `throw`, helpOnError: false })
        .parse({ line: [], tty: memoryPrompter })
    )
    expect(args).toMatchSnapshot(`args`)
    expect(normalizeTerminalOutput(memoryPrompter.history.all)).toMatchSnapshot(`tty output`)
  })
})

// NOTE: Testing if prompting works with Standard Schema V1 after migration
describe(`command level`, () => {
  it(`passing object makes enabled default to true`, async () => {
    memoryPrompter.script.keyPress.push(...foo)
    const args = await $.parameter(`a`, { type: s })
      .settings({ onError: `throw`, helpOnError: false, prompt: { when: { result: `rejected` } } })
      .parse({ line: [], tty: memoryPrompter })
    expect(args).toMatchSnapshot(`args`)
    expect(normalizeTerminalOutput(memoryPrompter.history.all)).toMatchSnapshot(`tty output`)
  })
})

it(`prompt is disabled by default`, () => {
  const args = tryCatch(() =>
    $.parameter(`a`, { type: s })
      .settings({ onError: `throw`, helpOnError: false })
      .parse({ line: [], tty: memoryPrompter })
  )
  expect(args).toMatchSnapshot(`args`)
  expect(normalizeTerminalOutput(memoryPrompter.history.all)).toMatchSnapshot(`tty output`)
})

it(`prompt can be enabled by default`, async () => {
  memoryPrompter.script.keyPress.push(...foo)
  const args = await tryCatch(() =>
    $.parameter(`a`, { type: s })
      .settings({ onError: `throw`, helpOnError: false, prompt: { enabled: true } })
      .parse({ line: [], tty: memoryPrompter })
  )
  expect(args).toMatchSnapshot(`args`)
  expect(normalizeTerminalOutput(memoryPrompter.history.all)).toMatchSnapshot(`tty output`)
})

it(`parameter settings overrides default settings`, () => {
  const args = tryCatch(() =>
    $.parameter(`a`, { type: s, prompt: false })
      .settings({ onError: `throw`, helpOnError: false, prompt: { enabled: true } })
      .parse({ line: [], tty: memoryPrompter })
  )
  expect(args).toMatchSnapshot(`args`)
  expect(normalizeTerminalOutput(memoryPrompter.history.all)).toMatchSnapshot(`tty output`)
})

describe(`prompt can be toggled by check on error`, () => {
  describe(`toggle to enabled`, () => {
    const settings = S({
      enabled: true,
      when: { result: `rejected`, error: `ErrorMissingArgument`, spec: { name: { canonical: `a` } } },
    })
    it(`check does match`, async () => {
      memoryPrompter.script.keyPress.push(...foo)
      const args = await tryCatch(() =>
        $.parameter(`a`, { type: s })
          .settings({ onError: `throw`, helpOnError: false, prompt: settings })
          .parse({ line: [], tty: memoryPrompter })
      )
      expect(args).toMatchSnapshot(`args`)
      expect(normalizeTerminalOutput(memoryPrompter.history.all)).toMatchSnapshot(`tty output`)
    })
    it(`check does not match`, () => {
      const args = tryCatch(() =>
        $.parameter(`b`, { type: s })
          .settings({ onError: `throw`, helpOnError: false, prompt: settings })
          .parse({ line: [], tty: memoryPrompter })
      )
      expect(args).toMatchSnapshot(`args`)
      expect(normalizeTerminalOutput(memoryPrompter.history.all)).toMatchSnapshot(`tty output`)
    })
  })
})

it(`parameter defaults to custom settings`, async () => {
  memoryPrompter.script.keyPress.push(...foo)
  const args = await tryCatch(() =>
    $.parameter(`a`, { type: s })
      .settings({
        onError: `throw`,
        helpOnError: false,
        prompt: {
          enabled: true,
          when: {
            result: `rejected`,
            spec: { optionality: `required` },
          },
        },
      })
      .parse({ line: [], tty: memoryPrompter })
  )
  expect(args).toMatchSnapshot(`args`)
  expect(normalizeTerminalOutput(memoryPrompter.history.all)).toMatchSnapshot(`tty output`)
})

it(`can be stack of conditional prompts`, async () => {
  const settings = S({
    enabled: true,
    when: [
      {
        result: `rejected`,
        error: `ErrorInvalidArgument`,
      },
      {
        result: `accepted`,
        spec: { optionality: `optional` },
        value: `1`,
      },
    ],
  })
  memoryPrompter.script.keyPress.push(...foo)
  const args = await tryCatch(() =>
    $.parameter(`a`, { type: s.optional() })
      .settings({ onError: `throw`, helpOnError: false, prompt: settings })
      .parse({ line: [`-a`, `1`], tty: memoryPrompter })
  )
  expect(args).toMatchSnapshot(`args`)
  expect(normalizeTerminalOutput(memoryPrompter.history.all)).toMatchSnapshot(`tty output`)
})
