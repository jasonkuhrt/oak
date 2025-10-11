# Command API

The Command API is the main entry point for creating CLI applications.

## Command.create()

Creates a new command builder instance.

```typescript
import { Command } from '@wollybeard/cli'

const command = Command.create()
```

## Methods

### .use(extension)

Add an extension for schema validation.

```typescript
import { Zod } from '@wollybeard/cli/extensions'

command.use(Zod)
```

**Parameters:**
- `extension` - Extension object implementing the schema validation interface

**Returns:** Command builder instance (chainable)

### .parameter(name, schema)

Add a parameter to the command.

```typescript
command.parameter('name', z.string())
command.parameter('age', z.number().optional())
```

**Parameters:**
- `name` - Parameter name (supports aliases like `'v verbose'`)
- `schema` - Validation schema or configuration object

**Returns:** Command builder instance (chainable)

### .parametersExclusive(groupName, builder)

Add mutually exclusive parameters.

```typescript
command.parametersExclusive('method', ($) =>
  $.parameter('create', z.string())
    .parameter('delete', z.string())
)
```

**Parameters:**
- `groupName` - Name for the exclusive parameter group
- `builder` - Function to build exclusive parameters

**Returns:** Command builder instance (chainable)

### .settings(config)

Configure global settings.

```typescript
command.settings({
  prompt: { enabled: true },
  parameters: {
    environment: {
      prefix: ['MY_APP_']
    }
  }
})
```

**Parameters:**
- `config` - Settings configuration object

**Returns:** Command builder instance (chainable)

### .parse(options?)

Parse command-line arguments and return validated results.

```typescript
const args = command.parse()
const args = command.parse({ line: ['--name', 'John'] })
```

**Parameters:**
- `options.line` - (Optional) Custom arguments array to parse

**Returns:** Parsed and validated arguments

## Type Inference

The Command builder provides full TypeScript type inference:

```typescript
const args = Command.create()
  .use(Zod)
  .parameter('name', z.string())
  .parameter('age', z.number().optional())
  .parse()

// TypeScript knows:
args.name  // type: string
args.age   // type: number | undefined
```

## Next Steps

- [Parameter API](/api/parameter) - Parameter configuration details
- [Settings API](/api/settings) - Settings reference
