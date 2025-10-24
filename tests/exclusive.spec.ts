import { Ts } from '@wollybeard/kit'
import { describe, expect, it } from 'vitest'
import { $, as, e, s } from './_/helpers.js'

const $$ = $.settings({ onError: `throw`, helpOnError: false })
let args

describe(`optional`, () => {
  it(`leads to optional type`, () => {
    const args = $.parametersExclusive(`method`, ($) => $.parameter(`v version`, s).parameter(`b bump`, e).optional())
      .parse({ line: [`-v`, `1.0.0`] })
    Ts.Assert.exact.ofAs<{
      method:
        | {
          _tag: 'version'
          value: string
        }
        | {
          _tag: 'bump'
          value: 'major' | 'minor' | 'patch'
        }
        | undefined
    }>().on(args)
  })

  it(`can accept line arg`, () => {
    args = $.parametersExclusive(`method`, ($) => $.parameter(`v version`, s).parameter(`b bump`, e).optional()).parse({
      line: [`-v`, `1.0.0`],
    })
    expect(args).toMatchObject({ method: { _tag: `version`, value: `1.0.0` } })
  })

  it(`can accept env arg`, () => {
    args = $.parametersExclusive(`method`, ($) => $.parameter(`v version`, s).parameter(`b bump`, e).optional()).parse({
      environment: { cli_param_v: `1.0.0` },
    })
    expect(args).toMatchObject({ method: { _tag: `version`, value: `1.0.0` } })
  })
  it(`can accept nothing`, () => {
    args = $.parametersExclusive(`method`, ($) => $.parameter(`v version`, s).parameter(`b bump`, e).optional())
      .parse()
    expect(`method` in args).toBe(false)
  })
  it(`if two args then error`, () => {
    expect(() =>
      $$.parametersExclusive(`method`, ($) => $.parameter(`v version`, s).parameter(`b bump`, e).optional()).parse({
        line: [`-v`, `1.0.0`, `-b`, `major`],
      })
    ).toThrowErrorMatchingSnapshot()
  })
})

describe(`required`, () => {
  it(`if no arg given then error`, () => {
    expect(
      $$.parametersExclusive(`method`, ($) => $.parameter(`v version`, s).parameter(`b bump`, e)).parse,
    ).toThrowErrorMatchingSnapshot()
  })
  it(`if two args then error`, () => {
    expect(() =>
      $$.parametersExclusive(`method`, ($$) => $$.parameter(`v version`, s).parameter(`b bump`, e)).parse({
        line: [`-v`, `1.0.0`, `-b`, `major`],
      })
    ).toThrowErrorMatchingSnapshot()
  })
})

describe(`default`, () => {
  it(`method params are based on group params defined above`, () => {
    $.parametersExclusive(`method`, ($) => {
      const $$ = $.parameter(`v version`, s).parameter(`b bump`, e)
      const m1 = $$.default
      // Type test: m1 parameters should be [tag: 'version' | 'bump', value: string]
      const m2 = $$.default<'version'>
      // Type test: m2 parameters should be [tag: 'version', value: string]
      const m3 = $$.default<'bump'>
      // Type test: m3 parameters should be [tag: 'bump', value: 'patch' | 'minor' | 'major']
      return $$
    })
  })
  it(`leads to non-optional type`, () => {
    args = $$.parametersExclusive(
      `method`,
      ($) => $.parameter(`v version`, s).parameter(`b bump`, e).default(`bump`, `major`),
    ).parse()
    Ts.Assert.exact.ofAs<{
      method:
        | {
          _tag: 'version'
          value: string
        }
        | {
          _tag: 'bump'
          value: 'major' | 'minor' | 'patch'
        }
    }>().on(args)
  })
  it(`used if nothing passed for group`, () => {
    args = $$.parametersExclusive(
      `method`,
      ($) => $.parameter(`v version`, s).parameter(`b bump`, e).default(`bump`, `patch`),
    ).parse()
    expect(args.method).toMatchObject({ _tag: `bump`, value: `patch` })
  })
})
