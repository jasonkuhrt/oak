# Exclusive Parameters

Mutually exclusive parameters allow you to define parameters where only one can be provided at a time.

## Basic Usage

Create exclusive parameters using `.parametersExclusive()`:

```typescript
const args = Command.create()
  .use(Zod)
  .parametersExclusive('method', ($) =>
    $.parameter('version', z.string())
      .parameter('bump', z.enum(['major', 'minor', 'patch']))
  )
  .parse()
```

Usage:
```bash
# Provide version
cli --version 1.2.3

# Or provide bump (but not both)
cli --bump major

# Error if both provided
cli --version 1.2.3 --bump major
# Error: Arguments given to multiple mutually exclusive parameters
```

## Return Type

The result is a discriminated union:

```typescript
const args = Command.create()
  .use(Zod)
  .parametersExclusive('method', ($) =>
    $.parameter('version', z.string())
      .parameter('bump', z.enum(['major', 'minor', 'patch']))
  )
  .parse()

// args.method has type:
// | { _tag: 'version'; value: string }
// | { _tag: 'bump'; value: 'major' | 'minor' | 'patch' }
// | undefined (if optional)
```

## Pattern Matching

Use pattern matching to handle each case:

```typescript
import { Alge } from 'alge'

const newVersion = Alge.match(args.method)
  .version((m) => m.value)
  .bump((m) => incrementVersion(currentVersion, m.value))
  .done()
```

## Required vs Optional

### Required (default)
```typescript
.parametersExclusive('method', ($) =>
  $.parameter('version', z.string())
    .parameter('bump', z.enum(['major', 'minor', 'patch']))
)

// One parameter MUST be provided
```

### Optional
```typescript
.parametersExclusive('method', ($) =>
  $.parameter('version', z.string())
    .parameter('bump', z.enum(['major', 'minor', 'patch']))
    .optional()
)

// Parameters are optional - none can be provided
```

## Multiple Exclusive Groups

You can have multiple exclusive parameter groups:

```typescript
const args = Command.create()
  .use(Zod)
  .parametersExclusive('method', ($) =>
    $.parameter('version', z.string())
      .parameter('bump', z.enum(['major', 'minor', 'patch']))
  )
  .parametersExclusive('target', ($) =>
    $.parameter('production', z.boolean())
      .parameter('staging', z.boolean())
  )
  .parse()
```

## Error Messages

Clear errors when exclusivity is violated:

```bash
cli --version 1.0.0 --bump major
```

```
Error: Arguments given to multiple mutually exclusive parameters: version, bump
```

```bash
cli # when required
```

```
Error: Missing argument for one of the following parameters: version, bump
```

## Next Steps

- [Parameters](/guide/parameters) - Regular parameters
- [API Reference](/api/parameter) - Complete API documentation
