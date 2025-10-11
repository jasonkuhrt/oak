# Quick Start

```typescript
import { Command } from '@wollybeard/cli'
import { Zod } from '@wollybeard/cli/extensions'
import { z } from 'zod/v4'

const args = Command.create()
  .use(Zod)
  .parameter('name', z.string())
  .parameter('age', z.number().optional())
  .parse()

console.log(`Hello ${args.name}!`)
if (args.age) console.log(`You are ${args.age} years old.`)
```
