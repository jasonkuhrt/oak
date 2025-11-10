import { Effect } from 'effect'
import type { OakSchema } from '../../../schema/oak-schema.js'
import type { InferOutput } from '../../../schema/standard-schema.js'
import { Term } from '../../../term.js'
import type { KeyPress } from '../../KeyPress/_.ts'
import type { Pam } from '../../Pam/_.ts'
import { PromptEngine } from '../../PromptEngine/PromptEngine.js'
import { Text } from '../../Text/_.ts'

export interface Prompter {
  /**
   * Send output to the user.
   */
  say: (text: string) => void
  /**
   * Receive input from the user.
   * TODO remove prompt config from here.
   */
  ask: <$Schema extends OakSchema>(params: {
    parameter: Pam.Parameter<$Schema>
    prompt: string
    question: string
    marginLeft?: number
  }) => Effect.Effect<InferOutput<$Schema['standardSchema']>>
}

export const create = (channels: PromptEngine.Channels): Prompter => {
  return {
    say: (value: string) => {
      channels.output(value + Text.chars.newline)
    },
    ask: <$Schema extends OakSchema>(params: {
      parameter: Pam.Parameter<$Schema>
      prompt: string
      question: string
      marginLeft?: number
    }): Effect.Effect<InferOutput<$Schema['standardSchema']>> => {
      channels.output(params.question + Text.chars.newline)
      const schema = params.parameter.type.metadata.schema
      const marginLeft = params.marginLeft ?? 0

      // String and Number types - use key press input to build string
      if (schema._tag === `string` || schema._tag === `number`) {
        const isOptional = params.parameter.type.metadata.optionality._tag !== `required`
        return Effect.gen(function*(_) {
          const result = yield* _(
            PromptEngine.create({
              channels,
              initialState: { value: `` },
              skippable: isOptional,
              draw: (state) => {
                return Text.pad(`left`, marginLeft, ` `, `${params.prompt}${state.value}`)
              },
              on: [
                {
                  // Match backspace separately
                  match: `backspace`,
                  run: (state: { value: string }) => ({ value: state.value.slice(0, -1) }),
                },
                {
                  // Match all other keys by having empty match criteria (matches everything)
                  // The PromptEngine filters out return/escape automatically
                  match: {},
                  run: (state: { value: string }, event: KeyPress.KeyPressEvent) => {
                    // Add the character if it has a sequence (printable character)
                    if (event.sequence && event.sequence !== ``) {
                      return { value: state.value + event.sequence }
                    }
                    return state
                  },
                },
              ] as any,
            }),
          )
          if (result === null) return undefined as any
          const value = result.value
          if (schema._tag === `number`) {
            return Number(value) as any
          }
          return value as any
        })
      }

      // Boolean type - toggle between yes/no
      if (schema._tag === `boolean`) {
        return Effect.gen(function*(_) {
          const result = yield* _(
            PromptEngine.create({
              channels,
              initialState: { value: false },
              draw: (state) => {
                const yes = state.value ? Term.colors.positive(`yes`) : `yes`
                const no = !state.value ? Term.colors.positive(`no`) : `no`
                return Text.pad(`left`, marginLeft, ` `, `${params.prompt}${yes} / ${no}`)
              },
              on: [
                {
                  match: [`right`, `left`, `tab`],
                  run: (state) => ({ value: !state.value }),
                },
              ],
            }),
          )
          if (result === null) throw new Error(`Boolean selection cancelled`)
          return result.value as any
        })
      }

      // Enum type - select from values
      if (schema._tag === `enum`) {
        return Effect.gen(function*(_) {
          const values = schema.values
          const result = yield* _(
            PromptEngine.create({
              channels,
              initialState: { index: 0 },
              draw: (state) => {
                const options = values
                  .map((v, i) => (i === state.index ? Term.colors.positive(String(v)) : String(v)))
                  .join(` / `)
                return Text.pad(`left`, marginLeft, ` `, `${params.prompt}${options}`)
              },
              on: [
                {
                  match: [`right`, `tab`],
                  run: (state) => ({ index: (state.index + 1) % values.length }),
                },
                {
                  match: [{ name: `tab`, shift: true }, `left`],
                  run: (state) => ({ index: (state.index - 1 + values.length) % values.length }),
                },
              ],
            }),
          )
          if (result === null) throw new Error(`Enum selection cancelled`)
          return values[result.index] as any
        })
      }

      // Union type - first select type, then prompt for value
      if (schema._tag === `union`) {
        return Effect.gen(function*(_) {
          // First prompt: select which union member type to use
          const typeNames = schema.members.map((m) => m._tag)
          const typeResult = yield* _(
            PromptEngine.create({
              channels,
              initialState: { index: 0 },
              draw: (state) => {
                const options = typeNames
                  .map((name, i) => (i === state.index ? Term.colors.positive(name) : name))
                  .join(` / `)
                return Text.pad(`left`, marginLeft, ` `, `${params.prompt}select type: ${options}`)
              },
              on: [
                {
                  match: [`right`, `tab`],
                  run: (state) => ({ index: (state.index + 1) % typeNames.length }),
                },
                {
                  match: [{ name: `tab`, shift: true }, `left`],
                  run: (state) => ({ index: (state.index - 1 + typeNames.length) % typeNames.length }),
                },
              ],
            }),
          )
          if (typeResult === null) throw new Error(`Union type selection cancelled`)

          // Second prompt: prompt for the selected type
          const selectedSchema = schema.members[typeResult.index]!
          const prompter = create(channels) as Prompter
          return yield* _(
            prompter.ask({
              ...params,
              parameter: {
                ...params.parameter,
                type: {
                  ...params.parameter.type,
                  metadata: {
                    ...params.parameter.type.metadata,
                    schema: selectedSchema,
                  },
                },
              } as any,
            }),
          )
        }) as any
      }

      // Literal type - just return the literal value
      if (schema._tag === `literal`) {
        channels.output(Text.pad(`left`, marginLeft, ` `, `${params.prompt}${schema.value}`))
        return Effect.succeed(schema.value as any)
      }

      // Fallback for unknown types
      throw new Error(`Prompting not implemented for schema type: ${(schema as any)._tag}`)
    },
  }
}
