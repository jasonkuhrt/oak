import { Cli } from '@wollybeard/kit'
import chalk from 'chalk'
import { Effect } from 'effect'
import type { Prompter } from '../lib/Prompter/index.js'
import { Text } from '../lib/Text/index.js'
import * as SchemaRuntime from '../schema/schema-runtime.js'
import { Term } from '../term.js'
import type { ParseProgressPostPrompt, ParseProgressPostPromptAnnotation } from './parse.js'

/**
 * Get args from the user interactively via the console for the given parameters.
 */
export const prompt = (
  parseProgress: ParseProgressPostPromptAnnotation,
  prompter: null | Prompter.Prompter,
): Effect.Effect<ParseProgressPostPrompt> =>
  Effect.gen(function*(_) {
    if (prompter === null) return parseProgress as ParseProgressPostPrompt

    const args: Record<string, any> = {}
    const parameters = Object.entries(parseProgress.basicParameters)
      .filter((_) => _[1].prompt.enabled)
      .map((_) => _[1].spec)
    const indexTotal = parameters.length
    let indexCurrent = 1
    const gutterWidth = String(indexTotal).length * 2 + 3

    for (const parameter of parameters) {
      // Explicitly set terminal width for deterministic rendering (kit 0.87.0+)
      const PROMPT_TERMINAL_WIDTH = 120
      const question = Cli.Tex.Tex({ orientation: `horizontal`, terminalWidth: PROMPT_TERMINAL_WIDTH })
        .block({ padding: { mainEnd: 2 } }, `${Term.colors.dim(`${indexCurrent}/${indexTotal}`)}`)
        .block((__) =>
          __.block(
            Term.colors.positive(parameter.name.canonical)
              + `${
                parameter.type.metadata.optionality._tag === `required`
                  ? ``
                  : chalk.dim(` optional (press esc to skip)`)
              }`,
          )
            .block(
              (parameter.type.metadata.description && Term.colors.dim(parameter.type.metadata.description)) ?? null,
            )
        )
        .render()
      while (true) {
        const asking = prompter.ask({
          question,
          prompt: `❯ `,
          marginLeft: gutterWidth,
          parameter: parameter as any,
        })
        const arg = yield* _(asking)
        const validationResult = SchemaRuntime.validate(parameter.type, arg)
        if (validationResult._tag === `Right`) {
          args[parameter.name.canonical] = validationResult.right
          prompter.say(``) // newline
          indexCurrent++
          break
        } else {
          prompter.say(
            Text.pad(
              `left`,
              gutterWidth,
              ` `,
              Term.colors.alert(`Invalid value: ${validationResult.left.errors.join(`, `)}`),
            ),
          )
        }
      }
    }

    // todo do not mutate
    const parseProgressPostPrompt = parseProgress as ParseProgressPostPrompt
    for (const [parameterName, arg] of Object.entries(args)) {
      parseProgressPostPrompt.basicParameters[parameterName]!.prompt.arg = arg
    }

    return parseProgressPostPrompt
  })
