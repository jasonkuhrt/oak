// Mock terminal width for consistent test snapshots
// This must run before any imports that use process.stdout.columns

const TERMINAL_WIDTH = 120

// Store original descriptor
const originalDescriptor = Object.getOwnPropertyDescriptor(process.stdout, 'columns')

// Override process.stdout.columns for deterministic test output
Object.defineProperty(process.stdout, 'columns', {
  value: TERMINAL_WIDTH,
  writable: true,
  configurable: true,
  enumerable: originalDescriptor?.enumerable ?? false,
})

// Debug: Verify setup executed and value was set
console.log(`[setup] Terminal width set to: ${process.stdout.columns}`)
