import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod/v4'
import { $, s } from '../../_/helpers.js'
import { createState } from '../../environment/__helpers__.js'

const output = createState<string>({
  value: (values) => values.join(``),
})

const onOutput = output.set

beforeEach(() => {
  vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
})

describe(`errors`, () => {
  it(`when argument missing (last position)`, () => {
    $.parameter(`--mode`, z.enum([`a`, `b`])).settings({ onOutput }).parse({ line: [`--mode`] })
    expect([[output.value]]).toMatchSnapshot()
  })
  it(`when argument missing (non-last position)`, () => {
    $.parameter(`--name`, s).parameter(`--mode`, z.enum([`a`, `b`])).settings({ onOutput }).parse({
      line: [` --mode`, `--name`, `joe`],
    })
    expect([[output.value]]).toMatchSnapshot()
  })
  it(`is validated`, () => {
    $.parameter(`--mode`, z.enum([`a`, `b`, `c`])).settings({ onOutput }).parse({ line: [`--mode`, `bad`] })
    expect([[output.value]]).toMatchSnapshot()
  })
})
