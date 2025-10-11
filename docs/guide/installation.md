# Installation

## Prerequisites

- Node.js 18 or higher
- A package manager (pnpm, npm, or yarn)
- TypeScript 5.0 or higher

## Package Installation

::: code-group

```bash [pnpm]
pnpm add @wollybeard/cli zod
```

```bash [npm]
npm install @wollybeard/cli zod
```

```bash [yarn]
yarn add @wollybeard/cli zod
```

:::

::: info
**Note:** `zod` v4 is a peer dependency required for schema validation.
:::

## TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "esModuleInterop": true,
    "strict": true
  }
}
```

## Project Setup

### 1. Create Your CLI File

Create a new file `cli.ts`:

```typescript
import { Command } from '@wollybeard/cli'
import { Zod } from '@wollybeard/cli/extensions'
import { z } from 'zod/v4'

const args = Command.create()
  .use(Zod)
  .parameter('name', z.string())
  .parse()

console.log(`Hello ${args.name}!`)
```

### 2. Add Run Script

Add to your `package.json`:

```json
{
  "scripts": {
    "cli": "tsx cli.ts"
  }
}
```

### 3. Run Your CLI

```bash
pnpm cli -- --name World
# Output: Hello World!
```

## Development Setup

For development, you may want to install additional tools:

::: code-group

```bash [pnpm]
pnpm add -D tsx typescript @types/node
```

```bash [npm]
npm install -D tsx typescript @types/node
```

```bash [yarn]
yarn add -D tsx typescript @types/node
```

:::

## Verify Installation

Test that everything is working:

```bash
# Show help
pnpm cli -- --help

# Run with parameters
pnpm cli -- --name "Test User"
```

## Next Steps

- [Parameters](/guide/parameters) - Learn about parameter configuration
- [Getting Started](/guide/getting-started) - Build your first CLI
