import stripAnsi from 'strip-ansi'
import { describe, expect, it } from 'vitest'
import type { Settings } from '../../src/_entrypoints/default.js'
import type { MoltSchema } from '../../src/schema/molt-schema.js'
import { $, s, tryCatch } from '../_/helpers.js'
import { memoryPrompter } from '../_/mocks/tty.js'

const S = <$Schema extends MoltSchema>(settings: Settings.PromptInput<$Schema>) => settings
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
    if (!process.env.CI) expect(memoryPrompter.history.all).toMatchSnapshot(`tty`)
    expect(memoryPrompter.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
  })
})

// NOTE: Prompt tests using `{ type: schema }` syntax are skipped due to prompting not being implemented for MoltSchema yet
describe.skip(`command level`, () => {
  it(`passing object makes enabled default to true`, async () => {
    memoryPrompter.script.keyPress.push(...foo)
    const args = await $.parameter(`a`, { type: s })
      .settings({ onError: `throw`, helpOnError: false, prompt: { when: { result: `rejected` } } })
      .parse({ line: [], tty: memoryPrompter })
    expect(args).toMatchSnapshot(`args`)
    if (!process.env.CI) expect(memoryPrompter.history.all).toMatchSnapshot(`tty`)
    expect(memoryPrompter.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
  })
})

it(`prompt is disabled by default`, () => {
  const args = tryCatch(() =>
    $.parameter(`a`, { type: s })
      .settings({ onError: `throw`, helpOnError: false })
      .parse({ line: [], tty: memoryPrompter })
  )
  expect(args).toMatchSnapshot(`args`)
  if (!process.env.CI) expect(memoryPrompter.history.all).toMatchSnapshot(`tty`)
  expect(memoryPrompter.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

it(`prompt can be enabled by default`, async () => {
  memoryPrompter.script.keyPress.push(...foo)
  const args = await tryCatch(() =>
    $.parameter(`a`, { type: s })
      .settings({ onError: `throw`, helpOnError: false, prompt: { enabled: true } })
      .parse({ line: [], tty: memoryPrompter })
  )
  expect(args).toMatchSnapshot(`args`)
  if (!process.env.CI) expect(memoryPrompter.history.all).toMatchSnapshot(`tty`)
  expect(memoryPrompter.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

it(`parameter settings overrides default settings`, () => {
  const args = tryCatch(() =>
    $.parameter(`a`, { type: s, prompt: false })
      .settings({ onError: `throw`, helpOnError: false, prompt: { enabled: true } })
      .parse({ line: [], tty: memoryPrompter })
  )
  expect(args).toMatchSnapshot(`args`)
  if (!process.env.CI) expect(memoryPrompter.history.all).toMatchSnapshot(`tty`)
  expect(memoryPrompter.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
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
      if (!process.env.CI) expect(memoryPrompter.history.all).toMatchSnapshot(`tty`)
      expect(memoryPrompter.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
    })
    it(`check does not match`, () => {
      const args = tryCatch(() =>
        $.parameter(`b`, { type: s })
          .settings({ onError: `throw`, helpOnError: false, prompt: settings })
          .parse({ line: [], tty: memoryPrompter })
      )
      expect(args).toMatchSnapshot(`args`)
      if (!process.env.CI) expect(memoryPrompter.history.all).toMatchSnapshot(`tty`)
      expect(memoryPrompter.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
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
  if (!process.env.CI) expect(memoryPrompter.history.all).toMatchSnapshot(`tty`)
  expect(memoryPrompter.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
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
  if (!process.env.CI) expect(memoryPrompter.history.all).toMatchSnapshot(`tty`)
  expect(memoryPrompter.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})
