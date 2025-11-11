# Effect Schema Extension

The `EffectSchema` extension lets you use Effect Schema schemas wherever types are accepted, providing powerful runtime validation with excellent type inference.

## Installation

To use this extension you must install `effect` into your project:

```bash
npm add effect
```

## Basic Usage

Import the extension and use it with your command:

```ts
import { Command } from '@wollybeard/oak'
import { EffectSchema } from '@wollybeard/oak/extensions'
import { Schema } from 'effect'

const args = await Command.create()
  .use(EffectSchema)
  .parameter('name', Schema.String)
  .parameter('age', Schema.Number)
  .parse()
```

## Schema to CLI Mapping

### Basic Types

| Effect Schema                                  | Oak Type                                     | CLI Input Example |
| ---------------------------------------------- | -------------------------------------------- | ----------------- |
| `Schema.String`                                | [`string`](/guides/parameter-types#string)   | `--name "John"`   |
| `Schema.Number`                                | [`number`](/guides/parameter-types#number)   | `--age 25`        |
| `Schema.Boolean`                               | [`boolean`](/guides/parameter-types#boolean) | `--verbose`       |
| `Schema.Literal("a", "b", "c")`                | [`enum`](/guides/parameter-types#enum)       | `--format json`   |
| `Schema.UndefinedOr(T)`                        | Optional parameter                           | (can be omitted)  |
| `Schema.NullOr(T)`                             | Optional parameter                           | (can be omitted)  |
| `Schema.NullishOr(T)` (undefined \| null \| T) | Optional parameter                           | (can be omitted)  |

### Transformations

Effect Schema transformations are fully supported:

```ts
// NumberFromString - parses CLI string input to number
const args = await Command.create()
  .use(EffectSchema)
  .parameter('port', Schema.NumberFromString)
  .parse()

// Custom transformations
const UpperCase = Schema.transform(
  Schema.String,
  Schema.String,
  {
    strict: true,
    decode: (s) => s.toUpperCase(),
    encode: (s) => s.toLowerCase(),
  },
)

const args = await Command.create()
  .use(EffectSchema)
  .parameter('name', UpperCase)
  .parse()
// Input: --name "john" → Output: { name: "JOHN" }
```

## Optional Parameters

Effect Schema provides several ways to make parameters optional:

### `Schema.UndefinedOr(T)` - Simple Optional

Makes a parameter optional - returns `undefined` when omitted:

```ts
const args = await Command.create()
  .use(EffectSchema)
  .parameter('config', Schema.UndefinedOr(Schema.String))
  .parse()

// Type: { config: string | undefined }
// When omitted: { config: undefined }
```

## Refinements and Validation

Effect Schema's refinement methods are fully supported and appear in help text:

### String Refinements

```ts
const args = await Command.create()
  .use(EffectSchema)
  .parameter(
    'username',
    Schema.String.pipe(
      Schema.minLength(3),
      Schema.maxLength(20),
      Schema.pattern(/^[a-zA-Z0-9_]+$/),
      Schema.annotations({ description: 'User name' }),
    ),
  )
  .parse()

// Help text shows: "string (min length: 3, max length: 20, pattern: ^[a-zA-Z0-9_]+$)"
// Invalid input: --username "ab" → Error: minLength(3) - string must be at least 3 characters
```

### Number Refinements

```ts
const args = await Command.create()
  .use(EffectSchema)
  .parameter(
    'age',
    Schema.Number.pipe(
      Schema.int(), // Must be integer
      Schema.positive(), // Must be > 0
      Schema.lessThan(150), // Must be < 150
      Schema.annotations({ description: 'Age in years' }),
    ),
  )
  .parse()

// Help text shows: "number (integer, > 0, < 150)"
```

## Descriptions and Help Text

Use `Schema.annotations()` to provide descriptions that appear in CLI help:

```ts
const args = await Command.create()
  .use(EffectSchema)
  .parameter(
    'filePath',
    Schema.String.pipe(
      Schema.annotations({
        description: 'Path to the file to process',
      }),
    ),
  )
  .parameter(
    'format',
    Schema.Literal('json', 'yaml', 'toml').pipe(
      Schema.annotations({
        description: 'Output format',
      }),
    ),
  )
  .parse()
```

The `description` annotation can be placed anywhere in the pipe chain:

```ts
// All of these work:
Schema.String.pipe(
  Schema.annotations({ description: '...' }),
  Schema.minLength(5),
)
Schema.String.pipe(
  Schema.minLength(5),
  Schema.annotations({ description: '...' }),
)
Schema.String.pipe(Schema.minLength(5)).pipe(
  Schema.annotations({ description: '...' }),
)
```

## Union Types and Enums

### Literal Unions (Enum-like)

When all union members are literals, they're treated as an enum:

```ts
const args = await Command.create()
  .use(EffectSchema)
  .parameter(
    'logLevel',
    Schema.Literal('debug', 'info', 'warn', 'error').pipe(
      Schema.annotations({ description: 'Logging level' }),
    ),
  )
  .parse()

// Type: { logLevel: 'debug' | 'info' | 'warn' | 'error' }
// Help shows: "'debug' | 'info' | 'warn' | 'error'"
```

### Complex Unions

Unions of different types are also supported:

```ts
const args = await Command.create()
  .use(EffectSchema)
  .parameter(
    'timeout',
    Schema.Union(
      Schema.Literal('none'),
      Schema.Number,
    ),
  )
  .parse()

// Type: { timeout: 'none' | number }
```

## Complete Example

Here's a real-world CLI application using Effect Schema:

```ts
import { Command } from '@wollybeard/oak'
import { EffectSchema } from '@wollybeard/oak/extensions'
import { Schema } from 'effect'

const args = await Command.create()
  .use(EffectSchema)
  .description('File format converter')
  .parameter(
    'filePath',
    Schema.String.pipe(
      Schema.annotations({ description: 'Path to the file to convert' }),
    ),
  )
  .parameter(
    'to',
    Schema.Literal('json', 'yaml', 'toml').pipe(
      Schema.annotations({ description: 'Format to convert to' }),
    ),
  )
  .parameter(
    'from',
    Schema.UndefinedOr(Schema.Literal('json', 'yaml', 'toml')).pipe(
      Schema.annotations({
        description: 'Source format (auto-detected if omitted)',
      }),
    ),
  )
  .parameter(
    'output o',
    Schema.UndefinedOr(Schema.String).pipe(
      Schema.annotations({
        description: 'Output file path (prints to stdout if omitted)',
      }),
    ),
  )
  .parameter(
    'encoding',
    Schema.NullOr(Schema.Literal('utf8', 'utf16', 'ascii')).pipe(
      Schema.annotations({ description: 'File encoding to use' }),
    ),
  )
  .parameter(
    'verbose v',
    Schema.transform(
      Schema.UndefinedOr(Schema.Boolean),
      Schema.Boolean,
      {
        strict: true,
        decode: (value) => value ?? false,
        encode: (value) => value,
      },
    ).pipe(
      Schema.annotations({
        description: 'Log detailed progress as conversion executes',
        default: false,
      }),
    ),
  )
  .parameter(
    'move m',
    Schema.transform(
      Schema.UndefinedOr(Schema.Boolean),
      Schema.Boolean,
      {
        strict: true,
        decode: (value) => value ?? false,
        encode: (value) => value,
      },
    ).pipe(
      Schema.annotations({
        description: 'Delete the original file after conversion',
        default: false,
      }),
    ),
  )
  .settings({
    prompt: {
      when: [
        { result: 'rejected', error: 'ErrorMissingArgument' },
        { result: 'omitted' },
      ],
    },
  })
  .parse()

// Full type inference:
// args: {
//   filePath: string
//   to: 'json' | 'yaml' | 'toml'
//   from: 'json' | 'yaml' | 'toml' | undefined
//   output: string | undefined
//   encoding: 'utf8' | 'utf16' | 'ascii' | null
//   verbose: boolean
//   move: boolean
// }

console.log(`Converting ${args.filePath} to ${args.to} format`)
if (args.verbose) console.log('Verbose mode enabled')
if (args.output) console.log(`Output will be written to ${args.output}`)
```

## Advanced Patterns

### Branded Types

Effect Schema's branded types work seamlessly:

```ts
import { Brand, Schema } from 'effect'

type UserId = string & Brand.Brand<'UserId'>
const UserId = Schema.String.pipe(
  Schema.pattern(/^user_[0-9]+$/),
  Schema.brand('UserId'),
)

const args = await Command.create()
  .use(EffectSchema)
  .parameter('userId', UserId)
  .parse()

// Type: { userId: UserId }
// The branded type is preserved in the output
```

### Custom Error Messages

Use `Schema.message` to provide custom validation errors:

```ts
const args = await Command.create()
  .use(EffectSchema)
  .parameter(
    'email',
    Schema.String.pipe(
      Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/),
      Schema.message(() => 'Please provide a valid email address'),
    ),
  )
  .parse()
```

### Composed Schemas

Break down complex schemas into reusable parts:

```ts
const Port = Schema.Number.pipe(
  Schema.int(),
  Schema.greaterThanOrEqualTo(1),
  Schema.lessThanOrEqualTo(65535),
  Schema.annotations({ description: 'TCP port number' }),
)

const Host = Schema.String.pipe(
  Schema.pattern(/^[a-zA-Z0-9.-]+$/),
  Schema.annotations({ description: 'Hostname or IP address' }),
)

const args = await Command.create()
  .use(EffectSchema)
  .parameter('host', Host)
  .parameter('port', Port)
  .parse()
```

## API Reference

### Extension Export

```ts
import { EffectSchema } from '@wollybeard/oak/extensions'
```

The `EffectSchema` extension object provides:

- **`toStandardSchema`**: Converts Effect Schema to Standard Schema V1 format
- **`extractMetadata`**: Extracts type information, descriptions, and optionality for CLI help generation

### Metadata Structure

The extension extracts the following metadata from schemas:

- **`description`**: From `Schema.annotations({ description: '...' })`
- **`optionality`**: Detected from `UndefinedOr`, `NullOr`, or transformation patterns
  - `{ _tag: 'required' }` - Parameter must be provided
  - `{ _tag: 'optional' }` - Parameter can be omitted
  - `{ _tag: 'default', getValue: () => value }` - Parameter has a default value
- **`schema`**: Type information for help text display
  - `{ _tag: 'string' }` - String type
  - `{ _tag: 'number' }` - Number type
  - `{ _tag: 'boolean' }` - Boolean type
  - `{ _tag: 'literal', value }` - Literal value
  - `{ _tag: 'enum', values }` - Enum-like union of literals
  - `{ _tag: 'union', members }` - Complex union
- **`helpHints`**: Additional display information
  - `displayType` - Human-readable type string (e.g., `"'json' | 'yaml' | 'toml'"`)
  - `refinements` - List of constraint descriptions (e.g., `["min length: 3", "pattern: ^[a-z]+$"]`)
  - `priority` - Display priority for parameter sorting

## Comparison with Zod

Both Zod and Effect Schema are excellent choices for CLI validation. Here's a comparison:

| Feature                    | Zod                            | Effect Schema                         |
| -------------------------- | ------------------------------ | ------------------------------------- |
| **Basic Types**            | ✅ Full support                | ✅ Full support                       |
| **Optional Parameters**    | `.optional()`, `.default(...)` | `UndefinedOr`, `NullOr`, Transform    |
| **Refinements**            | ✅ Full support                | ✅ Full support                       |
| **Transformations**        | `.transform(...)`              | `Schema.transform(...)`               |
| **Branded Types**          | `.brand()`                     | `Schema.brand(...)`                   |
| **Union Types**            | `z.union(...)`                 | `Schema.Union(...)`                   |
| **Error Messages**         | `.refine()`                    | `Schema.message(...)`                 |
| **Ecosystem Integration**  | Broader JS ecosystem           | Effect ecosystem (Runtime, STM, etc.) |
| **Type-level Programming** | Good                           | Excellent (AST-based)                 |
| **Learning Curve**         | Gentle                         | Steeper (but very powerful)           |

### When to Choose Effect Schema:

- You're already using the Effect ecosystem
- You need advanced type-level programming features
- You want deep AST introspection capabilities
- You prefer functional programming patterns

### When to Choose Zod:

- You want a simpler, more familiar API
- You're not using the Effect ecosystem
- You prefer a gentler learning curve
- You need broader community adoption

Both extensions provide excellent type safety and runtime validation for your CLI applications!
