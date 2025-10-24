# @wollybeard/oak

Type-safe CLI command definition and execution.

## Installation

```bash
npm install @wollybeard/oak zod
# or
pnpm add @wollybeard/oak zod
# or
yarn add @wollybeard/oak zod
```

> **Note:** `zod` v4 is a peer dependency.

## Features

- 🔒 **Type-safe** - Full TypeScript support with strong type inference
- 🎨 **Interactive prompts** - Built-in prompt support for missing parameters
- 🌍 **Environment variables** - Automatic environment variable parsing
- 📝 **Auto-generated help** - Beautiful help documentation generated automatically
- 🔌 **Extensible** - Support for custom schemas via extensions (Zod included)

## Quick Start

```typescript
import { Command } from '@wollybeard/oak'
import { Zod } from '@wollybeard/oak/extensions'
import { z } from 'zod/v4'

const args = Command.create()
  .use(Zod)
  .parameter('name', z.string())
  .parameter('age', z.number().optional())
  .parse()

console.log(`Hello ${args.name}!`)
if (args.age) console.log(`You are ${args.age} years old.`)
```

## Examples

Check out the [examples](./examples) directory for more usage patterns:

- [intro.ts](./examples/intro.ts) - Basic usage
- [prompt.ts](./examples/prompt.ts) - Interactive prompts
- [kitchen-sink.ts](./examples/kitchen-sink.ts) - Advanced features
- [publish.ts](./examples/publish.ts) - Real-world example

## Documentation

For detailed documentation, see the JSDoc comments in the source code.

## Alternatives

- [OClif](https://oclif.io) - Full-featured CLI framework
- [Commander](https://github.com/tj/commander.js/) - Popular CLI framework
- [Yargs](https://github.com/yargs/yargs) - Traditional CLI parser
- [Arg](https://github.com/vercel/arg) - Simple argument parser

## Migration from `@molt/command`

This package was previously published as `@molt/command`. To migrate:

1. Update your imports:
   ```typescript
   // Before
   import { Command } from '@molt/command'

   // After
   import { Command } from '@wollybeard/oak'
   ```

2. Update your package.json:
   ```json
   {
     "dependencies": {
       "@wollybeard/oak": "^0.9.0"
     }
   }
   ```

The API remains the same - only the package name has changed.

## License

MIT
