import { Ts } from '@wollybeard/kit'
import { beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod/v4'
import type { BuilderCommandState } from '../../src/builders/command/state.js'
import type { CommandBuilder } from '../../src/builders/command/types.js'
import type { KeyPress } from '../../src/lib/KeyPress/_.ts'
import { $, b, e, l1, n, s, tryCatch } from '../_/helpers.js'
import { memoryPrompter } from '../_/mocks/tty.js'
import { normalizeTerminalOutput } from '../_/snapshotSerializer.js'

// TODO test that prompt order is based on order of parameter definition

const $$ = $.settings({ onError: `throw`, helpOnError: false })

let answers: string[]
let keyPresses: KeyPress.KeyPressEvent[]
let line: string[]

beforeEach(() => {
  answers = []
  keyPresses = []
  line = []
})

describe(`string`, () => {
  describe(`optional`, () => {
    it(`when nothing entered then value is undefined`, async () => {
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
      await run($$.parameter(`a`, { type: s.optional(), prompt: { when: { result: `omitted` } } }))
    })
    it(`when esc is pressed the question is skipped`, async () => {
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `escape` })
      await run($$.parameter(`a`, { type: s.optional(), prompt: { when: { result: `omitted` } } }))
    })
  })
})

describe(`number`, () => {
  describe(`optional`, () => {
    it(`when nothing entered then value is undefined`, async () => {
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
      await run($$.parameter(`a`, { type: n.optional(), prompt: { when: { result: `omitted` } } }))
    })
    it(`when esc is pressed the question is skipped`, async () => {
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `escape` })
      await run($$.parameter(`a`, { type: n.optional(), prompt: { when: { result: `omitted` } } }))
    })
  })
})

describe(`boolean`, () => {
  describe(`required`, () => {
    it(`defaults to "no"`, async () => {
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
      await run($$.parameter(`a`, { type: b, prompt: true }))
    })
    it(`can be toggled to "yes"`, async () => {
      keyPresses.push(
        { ctrl: false, meta: false, sequence: ``, shift: false, name: `right` },
        { ctrl: false, meta: false, sequence: ``, shift: false, name: `return` },
      )
      await run($$.parameter(`a`, { type: b, prompt: true }))
    })
    it(`can be toggled to "yes" and then back to "no"`, async () => {
      keyPresses.push(
        { ctrl: false, meta: false, sequence: ``, shift: false, name: `right` },
        { ctrl: false, meta: false, sequence: ``, shift: false, name: `left` },
        { ctrl: false, meta: false, sequence: ``, shift: false, name: `return` },
      )
      await run($$.parameter(`a`, { type: b, prompt: true }))
    })
    it(`can use tab to toggle between "yes" and "no"`, async () => {
      keyPresses.push(
        { ctrl: false, meta: false, sequence: ``, shift: false, name: `tab` },
        { ctrl: false, meta: false, sequence: ``, shift: false, name: `tab` },
        { ctrl: false, meta: false, sequence: ``, shift: false, name: `return` },
      )
      await run($$.parameter(`a`, { type: b, prompt: true }))
    })
  })
})

describe(`union`, () => {
  describe(`required`, () => {
    it(`asks user to select member to use"`, async () => {
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `tab` })
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `tab` })
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
      await run($$.parameter(`a`, { type: z.union([n, b, s]), prompt: true }))
    })
  })
})

