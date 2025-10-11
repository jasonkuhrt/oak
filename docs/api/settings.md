# Settings API

Global settings configure behavior across all parameters.

## Usage

```typescript
.settings({
  prompt: { /* ... */ },
  parameters: { /* ... */ },
  onOutput: (output) => { /* ... */ }
})
```

## Settings Object

### prompt

Configure interactive prompts globally.

```typescript
.settings({
  prompt: {
    enabled: true,
    when: { result: 'accepted' }
  }
})
```

**Options:**
- `enabled` - Enable/disable prompts globally
- `when.result` - When to show prompts ('accepted' | 'rejected')

### parameters.environment

Configure environment variable support.

```typescript
.settings({
  parameters: {
    environment: {
      enabled: true,
      prefix: ['MY_APP_', 'APP_']
    }
  }
})
```

**Options:**
- `enabled` - Enable/disable environment variables
- `prefix` - Custom prefixes for environment variables

### onOutput

Custom output handler for errors and help.

```typescript
.settings({
  onOutput: (output) => {
    // Custom handling
    console.error(output)
    process.exit(1)
  }
})
```

## Examples

### Disable All Prompts

```typescript
.settings({
  prompt: { enabled: false }
})
```

### Custom Environment Prefixes

```typescript
.settings({
  parameters: {
    environment: {
      prefix: ['MYAPP_', 'APP_']
    }
  }
})
```

### Combined Configuration

```typescript
.settings({
  prompt: {
    enabled: true,
    when: { result: 'accepted' }
  },
  parameters: {
    environment: {
      enabled: true,
      prefix: ['MY_CLI_']
    }
  }
})
```

## Precedence

Settings can be overridden at the parameter level:

```typescript
.settings({
  prompt: { enabled: true }
})
.parameter('secret', {
  type: z.string(),
  prompt: false  // Override for this parameter
})
```

## Next Steps

- [Command API](/api/command) - Command builder
- [Parameter API](/api/parameter) - Parameter configuration
