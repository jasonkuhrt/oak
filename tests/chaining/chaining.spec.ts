import { describe, expect, it } from 'vitest'
import { z } from 'zod/v4'
import { $ } from '../_/helpers.js'

let c
const s = z.string()

describe(`errors`, () => {
  describe(`reserved flag`, () => {
    it(`help`, () => {
      // @ts-expect-error - "help" is a reserved parameter name
      $.parameter(`help`, s)
    })
    it(`help`, () => {
      // @ts-expect-error - "h" is a reserved parameter name
      $.parameter(`h`, s)
    })
    it(`h help`, () => {
      // @ts-expect-error - "h" is a reserved parameter name
      $.parameter(`h help`, s)
    })
  })
  describe(`reuse flag`, () => {
    it(`long flag`, () => {
      c = $.parameter(`alpha`, s)
      // @ts-expect-error - "alpha" is already used
      c.parameter(`alpha`, s)
    })
    it(`long flag alias`, () => {
      c = $.parameter(`alpha bravo`, s)
      // @ts-expect-error - "bravo" is already used as an alias
      c.parameter(`bravo`, s)
    })
    it(`short flag`, () => {
      c = $.parameter(`a`, s)
      // @ts-expect-error - "a" is already used
      c.parameter(`a`, s)
    })
    it(`short flag alias`, () => {
      c = $.parameter(`a b`, s)
      // @ts-expect-error - "b" is already used as an alias
      c.parameter(`b`, s)
    })
  })
})

it(`works`, () => {
  const args = $.parameter(`foo`, z.string())
    .parameter(`bar`, z.string())
    .parse({ line: [`--foo`, `1`, `--bar`, `2`] })
  expect(args).toMatchObject({ foo: `1`, bar: `2` })
})
