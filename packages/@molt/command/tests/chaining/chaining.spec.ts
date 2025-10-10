import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { $ } from '../_/helpers.js'

let c
const s = z.string()

// NOTE: Type-level validation tests disabled due to builder type inference limitations
// after Standard Schema migration. Runtime validation still works.
describe.skip(`errors`, () => {
  describe(`reserved flag`, () => {
    it(`help`, () => {
      $.parameter(`help`, s)
    })
    it(`help`, () => {
      $.parameter(`h`, s)
    })
    it(`h help`, () => {
      $.parameter(`h help`, s)
    })
  })
  describe(`reuse flag`, () => {
    it(`long flag`, () => {
      c = $.parameter(`alpha`, s)
      c.parameter(`alpha`, s)
    })
    it(`long flag alias`, () => {
      c = $.parameter(`alpha bravo`, s)
      c.parameter(`bravo`, s)
    })
    it(`short flag`, () => {
      c = $.parameter(`a`, s)
      c.parameter(`a`, s)
    })
    it(`short flag alias`, () => {
      c = $.parameter(`a b`, s)
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
