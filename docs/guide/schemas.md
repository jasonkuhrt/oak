# Schemas & Validation

@wollybeard/cli uses schemas for parameter validation and type inference.

## Built-in Zod Support

The Zod extension provides seamless integration:

```typescript
import { Command } from '@wollybeard/cli'
import { Zod } from '@wollybeard/cli/extensions'
import { z } from 'zod/v4'

const args = Command.create()
  .use(Zod)
  .parameter('email', z.string().email())
  .parameter('age', z.number().int().positive())
  .parse()
```

## Schema Types

All Zod schemas are supported:

### Primitives
```typescript
.parameter('name', z.string())
.parameter('age', z.number())
.parameter('active', z.boolean())
```

### Refinements
```typescript
.parameter('email', z.string().email())
.parameter('url', z.string().url())
.parameter('uuid', z.string().uuid())
```

### Constraints
```typescript
.parameter('port', z.number().min(1).max(65535))
.parameter('username', z.string().min(3).max(20))
.parameter('rating', z.number().int().min(1).max(5))
```

### Enums
```typescript
.parameter('env', z.enum(['dev', 'staging', 'prod']))
.parameter('level', z.nativeEnum(LogLevel))
```

### Unions
```typescript
.parameter('value', z.union([
  z.string(),
  z.number()
]))
```

### Transformations
```typescript
.parameter('date', z.string().transform((str) => new Date(str)))
.parameter('json', z.string().transform((str) => JSON.parse(str)))
```

## Error Messages

Schema validation errors are automatically formatted:

```bash
cli --age "not a number"
```

```
Cannot run command, you made some mistakes:

Invalid argument for parameter: "age". The error was:
Expected number, received string

Here are the docs for this command:

PARAMETERS
  Name    Type      Default
  age     number    REQUIRED
```

## Custom Error Messages

Provide custom error messages:

```typescript
.parameter('age',
  z.number()
    .min(18, 'Must be 18 or older')
    .max(100, 'Must be 100 or younger')
)
```

## Custom Schemas

You can extend the framework with custom schema implementations:

```typescript
import type { Extension } from '@wollybeard/cli'

const MySchemaExtension: Extension<MySchemaType> = {
  // Implementation details
}

const args = Command.create()
  .use(MySchemaExtension)
  .parameter('value', mySchema)
  .parse()
```

## Standard Schema Support

@wollybeard/cli supports the [Standard Schema](https://github.com/standard-schema/standard-schema) specification, making it compatible with various validation libraries.

## Next Steps

- [Extensions](/guide/extensions) - Build custom extensions
- [Parameters](/guide/parameters) - Parameter configuration
