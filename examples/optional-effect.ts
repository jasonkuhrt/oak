import { Schema } from 'effect'
import { Command } from '../src/_entrypoints/_.js'
import { EffectSchema } from '../src/_entrypoints/extensions.js'

const args = Command.create()
  .use(EffectSchema)
  // UndefinedOr - returns undefined when omitted
  .parameter(`name`, Schema.UndefinedOr(Schema.String))
  // Optional number - returns undefined when omitted
  .parameter(`age`, Schema.UndefinedOr(Schema.Number))
  // Optional with pipe - returns undefined when omitted
  .parameter(`email`, Schema.UndefinedOr(Schema.String).pipe(Schema.annotations({ description: 'Email address' })))
  // Transform with default - returns default when omitted
  .parameter(
    `verbose v`,
    Schema.transform(
      Schema.UndefinedOr(Schema.Boolean),
      Schema.Boolean,
      { strict: true, decode: (v) => v ?? false, encode: (v) => v },
    ).pipe(Schema.annotations({ default: false })),
  )
  .parse()

console.log(
  args.age,
  args.email,
  args.name,
  args.verbose,
)
