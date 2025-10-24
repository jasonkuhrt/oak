import { Cli } from '@wollybeard/kit'
import { test } from 'vitest'

test('kit defaults.terminalWidth value in vitest', () => {
  console.log('=== KIT DEFAULTS IN VITEST ===')
  console.log('Cli.Tex.defaults.terminalWidth:', (Cli.Tex as any).defaults?.terminalWidth)
  console.log('process.stdout.columns:', process.stdout.columns)
  console.log('process.stdout.isTTY:', process.stdout.isTTY)
})

test('actual rendered width with explicit terminalWidth: 120', () => {
  const output = Cli.Tex.Tex({ terminalWidth: 120 })
    .block({ padding: [1, 0] }, 'TEST')
    .block(
      { padding: { crossStart: 2 } },
      ($) =>
        $.table(
          { separators: { column: '   ', row: null } },
          ($) =>
            $.header('Name')
              .header({ spanRange: { cross: { min: 8 } } }, 'Type')
              .header('Default')
              .header('Environment (1)')  // ← Critical test
              .rows([['foo', 'string', 'undefined', '✓']]),
        ),
    )
    .render()

  const lines = output.split('\n')
  const headerLine = lines.find(l => l.includes('Name'))

  console.log('=== RENDERED OUTPUT ===')
  console.log('Header line:', JSON.stringify(headerLine))
  console.log('Has full text?', headerLine?.includes('Environment (1)'))
  console.log('Has partial?', headerLine?.includes('Environment'))
  console.log('Line length:', headerLine?.length)
})

test('width with conditional null block (like Help.ts)', () => {
  const output = Cli.Tex.Tex({ terminalWidth: 120 })
    .block(($) => {
      // Mimic Help.ts conditional description block
      return null
    })
    .block({ padding: [1, 0] }, 'PARAMETERS')
    .block(
      { padding: { crossStart: 2 } },
      ($) =>
        $.table(
          { separators: { column: '   ', row: null } },
          ($) =>
            $.header('Name')
              .header({ spanRange: { cross: { min: 8 } } }, 'Type')
              .header('Default')
              .header('Environment (1)')  // ← Critical test
              .rows([['foo', 'string', 'undefined', '✓']]),
        ),
    )
    .render()

  const lines = output.split('\n')
  const headerLine = lines.find(l => l.includes('Name'))

  console.log('=== WITH NULL BLOCK ===')
  console.log('Header line:', JSON.stringify(headerLine))
  console.log('Has full text?', headerLine?.includes('Environment (1)'))
  console.log('Line length:', headerLine?.length)
})

test('check builder internal state', () => {
  const builder = Cli.Tex.Tex({ terminalWidth: 120 })
  const params = (builder as any)._.node.parameters

  console.log('=== BUILDER INTERNAL STATE ===')
  console.log('spanRange.cross.max:', params?.spanRange?.cross?.max)
  console.log('Full parameters:', JSON.stringify(params, null, 2))
})
