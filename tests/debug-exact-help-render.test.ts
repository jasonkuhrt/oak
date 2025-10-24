/**
 * Test the EXACT Help.render() code path to see if it fails in CI.
 */
import { beforeEach, test, vi } from 'vitest'
import { z } from 'zod/v4'
import { $, s } from './_/helpers.js'
import { createState } from './environment/__helpers__.js'

const output = createState<string>({
  value: (values) => values.join(``),
})

const onOutput = output.set

beforeEach(() => {
  vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
})

test('exact Help.render path - basic test from rendering.spec.ts', () => {
  $.description(`Blah blah blah`)
    .parameter(`foo`, s.optional())
    .settings({ onOutput })
    .parse({ line: [`-h`] })

  const lines = output.value.split('\n')
  const headerLine = lines.find(l => l.includes('Name') && l.includes('Type'))

  console.log('=== EXACT HELP.RENDER OUTPUT ===')
  console.log('Full output length:', output.value.length)
  console.log('Header line:', JSON.stringify(headerLine))
  console.log('Has "Environment (1)"?', headerLine?.includes('Environment (1)'))
  console.log('Has just "Environment"?', headerLine?.includes('Environment') && !headerLine?.includes('(1)'))
  console.log('Line length:', headerLine?.length)
})

test('ISOLATED: table with Cli.Tex.block cells like Help.ts does', async () => {
  const chalk = await import('chalk')
  const { Cli } = await import('@wollybeard/kit')

  const output = Cli.Tex.Tex({ terminalWidth: 120 })
    .block({ padding: [1, 0] }, 'PARAMETERS')
    .block(
      { padding: { crossStart: 2 } },
      ($) =>
        $.table(
          { separators: { column: `   `, row: null } },
          ($) =>
            $.header({ padding: { mainEnd: 1, crossEnd: 2 } }, 'Name')
              .header({ spanRange: { cross: { min: 8 } }, padding: { crossEnd: 5 } }, 'Type')
              .header({ padding: { crossEnd: 4 } }, 'Default')
              .header('Environment (1)')
              .rows([[
                'foo',
                Cli.Tex.block({ padding: { crossEnd: 9, mainEnd: 1 } }, 'string'),  // ← Like Help.ts!
                Cli.Tex.block({}, 'undefined'),
                '✓',
              ]]),
        ),
    )
    .render()

  const lines = output.split('\n')
  const headerLine = lines.find(l => l.includes('Name'))

  console.log('=== WITH CLI.TEX.BLOCK CELLS ===')
  console.log('Header:', JSON.stringify(headerLine))
  console.log('Has full "Environment (1)"?', headerLine?.includes('Environment (1)'))
  console.log('Length:', headerLine?.length)
})
