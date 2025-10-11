# Environment Variables

Parameters can be passed via environment variables in addition to command-line arguments.

## Automatic Environment Support

By default, all parameters support environment variables:

```typescript
const args = Command.create()
  .use(Zod)
  .parameter('api-key', z.string())
  .parse()
```

Usage:
```bash
# Via CLI
cli --api-key secret123

# Via environment variable
CLI_PARAMETER_API_KEY=secret123 cli

# Or shorter prefix
CLI_PARAM_API_KEY=secret123 cli
```

## Naming Convention

Environment variable names are automatically generated:

1. Convert parameter name to SNAKE_CASE
2. Add prefix `CLI_PARAMETER_` or `CLI_PARAM_`
3. Case insensitive

Examples:
- `name` → `CLI_PARAMETER_NAME`
- `api-key` → `CLI_PARAMETER_API_KEY`
- `someValue` → `CLI_PARAMETER_SOME_VALUE`

## Custom Prefixes

Configure custom environment prefixes:

```typescript
.settings({
  parameters: {
    environment: {
      prefix: ['MY_APP_', 'APP_']
    }
  }
})
```

Usage:
```bash
MY_APP_API_KEY=secret123 cli
APP_API_KEY=secret123 cli
```

## Selective Environment Support

Enable/disable for specific parameters:

```typescript
.parameter('api-key', {
  type: z.string(),
  environment: true  // Enabled
})

.parameter('debug', {
  type: z.boolean(),
  environment: false  // Disabled
})
```

## Global Configuration

Configure all parameters at once:

```typescript
.settings({
  parameters: {
    environment: {
      enabled: true,
      prefix: ['CLI_', 'APP_']
    }
  }
})
```

## Precedence

When multiple sources provide a value:

1. **CLI arguments** (highest priority)
2. **Environment variables**
3. **Default values** (lowest priority)

```bash
# CLI takes precedence over environment
CLI_PARAMETER_NAME=Alice cli --name Bob
# Result: name = "Bob"
```

## Disable Environment Support

Globally disable environment variables:

```typescript
.settings({
  parameters: {
    environment: {
      enabled: false
    }
  }
})
```

## Next Steps

- [Schemas](/guide/schemas) - Validation and type safety
- [Settings](/api/settings) - Complete settings reference
