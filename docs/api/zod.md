# Zod Extension API

The Zod extension provides seamless integration with Zod schemas.

## Import

```typescript
import { Zod } from '@wollybeard/cli/extensions'
```

## Usage

Enable Zod support with `.use()`:

```typescript
import { Command } from '@wollybeard/cli'
import { Zod } from '@wollybeard/cli/extensions'
import { z } from 'zod/v4'

const args = Command.create()
  .use(Zod)
  .parameter('name', z.string())
  .parse()
```

## Supported Zod Types

### Primitives

```typescript
.parameter('name', z.string())
.parameter('age', z.number())
.parameter('active', z.boolean())
```

### String Refinements

```typescript
.parameter('email', z.string().email())
.parameter('url', z.string().url())
.parameter('uuid', z.string().uuid())
.parameter('username', z.string().regex(/^[a-z0-9_]+$/))
```

### Number Refinements

```typescript
.parameter('port', z.number().int().min(1).max(65535))
.parameter('rating', z.number().min(1).max(5))
.parameter('percentage', z.number().nonnegative().max(100))
```

### Enums

```typescript
.parameter('env', z.enum(['dev', 'staging', 'prod']))
.parameter('level', z.nativeEnum(LogLevel))
```

### Optional & Default

```typescript
.parameter('name', z.string().optional())
.parameter('port', z.number().default(3000))
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
.parameter('date', z.string().transform(str => new Date(str)))
.parameter('config', z.string().transform(str => JSON.parse(str)))
```

## Type Inference

Zod schemas provide full type inference:

```typescript
const args = Command.create()
  .use(Zod)
  .parameter('email', z.string().email())
  .parameter('age', z.number().min(18).max(100))
  .parameter('role', z.enum(['admin', 'user']))
  .parse()

// TypeScript knows:
args.email  // type: string
args.age    // type: number
args.role   // type: 'admin' | 'user'
```

## Error Messages

Validation errors are automatically formatted:

```bash
cli --age "not a number"
```

```
Invalid argument for parameter: "age"
Expected number, received string
```

### Custom Error Messages

```typescript
.parameter('age', z.number().min(18, {
  message: 'Must be 18 or older'
}))
```

## Advanced Usage

### Chaining Validations

```typescript
.parameter('password',
  z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number')
)
```

### Custom Refinements

```typescript
.parameter('username',
  z.string()
    .refine(val => !val.includes(' '), {
      message: 'Username cannot contain spaces'
    })
    .refine(async val => {
      // Async validation
      return await checkUsernameAvailable(val)
    }, 'Username already taken')
)
```

## Zod Version

@wollybeard/cli requires Zod v4:

```json
{
  "peerDependencies": {
    "zod": "^4.0.0"
  }
}
```

Import from `zod/v4`:

```typescript
import { z } from 'zod/v4'
```

## Next Steps

- [Schemas Guide](/guide/schemas) - Schema validation
- [Extensions](/guide/extensions) - Custom extensions
