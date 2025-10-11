import { Ts } from '@wollybeard/kit'
import { expect, it } from 'vitest'
import { z } from 'zod/v4'
import { $ } from '../../_/helpers.js'

it(`Statically accepts or rejects zod types for the schema`, () => {
  // union
  Ts.Test.bid<() => { a: number | 'a' | 'b' }>()(
    $.parameter(`a`, z.union([z.number(), z.nativeEnum({ a: `a`, b: `b` } as const)])).parse,
  )
  Ts.Test.bid<() => { a: 1 | 'a' | true | false }>()(
    $.parameter(`a`, z.union([z.literal(1), z.literal(`a`), z.literal(true), z.literal(false)])).parse,
  )
  // todo key should be ?
  // optional
  // default

  // Note: z.unknown() is correctly rejected at compile time by TypeScript
  // The Zod extension's SupportedZodType union excludes ZodUnknown
})
