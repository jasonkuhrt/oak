import { Ts } from '@wollybeard/kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { $, n } from '../../_/helpers.js'
import { s } from '../../_/helpers.js'
import { createState } from '../../environment/__helpers__.js'

const output = createState<string>({
  value: (values) => values.join(``),
})

const onOutput = output.set

beforeEach(() => {
  vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
})

it(`casts the input as a number`, () => {
  const args = $.parameter(`--age`, n).parse({ line: [`--age`, `1`] })
  Ts.Assert.on(args).exact.of({} as { age: number })
  expect(args).toMatchObject({ age: 1 })
})

// TODO: Remove skipIf once kit#41 is fixed
describe.skipIf(process.env.CI === 'true')(`errors`, () => {
  it(`validates the  input`, () => {
    $.parameter(`--age`, n.int()).settings({ onOutput }).parse({ line: [`--age`, `1.1`] })
    expect([[output.value]]).toMatchSnapshot()
  })
  it(`throws error when argument missing (last position)`, () => {
    $.parameter(`--age`, n).settings({ onOutput }).parse({ line: [`--age`] })
    expect([[output.value]]).toMatchSnapshot()
  })
  it(`throws error when argument missing (non-last position)`, () => {
    $.parameter(`--name`, s)
      .parameter(`--age`, n)
      .settings({ onOutput })
      .parse({
        line: [` --age`, `--name`, `joe`],
      })
    expect([[output.value]]).toMatchSnapshot()
  })
})
