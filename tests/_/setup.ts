// Mock terminal width for consistent test snapshots
// This must run before any imports that use process.stdout.columns

const TERMINAL_WIDTH = 120

console.log(`[SETUP] BEFORE: process.stdout.columns = ${process.stdout.columns}`)

// Store original descriptor
const originalDescriptor = Object.getOwnPropertyDescriptor(process.stdout, 'columns')

// Override process.stdout.columns for deterministic test output
Object.defineProperty(process.stdout, 'columns', {
  value: TERMINAL_WIDTH,
  writable: true,
  configurable: true,
  enumerable: originalDescriptor?.enumerable ?? false,
})

console.log(`[SETUP] AFTER: process.stdout.columns = ${process.stdout.columns}`)
