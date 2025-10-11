# API Reference

Complete API documentation for @wollybeard/cli.

## Core Modules

### [Command](/api/command)
The main entry point for creating CLI applications.

```typescript
import { Command } from '@wollybeard/cli'
```

### [Parameter](/api/parameter)
Parameter definition and configuration.

```typescript
.parameter(name, schema)
.parametersExclusive(name, builder)
```

### [Settings](/api/settings)
Global configuration and settings.

```typescript
.settings({ /* config */ })
```

## Extensions

### [Zod Extension](/api/zod)
Zod schema integration.

```typescript
import { Zod } from '@wollybeard/cli/extensions'
```

## Type Exports

### [Types](/api/types)
TypeScript type utilities and exports.

```typescript
import type { /* types */ } from '@wollybeard/cli/types'
```

## Quick Reference

### Command Methods

| Method | Description |
|--------|-------------|
| `.create()` | Create a new command builder |
| `.use()` | Add an extension |
| `.parameter()` | Add a parameter |
| `.parametersExclusive()` | Add mutually exclusive parameters |
| `.settings()` | Configure global settings |
| `.parse()` | Parse and validate arguments |

### Parameter Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | Schema | Validation schema |
| `prompt` | boolean \| object | Enable interactive prompts |
| `environment` | boolean \| object | Environment variable support |
| `default` | any | Default value |
| `description` | string | Help text description |

### Settings

| Setting | Type | Description |
|---------|------|-------------|
| `prompt` | object | Global prompt configuration |
| `parameters.environment` | object | Environment variable configuration |
| `onOutput` | function | Custom output handler |

## Next Steps

- [Command API](/api/command) - Detailed command documentation
- [Parameter API](/api/parameter) - Parameter configuration
- [Examples](/examples/) - See it in action
