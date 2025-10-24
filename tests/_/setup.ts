// Mock terminal width for consistent snapshots across environments
// This must be done before any imports that might use process.stdout.columns

// Set terminal width environment variables
process.env.COLUMNS = '120'
process.env.LINES = '50'

// Store the original descriptor if it exists
const originalDescriptor = Object.getOwnPropertyDescriptor(process.stdout, 'columns')

// Define columns property with value 120 (wider than our 82-char content)
Object.defineProperty(process.stdout, 'columns', {
  value: 120,
  writable: true,
  configurable: true,
  enumerable: originalDescriptor?.enumerable ?? false,
})

// Also set rows for completeness
Object.defineProperty(process.stdout, 'rows', {
  value: 50,
  writable: true,
  configurable: true,
  enumerable: false,
})
