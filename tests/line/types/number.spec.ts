import type { Ts } from '@wollybeard/kit'
import { describe, expect, it } from 'vitest'
import { $, n } from '../../_/helpers.js'
import { s } from '../../_/helpers.js'
import { getStdoutCalls } from '../../_/mocks.js'

it(`casts the input as a number`, () => {
  const args = $.parameter(`--age`, n).parse({ line: [`--age`, `1`] })
  true as Ts.Assert.equiv<{ age: number }, typeof args>
  expect(args).toMatchObject({ age: 1 })
})

describe(`errors`, () => {
  it(`validates the  input`, () => {
    $.parameter(`--age`, n.int()).parse({ line: [`--age`, `1.1`] })
    // Skip ANSI snapshots in CI due to environment differences
    expect(getStdoutCalls()).toMatchSnapshot()
  })
  it(`throws error when argument missing (last position)`, () => {
    $.parameter(`--age`, n).parse({ line: [`--age`] })
    // Skip ANSI snapshots in CI due to environment differences
    expect(getStdoutCalls()).toMatchSnapshot()
  })
  it(`throws error when argument missing (non-last position)`, () => {
    $.parameter(`--name`, s)
      .parameter(`--age`, n)
      .parse({
        line: [` --age`, `--name`, `joe`],
      })
    // Skip ANSI snapshots in CI due to environment differences
    expect(getStdoutCalls()).toMatchSnapshot()
  })
})
