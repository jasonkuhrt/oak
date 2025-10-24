/**
 * Test Str.Visual.width() to verify Intl.Segmenter behavior across environments.
 * Theory: Node 22 vs 24 have different ICU data → different grapheme segmentation → different widths
 */
import { Str } from '@wollybeard/kit'
import chalk from 'chalk'
import { test } from 'vitest'

const testStrings = [
  'Name',
  'Type',
  'Default',
  'Environment (1)',
  chalk.underline('Name'),
  chalk.underline('Type'),
  chalk.underline('Default'),
  chalk.underline('Environment (1)'),
  'foo',
  'string',
  'undefined',
  '✓',
]

test('Str.Visual.width measurements', () => {
  console.log('=== STR.VISUAL.WIDTH MEASUREMENTS ===')
  console.log(`Node version: ${process.version}`)
  console.log(`Platform: ${process.platform}`)
  console.log('')

  testStrings.forEach((str, i) => {
    const width = Str.Visual.width(str)
    const displayStr = str.includes('\u001b') ? '<with-ansi>' : str
    console.log(`[${i}] "${displayStr}" → width: ${width}`)
  })

  console.log('')
  console.log('CRITICAL STRINGS:')
  console.log(`"Environment (1)" width: ${Str.Visual.width('Environment (1)')}`)
  console.log(`chalk.underline("Environment (1)") width: ${Str.Visual.width(chalk.underline('Environment (1)'))}`)
})
