# Interactive Prompts Example

Demonstrates interactive prompts for missing parameters.

## Source Code

View the complete example: [`examples/prompt.ts`](https://github.com/jasonkuhrt/molt/blob/main/examples/prompt.ts)

## Features Demonstrated

- Interactive prompts
- Conditional prompting
- Prompt configuration
- Input validation during prompts

## Code Snippet

```typescript
import { Command } from '@wollybeard/cli'
import { Zod } from '@wollybeard/cli/extensions'
import { z } from 'zod/v4'

const args = Command.create()
  .use(Zod)
  .parameter('name', {
    type: z.string(),
    prompt: true
  })
  .parameter('email', {
    type: z.string().email(),
    prompt: true
  })
  .parameter('age', {
    type: z.number().min(18),
    prompt: {
      enabled: true,
      message: 'Enter your age (18+):'
    }
  })
  .parse()

console.log(`Name: ${args.name}`)
console.log(`Email: ${args.email}`)
console.log(`Age: ${args.age}`)
```

## Running the Example

### With CLI Arguments
```bash
tsx examples/prompt.ts --name John --email john@example.com --age 25
```

### With Prompts
```bash
$ tsx examples/prompt.ts

? name: John
? email: john@example.com
? Enter your age (18+): 25

Name: John
Email: john@example.com
Age: 25
```

### Validation During Prompts
```bash
$ tsx examples/prompt.ts

? name: John
? email: invalid-email
✗ Invalid email address
? email: john@example.com
? Enter your age (18+): 15
✗ Number must be greater than or equal to 18
? Enter your age (18+): 25

Name: John
Email: john@example.com
Age: 25
```

### Mixed CLI and Prompts
```bash
$ tsx examples/prompt.ts --name Alice

? email: alice@example.com
? Enter your age (18+): 30

Name: Alice
Email: alice@example.com
Age: 30
```

## Next Steps

- [Introduction](/examples/intro) - Basic usage
- [Kitchen Sink](/examples/kitchen-sink) - Advanced features