describe(`enumeration`, () => {
  describe(`required`, () => {
    it(`defaults to first member`, async () => {
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
      await run($$.parameter(`a`, { type: e, prompt: true }))
    })
    it(`can select member rightward with right key`, async () => {
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `right` })
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
      await run($$.parameter(`a`, { type: e, prompt: true }))
    })
    it(`can select member leftward with left key`, async () => {
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `right` })
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `left` })
      keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
      await run($$.parameter(`a`, { type: e, prompt: true }))
    })
    describe(`tab`, () => {
      it(`can select member rightward with tab key`, async () => {
        keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `tab` })
        keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
        await run($$.parameter(`a`, { type: e, prompt: true }))
      })
      it(`can select member leftward with shift+tab key`, async () => {
        keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `right` })
        keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: true, name: `tab` })
        keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
        await run($$.parameter(`a`, { type: e, prompt: true }))
      })
    })
    describe(`loop`, () => {
      it(`right key on last member loops to first member`, async () => {
        keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `right` })
        keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `right` })
        keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `right` })
        keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
        await run($$.parameter(`a`, { type: e, prompt: true }))
      })
      it(`left key on first member loops to last member`, async () => {
        keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `left` })
        keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
        await run($$.parameter(`a`, { type: e, prompt: true }))
      })
    })
  })
})

it(`can be explicitly disabled`, async () => {
  answers = []
  line = []
  await run($$.parameter(`a`, { type: s, prompt: { enabled: false } }))
})

it(`can be explicitly disabled with a "when" condition present`, async () => {
  answers = []
  line = []
  await run(
    $$.parameter(`a`, {
      type: s.min(2),
      prompt: { enabled: false, when: { result: `rejected`, error: `ErrorMissingArgument` } },
    }),
  )
})

it(`prompt when missing input`, async () => {
  keyPresses.push(
    { ctrl: false, meta: false, sequence: `f`, shift: false, name: `f` },
    { ctrl: false, meta: false, sequence: `o`, shift: false, name: `o` },
    { ctrl: false, meta: false, sequence: `o`, shift: false, name: `o` },
    { ctrl: false, meta: false, sequence: ``, shift: false, name: `return` },
  )
  line = []
  await run(
    $$.parameter(`a`, {
      type: s.min(2),
      prompt: { when: { result: `rejected`, error: `ErrorMissingArgument` } },
    }),
  )
})

it(`prompt when invalid input`, async () => {
  keyPresses.push(
    { ctrl: false, meta: false, sequence: `f`, shift: false, name: `f` },
    { ctrl: false, meta: false, sequence: `o`, shift: false, name: `o` },
    { ctrl: false, meta: false, sequence: `o`, shift: false, name: `o` },
    { ctrl: false, meta: false, sequence: ``, shift: false, name: `return` },
  )
  line = [`-a`, `1`]
  await run(
    $.parameter(`a`, {
      type: s.min(2),
      prompt: { when: { result: `rejected`, error: `ErrorInvalidArgument` } },
    }),
  )
})

it(`prompt when invalid input OR missing input`, async () => {
  keyPresses.push(
    { ctrl: false, meta: false, sequence: `f`, shift: false, name: `f` },
    { ctrl: false, meta: false, sequence: `o`, shift: false, name: `o` },
    { ctrl: false, meta: false, sequence: `o`, shift: false, name: `o` },
    { ctrl: false, meta: false, sequence: ``, shift: false, name: `return` },
  )
  line = [`-a`, `1`]
  await run(
    $$.parameter(`a`, {
      type: s.min(2),
      prompt: { when: { result: `rejected`, error: [`ErrorInvalidArgument`, `ErrorMissingArgument`] } },
    }),
  )
})

it(`prompt when omitted`, async () => {
  keyPresses.push(
    { ctrl: false, meta: false, sequence: `f`, shift: false, name: `f` },
    { ctrl: false, meta: false, sequence: `o`, shift: false, name: `o` },
    { ctrl: false, meta: false, sequence: `o`, shift: false, name: `o` },
    { ctrl: false, meta: false, sequence: ``, shift: false, name: `return` },
  )
  line = []
  await run(
    $$.parameter(`a`, {
      type: s.min(2).optional(),
      prompt: { when: { result: `omitted`, spec: { optionality: [`default`, `optional`] } } },
    }),
  )
})

