import { Schema } from 'effect'
import { Command } from '../src/_entrypoints/default.js'
import { EffectSchema } from '../src/_entrypoints/extensions.js'

const args = await Command.create()
  .use(EffectSchema)
  .parameter(
    `filePath`,
    Schema.String.pipe(
      Schema.annotations({ description: `Path to the file to convert.` }),
    ),
  )
  .parameter(
    `to`,
    Schema.Literal(`json`, `yaml`, `toml`).pipe(
      Schema.annotations({ description: `Format to convert to.` }),
    ),
  )
  .parameter(
    `from`,
    Schema.UndefinedOr(Schema.Literal(`json`, `yaml`, `toml`)).pipe(
      Schema.annotations({ description: `Source format (auto-detected if omitted).` }),
    ),
  )
  .parameter(
    `output o`,
    Schema.UndefinedOr(Schema.String).pipe(
      Schema.annotations({ description: `Output file path (prints to stdout if omitted).` }),
    ),
  )
  .parameter(
    `encoding`,
    Schema.UndefinedOr(Schema.Literal(`utf8`, `utf16`, `ascii`)).pipe(
      Schema.annotations({ description: `File encoding to use.` }),
    ),
  )
  .parameter(
    `verbose v`,
    Schema.transform(
      Schema.UndefinedOr(Schema.Boolean),
      Schema.Boolean,
      {
        strict: true,
        decode: (value) => value ?? false,
        encode: (value) => value,
      },
    ).pipe(
      Schema.annotations({
        description: `Log detailed progress as conversion executes.`,
        default: false,
      }),
    ),
  )
  .parameter(
    `move m`,
    Schema.transform(
      Schema.UndefinedOr(Schema.Boolean),
      Schema.Boolean,
      {
        strict: true,
        decode: (value) => value ?? false,
        encode: (value) => value,
      },
    ).pipe(
      Schema.annotations({
        description: `Delete the original file after it has been converted.`,
        default: false,
      }),
    ),
  )
  .settings({
    prompt: {
      // TODO allow making parameter level opt-in or opt-out
      // default: false,
      when: [
        {
          result: `rejected`,
          error: `ErrorMissingArgument`,
        },
        { result: `omitted` },
      ],
    },
  })
  .parse()

args.filePath
args.from
args.to
args.output
args.encoding
args.verbose
args.move
