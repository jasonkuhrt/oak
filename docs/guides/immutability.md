# Immutability

Oak is a fluent API which means methods return a central object of methods allowing you to chain methods one after another.

Each method in the chain returns a _new version_ of the chain. So for example let's say you had two scripts that had some overlapping requirements. You could factor those requirements out into a common base chain.

```ts twoslash
// @filename: helpers.ts
import { Command } from '@wollybeard/oak'
import { Zod } from '@wollybeard/oak/extensions'
import { z } from 'zod'

export const command = Command.create()
  .use(Zod)
  .parameter('woof', z.enum(['soft', 'loud', 'deafening']))

// @filename: foo.ts
// ---cut---
import { z } from 'zod'
import { command } from './helpers'

const args = command.parameter('bravo', z.boolean()).parse()
//    ^?
```

```ts twoslash
// @filename: helpers.ts
import { Command } from '@wollybeard/oak'
import { Zod } from '@wollybeard/oak/extensions'
import { z } from 'zod'

export const command = Command.create()
  .use(Zod)
  .parameter('woof', z.enum(['soft', 'loud', 'deafening']))

// @filename: bar.ts
// ---cut---
import { z } from 'zod'
import { command } from './helpers'

const args = command.parameter('charlie', z.number()).parse()
//    ^?
```
