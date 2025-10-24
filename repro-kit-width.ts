/**
 * Minimal reproduction case for kit Tex width propagation issue in CI.
 *
 * Expected: Table spans full 120 character width with "Environment (1)" header showing in full
 * Actual in CI: Table truncates to ~80 characters, showing only "Environment" or "En"
 * Actual locally: Works correctly, shows full "Environment (1)"
 *
 * Run: tsx repro-kit-width.ts
 */

import { Cli } from '@wollybeard/kit'
import stripAnsi from 'strip-ansi'

const TERMINAL_WIDTH = 120

console.log(`process.stdout.columns = ${process.stdout.columns}`)
console.log(`Explicitly setting spanRange.cross.max = ${TERMINAL_WIDTH}`)
console.log('')

const output = Cli.Tex.Tex({ spanRange: { cross: { max: TERMINAL_WIDTH } } })
  .block({ padding: [1, 0] }, 'TEST TABLE')
  .block(
    { padding: { crossStart: 2 }, spanRange: { cross: { max: TERMINAL_WIDTH } } },
    ($) =>
      $.table(
        { separators: { column: '   ', row: null } },
        ($) =>
          $.header({ padding: { mainEnd: 1, crossEnd: 2 } }, 'Name')
            .header(
              {
                spanRange: { cross: { min: 8 } },
                padding: { crossEnd: 5 },
              },
              'Type/Description',
            )
            .header({ padding: { crossEnd: 4 } }, 'Default')
            .header('Environment (1)') // ← This gets truncated in CI
            .rows([
              ['foo', 'string', 'undefined', '✓'],
            ]),
      ),
  )
  .render()

console.log(output)
console.log('')
console.log('--- Monochrome version ---')
console.log(stripAnsi(output))
console.log('')

const lines = stripAnsi(output).split('\n')
const headerLine = lines.find(line => line.includes('Name') && line.includes('Type'))

if (headerLine) {
  console.log(`Header line length: ${headerLine.length}`)
  console.log(`Header line: "${headerLine}"`)

  if (headerLine.includes('Environment (1)')) {
    console.log('✅ PASS: Full header text visible')
  } else if (headerLine.includes('Environment')) {
    console.log('❌ FAIL: Header truncated (has "Environment" but missing " (1)")')
  } else if (headerLine.includes('En')) {
    console.log('❌ FAIL: Header severely truncated (only "En" visible)')
  } else {
    console.log('❌ FAIL: Environment header not found at all')
  }
}
