# Getting Started

@wollybeard/cli is a type-safe CLI framework for TypeScript that provides full type inference from parameter definitions to runtime execution.

## Quick Example

```typescript
import { Command } from '@wollybeard/cli'
import { Zod } from '@wollybeard/cli/extensions'
import { z } from 'zod/v4'

const args = Command.create()
  .use(Zod)
  .parameter('name', z.string())
  .parameter('age', z.number().optional())
  .parse()

console.log(`Hello ${args.name}!`)
if (args.age) console.log(`You are ${args.age} years old.`)
```

## Running the Example

Save the code above to `cli.ts` and run it:

```bash
# Install dependencies
pnpm add @wollybeard/cli zod

# Run with parameters
tsx cli.ts --name John --age 30
# Output: Hello John!
#         You are 30 years old.

# Run without optional parameter
tsx cli.ts --name Jane
# Output: Hello Jane!

# Get help
tsx cli.ts --help
# Shows auto-generated help documentation
```

## What Makes It Different?

### Type Safety

Traditional CLI frameworks lose type information:

```typescript
// Traditional approach - types are lost
const args = someCliFramework
  .option('--name <name>')
  .option('--age <age>')
  .parse()

args.name // type: any 😞
```

With @wollybeard/cli, types flow through:

```typescript
const args = Command.create()
  .use(Zod)
  .parameter('name', z.string())
  .parameter('age', z.number().optional())
  .parse()

args.name // type: string ✅
args.age  // type: number | undefined ✅
```

### Runtime Validation

Parameters are validated at runtime using schemas:

```typescript
// This will fail with a clear error message
tsx cli.ts --name John --age "not a number"
// Error: Invalid argument for parameter "age". Expected number.
```

### Auto-generated Help

Help documentation is generated from your parameter definitions:

```bash
tsx cli.ts --help
```

```
PARAMETERS

  Name     Type                Default       Environment (1)
  ────────────────────────────────────────────────────────
  name     string              REQUIRED      ✓
  age      number              undefined     ✓

NOTES
──────────────────────────────────────────────────────────
(1) Parameters can be passed via environment variables.
    Environment variable names are snake cased versions
    of the parameter name, prefixed with CLI_PARAMETER_
    or CLI_PARAM_ (case insensitive).
```

## Next Steps

- [Installation](/guide/installation) - Detailed installation instructions
- [Parameters](/guide/parameters) - Learn about parameter types and validation
- [Prompts](/guide/prompts) - Add interactive prompts to your CLI
- [Examples](/examples/) - See more real-world examples
