# Parameters

Parameters are the core of your CLI. They define what arguments your command accepts and how they're validated.

## Basic Parameters

Define a parameter with a name and schema:

```typescript
import { Command } from '@wollybeard/cli'
import { Zod } from '@wollybeard/cli/extensions'
import { z } from 'zod/v4'

const args = Command.create()
  .use(Zod)
  .parameter('name', z.string())
  .parameter('age', z.number())
  .parse()
```

## Parameter Types

### String Parameters

```typescript
.parameter('name', z.string())
.parameter('email', z.string().email())
.parameter('url', z.string().url())
```

### Number Parameters

```typescript
.parameter('age', z.number())
.parameter('port', z.number().int().positive())
.parameter('rating', z.number().min(1).max(5))
```

### Boolean Parameters

```typescript
.parameter('verbose', z.boolean())
.parameter('debug', z.boolean().default(false))
```

Usage:
```bash
# Set to true
cli --verbose

# Set to false
cli --no-verbose
```

### Enum Parameters

```typescript
.parameter('mode', z.enum(['dev', 'prod', 'test']))
.parameter('level', z.nativeEnum(LogLevel))
```

## Optional Parameters

Make parameters optional with `.optional()`:

```typescript
.parameter('name', z.string())              // Required
.parameter('age', z.number().optional())    // Optional
```

## Default Values

Provide default values:

```typescript
.parameter('port', z.number().default(3000))
.parameter('env', z.enum(['dev', 'prod']).default('dev'))
```

## Parameter Aliases

Parameters support multiple names:

```typescript
.parameter('v verbose', z.boolean())

// Can be used as:
// --verbose or -v
```

## Parameter Naming

Parameters are automatically converted to camelCase:

```typescript
.parameter('--some-param', z.string())

args.someParam // ✅ camelCase in code
```

CLI usage:
```bash
# Both work
cli --some-param value
cli --someParam value
```

## Validation

Use Zod's powerful validation:

```typescript
.parameter('email', z.string().email())
.parameter('age', z.number().min(18).max(100))
.parameter('username', z.string().regex(/^[a-z0-9_]+$/))
```

## Next Steps

- [Prompts](/guide/prompts) - Add interactive prompts
- [Environment Variables](/guide/environment) - Configure environment variable support
- [Exclusive Parameters](/guide/exclusive-parameters) - Mutually exclusive parameters
