# Types API

Type utilities and exports for TypeScript users.

## Import

```typescript
import type { /* types */ } from '@wollybeard/cli/types'
```

## Core Types

### Extension

Define custom schema extensions.

```typescript
import type { Extension } from '@wollybeard/cli'

const MyExtension: Extension<MySchemaType> = {
  name: 'MyExtension',
  is: (value): value is MySchemaType => {
    // Type guard implementation
  },
  validate: async (schema, value) => {
    // Validation implementation
  },
  getMetadata: (schema) => {
    // Metadata extraction
  }
}
```

### StandardSchemaV1

Standard Schema specification type.

```typescript
import type { StandardSchemaV1 } from '@standard-schema/spec'
```

## Parameter Types

Types for parameter configuration.

```typescript
import type { ParameterConfig } from '@wollybeard/cli/types'

const config: ParameterConfig<z.ZodString> = {
  type: z.string(),
  prompt: true,
  environment: true,
  default: 'default value',
  description: 'Parameter description'
}
```

## Settings Types

Types for settings configuration.

```typescript
import type { Settings } from '@wollybeard/cli/types'

const settings: Settings = {
  prompt: {
    enabled: true
  },
  parameters: {
    environment: {
      prefix: ['MY_APP_']
    }
  }
}
```

## Type Inference

The framework provides full type inference:

```typescript
const args = Command.create()
  .use(Zod)
  .parameter('name', z.string())
  .parameter('age', z.number().optional())
  .parse()

// Inferred types:
type Args = typeof args
// { name: string; age: number | undefined }
```

## Advanced Types

### Exclusive Parameter Union

```typescript
.parametersExclusive('method', ($) =>
  $.parameter('version', z.string())
    .parameter('bump', z.enum(['major', 'minor', 'patch']))
)

// Result type:
// {
//   method:
//     | { _tag: 'version'; value: string }
//     | { _tag: 'bump'; value: 'major' | 'minor' | 'patch' }
// }
```

## Next Steps

- [Extension Guide](/guide/extensions) - Building extensions
- [Command API](/api/command) - Command builder
