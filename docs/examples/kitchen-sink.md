# Kitchen Sink Example

Comprehensive example showcasing all features of @wollybeard/cli.

## Source Code

View the complete example: [`examples/kitchen-sink.ts`](https://github.com/jasonkuhrt/molt/blob/main/examples/kitchen-sink.ts)

## Features Demonstrated

- Multiple parameter types
- Optional and required parameters
- Default values
- Mutually exclusive parameters
- Environment variable support
- Interactive prompts
- Validation and error handling
- Aliases

## Key Code Sections

### Exclusive Parameters
```typescript
.parametersExclusive('action', ($) =>
  $.parameter('create', z.string())
    .parameter('delete', z.string())
    .parameter('update', z.string())
)
```

### Various Parameter Types
```typescript
.parameter('name', z.string())
.parameter('age', z.number().optional())
.parameter('email', z.string().email())
.parameter('v verbose', z.boolean().default(false))
.parameter('env', z.enum(['dev', 'prod', 'staging']))
```

### With Prompts and Validation
```typescript
.parameter('password', {
  type: z.string().min(8),
  prompt: {
    enabled: true,
    type: 'password',
    message: 'Enter password (min 8 chars):'
  }
})
```

## Running the Example

### Basic Usage
```bash
tsx examples/kitchen-sink.ts --create user --name John --email john@example.com --env dev
```

### With Verbose Flag
```bash
tsx examples/kitchen-sink.ts --create project --name MyProject -v --env prod
```

### Using Exclusive Parameters
```bash
# Create
tsx examples/kitchen-sink.ts --create "New Item"

# Delete (cannot use with create)
tsx examples/kitchen-sink.ts --delete "Old Item"

# Update (cannot use with create or delete)
tsx examples/kitchen-sink.ts --update "Existing Item"
```

### Environment Variables
```bash
CLI_PARAMETER_NAME="John" tsx examples/kitchen-sink.ts --create user --env dev
```

### Show Help
```bash
tsx examples/kitchen-sink.ts --help
```

## Example Output

```bash
$ tsx examples/kitchen-sink.ts --create project --name "My App" --email admin@app.com --env prod -v

Running in verbose mode...

Action: create
Target: project
Name: My App
Email: admin@app.com
Environment: prod
```

## Learn More

- [Parameters Guide](/guide/parameters) - Parameter configuration
- [Exclusive Parameters](/guide/exclusive-parameters) - Mutually exclusive parameters
- [Prompts Guide](/guide/prompts) - Interactive prompts
