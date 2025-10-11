# Parameter API

Parameters define the arguments your CLI accepts.

## Basic Parameter

```typescript
.parameter(name, schema)
```

**Parameters:**
- `name` - Parameter name (supports aliases)
- `schema` - Validation schema

**Example:**
```typescript
.parameter('name', z.string())
.parameter('age', z.number())
.parameter('v verbose', z.boolean())
```

## Parameter Configuration Object

For advanced configuration, use an object:

```typescript
.parameter(name, {
  type: schema,
  prompt: boolean | object,
  environment: boolean | object,
  default: any,
  description: string
})
```

### Configuration Options

#### type
The validation schema for the parameter.

```typescript
.parameter('email', {
  type: z.string().email()
})
```

#### prompt
Enable interactive prompts.

```typescript
.parameter('password', {
  type: z.string(),
  prompt: true
})

.parameter('token', {
  type: z.string(),
  prompt: {
    enabled: true,
    message: 'Enter your token:',
    type: 'password'
  }
})
```

#### environment
Configure environment variable support.

```typescript
.parameter('api-key', {
  type: z.string(),
  environment: true
})

.parameter('secret', {
  type: z.string(),
  environment: {
    enabled: true,
    prefix: ['MY_APP_']
  }
})
```

#### default
Provide a default value.

```typescript
.parameter('port', {
  type: z.number(),
  default: 3000
})
```

#### description
Help text for the parameter.

```typescript
.parameter('output', {
  type: z.string(),
  description: 'Output file path'
})
```

## Parameter Aliases

Define multiple names for a parameter:

```typescript
.parameter('v verbose', z.boolean())
.parameter('h help', z.boolean())
```

## Naming Conventions

Parameter names are automatically converted:

- CLI: `--some-param` or `--someParam`
- Code: `args.someParam` (always camelCase)
- Environment: `CLI_PARAMETER_SOME_PARAM`

## Exclusive Parameters

Create mutually exclusive parameters:

```typescript
.parametersExclusive('action', ($) =>
  $.parameter('create', z.string())
    .parameter('delete', z.string())
    .parameter('update', z.string())
)
```

Result type is a discriminated union:
```typescript
args.action // { _tag: 'create', value: string }
           // | { _tag: 'delete', value: string }
           // | { _tag: 'update', value: string }
```

## Next Steps

- [Command API](/api/command) - Command builder methods
- [Settings API](/api/settings) - Global configuration
