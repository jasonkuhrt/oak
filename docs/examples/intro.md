# Introduction Example

A simple CLI demonstrating the basic features of @wollybeard/cli.

## Source Code

View the complete example: [`examples/intro.ts`](https://github.com/jasonkuhrt/molt/blob/main/examples/intro.ts)

## Features Demonstrated

- Basic parameter definition
- Optional parameters
- Boolean flags
- Type inference

## Code

```typescript
import { Command } from '@wollybeard/cli'
import { Zod } from '@wollybeard/cli/extensions'
import { z } from 'zod/v4'

const args = Command.create()
  .use(Zod)
  .parameter('name', z.string())
  .parameter('age', z.number().optional())
  .parameter('v verbose', z.boolean().default(false))
  .parse()

if (args.verbose) {
  console.log('Running in verbose mode...')
}

console.log(`Hello ${args.name}!`)
if (args.age) {
  console.log(`You are ${args.age} years old.`)
}
```

## Running the Example

```bash
# Basic usage
tsx examples/intro.ts --name John

# With optional age
tsx examples/intro.ts --name Jane --age 30

# With verbose flag
tsx examples/intro.ts --name Bob --verbose

# Using short flag
tsx examples/intro.ts --name Alice -v

# Show help
tsx examples/intro.ts --help
```

## Output Examples

### Basic output
```bash
$ tsx examples/intro.ts --name John
Hello John!
```

### With age
```bash
$ tsx examples/intro.ts --name Jane --age 30
Hello Jane!
You are 30 years old.
```

### Verbose mode
```bash
$ tsx examples/intro.ts --name Bob -v
Running in verbose mode...
Hello Bob!
```

## Next Steps

- [Prompts Example](/examples/prompts) - Interactive prompts
- [Kitchen Sink](/examples/kitchen-sink) - All features
