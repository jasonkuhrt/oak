# Recipes

## Use `dprint` Instead of Prettier

Prettier formatting does not work well with Prettier due to the how much Oak relies on chaining APIs (aka. fluent APIs) whilst Prettier formats them poorly. You can find more detail and examples of its problems [here](https://github.com/jasonkuhrt/oak/issues/257).

You can try https://dprint.dev instead which works well. All examples in this repo are formatted using it.

## Optional Argument With Default Behavior

Say you want this CLI design:

```
mybin             <-- Disable xee (default)
mybin --xee       <-- Enable xee, use default
mybin --xee x     <-- enable xee using x
mybin --xee y     <-- enable xee using y
mybin --xee z     <-- enable xee using z
```

You could achieve this with the following parameter definition:

```ts twoslash
import { Command } from '@wollybeard/oak'
import { Zod } from '@wollybeard/oak/extensions'
import { z } from 'zod'
// ---cut---
const args = Command.create()
  .use(Zod)
  .parameter(
    'xee',
    z.union([z.boolean(), z.enum(['x', 'y', 'z'])]).default(false),
  )
  .parse()

args.xee
//   ^?
```
