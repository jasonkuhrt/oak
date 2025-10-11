# Interactive Prompts

@wollybeard/cli includes built-in support for interactive prompts when parameters are missing.

## Basic Prompts

Enable prompts for a parameter:

```typescript
const args = Command.create()
  .use(Zod)
  .parameter('name', {
    type: z.string(),
    prompt: true
  })
  .parse()
```

When `--name` is not provided, the user will be prompted:

```
? name: _
```

## Selective Prompting

Control when prompts appear:

```typescript
.parameter('name', {
  type: z.string(),
  prompt: {
    enabled: true,
    when: { result: 'accepted' }
  }
})
```

## Prompt Configuration

Customize prompt behavior:

```typescript
.parameter('password', {
  type: z.string(),
  prompt: {
    enabled: true,
    message: 'Enter your password:',
    type: 'password'  // Hide input
  }
})
```

## Global Settings

Configure prompts globally:

```typescript
const args = Command.create()
  .use(Zod)
  .parameter('name', z.string())
  .parameter('age', z.number())
  .settings({
    prompt: {
      enabled: true,
      when: { result: 'accepted' }
    }
  })
  .parse()
```

## Conditional Prompts

Prompt only for optional parameters:

```typescript
.parameter('email', {
  type: z.string().email().optional(),
  prompt: true
})

// Skips prompt if value provided via CLI or env var
```

## Validation During Prompts

Invalid input triggers re-prompting:

```typescript
.parameter('age', {
  type: z.number().min(18).max(100),
  prompt: true
})
```

```
? age: 15
✗ Invalid: Number must be at least 18
? age: _
```

## Disabling Prompts

Disable prompts for automated environments:

```typescript
.settings({
  prompt: {
    enabled: false
  }
})
```

Or via environment variable:
```bash
CLI_PROMPT_ENABLED=false tsx cli.ts
```

## Next Steps

- [Environment Variables](/guide/environment) - Pass values via environment
- [Schemas](/guide/schemas) - Advanced validation patterns
