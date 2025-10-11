# Examples

Learn by example with these real-world use cases.

## Basic Examples

### [Introduction Example](/examples/intro)
A simple CLI demonstrating core features.

```bash
tsx examples/intro.ts --help
```

### [Interactive Prompts](/examples/prompts)
Using interactive prompts for missing parameters.

```bash
tsx examples/prompt.ts
```

### [Kitchen Sink](/examples/kitchen-sink)
Comprehensive example showing all features.

```bash
tsx examples/kitchen-sink.ts --help
```

## Common Patterns

### Simple CLI Tool

```typescript
import { Command } from '@wollybeard/cli'
import { Zod } from '@wollybeard/cli/extensions'
import { z } from 'zod/v4'

const args = Command.create()
  .use(Zod)
  .parameter('input', z.string())
  .parameter('output', z.string())
  .parameter('v verbose', z.boolean().default(false))
  .parse()

if (args.verbose) {
  console.log(`Processing ${args.input} -> ${args.output}`)
}

// Your logic here
```

### With Validation

```typescript
const args = Command.create()
  .use(Zod)
  .parameter('email', z.string().email())
  .parameter('age', z.number().min(18).max(100))
  .parse()

// All values are validated
console.log(`Email: ${args.email}`)
console.log(`Age: ${args.age}`)
```

### With Prompts

```typescript
const args = Command.create()
  .use(Zod)
  .parameter('name', {
    type: z.string(),
    prompt: true
  })
  .parameter('email', {
    type: z.string().email(),
    prompt: true
  })
  .parse()
```

### With Environment Variables

```typescript
const args = Command.create()
  .use(Zod)
  .parameter('api-key', z.string())
  .settings({
    parameters: {
      environment: {
        prefix: ['MY_APP_']
      }
    }
  })
  .parse()

// Can be set via:
// - CLI: --api-key secret
// - ENV: MY_APP_API_KEY=secret
```

### Mutually Exclusive Parameters

```typescript
const args = Command.create()
  .use(Zod)
  .parametersExclusive('action', ($) =>
    $.parameter('create', z.string())
      .parameter('delete', z.string())
      .parameter('update', z.string())
  )
  .parse()

// Only one of create, delete, or update can be provided
```

## Running Examples

All examples are in the `examples/` directory:

```bash
# Run with tsx
tsx examples/intro.ts --help

# Or add to package.json scripts
{
  "scripts": {
    "example:intro": "tsx examples/intro.ts"
  }
}

pnpm example:intro -- --help
```

## Next Steps

- [Getting Started](/guide/getting-started) - Build your first CLI
- [API Reference](/api/) - Complete API documentation