it(`static error to match on omitted event on required parameter by .parameter(...)`, () => {
  $.parameter(`a`, { type: s, prompt: { when: { result: `omitted` } } })
  // TODO fix me
  // // Is fine, because parameter is optional.
  // $.parameter(`a`, {
  //   type: s.optional(),
  //   prompt: { when: { result: `omitted` } },
  // })
})

it(`can pass just one pattern in multiple pattern syntax`, () => {
  $.parameter(`a`, s).settings({ prompt: { when: [{ result: `accepted` }] } })
})

it(`static error to match on omitted event on command level when no parameters have optional`, () => {
  // TODO fix me
  // $
  //   .parameter(`a`, s)
  //   .settings({ prompt: { when: { result: `omitted` } } })
  // Is fine, because parameter is optional.
  $.parameter(`a`, s.optional()).settings({ prompt: { when: { result: `omitted` } } })
  // Is fine, because at least one parameter is optional.
  $.parameter(`a`, s.optional())
    .parameter(`b`, s)
    .settings({ prompt: { when: { result: `omitted` } } })
})

// TODO should be able match on common event properties _without_ specifying the event type...
// $.parameter(`a`, s).settings({
//   prompt: { when: { spec: { name: { aliases: { long: [`a`, `b`] } } } } },
// })

// TODO already taken care of by match test suite?
it(`array value`, () => {
  // Can pass ONE literal match
  $.parameter(`a`, s).settings({
    prompt: { when: { result: `accepted`, spec: { name: { aliases: { long: [`a`, `b`] } } } } } as any,
  })
  // can pass an OR literal match
  $.parameter(`a`, s).settings({
    prompt: { when: { result: `accepted`, spec: { name: { aliases: { long: [[`a`, `b`], [`c`]] } } } } } as any,
  })
  $.parameter(`a`, s).settings({
    prompt: { when: { result: `accepted`, spec: { name: { aliases: { long: `a` } } } } } as any,
  })
  $.parameter(`a`, s).settings({
    prompt: { when: { result: `accepted`, spec: { name: { aliases: { long: [`a`, [`b`]] } } } } } as any,
  })
})

// TODO
// it(`static error when fields from different event types matched in single pattern`, () => {
//   $
//     .parameter(`a`, s)
//     .settings({ prompt: { when: { result: `rejected`, value: 1 } } })
//   // TODO excess properties should be an error in the pattern match but for some reason are not being here.
//   $.parameter(`a`, {
//     type: s,
//     prompt: {
//       when: {
//         result: `rejected`,
//         error: `ErrorInvalidArgument`,
//         value: 1,
//         foo: 2,
//         blah: 3,
//         '........ :(': 1,
//       },
//     },
//   })
// })

it(`Static type tests`, () => {
  Ts.Assert.equiv.ofAs<() => { a: 1 }>().on(
    $.parameter(`a`, { type: l1, prompt: { enabled: false, when: { result: `accepted` } } }).parse,
  )
  Ts.Assert.equiv.ofAs<() => { a: 1 }>().on(
    $.parameter(`a`, { type: l1 }).settings({ prompt: { enabled: false, when: { result: `accepted` } } }).parse,
  )
  Ts.Assert.equiv.ofAs<() => Promise<{ a: 1; b: 1 }>>().on(
    $.parameter(`a`, { type: l1, prompt: true }).parameter(`b`, { type: l1, prompt: false }).parse,
  )
  Ts.Assert.equiv.ofAs<() => Promise<{ a: 1 }>>().on(
    $.parameter(`a`, { type: l1 }).settings({ prompt: { when: { result: `accepted` } } }).parse,
  )
})

/**
 * Helpers
 */

const run = async ($: any) => {
  memoryPrompter.answers.add(answers)
  memoryPrompter.script.keyPress.push(...keyPresses)
  const args = await tryCatch(() => $.parse({ line, tty: memoryPrompter }))
  expect(args).toMatchSnapshot(`args`)
  // Normalize terminal output for consistent snapshots across environments
  expect(normalizeTerminalOutput(memoryPrompter.history.all)).toMatchSnapshot(`tty output`)
}
