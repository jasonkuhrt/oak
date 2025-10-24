// Mock terminal width for consistent snapshots across environments
// This must be done before any imports that might use process.stdout.columns

// Store the original descriptor if it exists
const originalDescriptor = Object.getOwnPropertyDescriptor(process.stdout, 'columns')

// Define columns property with value 82 to match our Help.ts spanRange setting
Object.defineProperty(process.stdout, 'columns', {
  value: 82,
  writable: true,
  configurable: true,
  enumerable: originalDescriptor?.enumerable ?? false,
})
