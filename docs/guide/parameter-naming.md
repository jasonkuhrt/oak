# Parameter Naming

## Flag Syntax

You can define parameters using dash prefixes (flag syntax).

```ts twoslash
import { Command } from '@wollybeard/oak'
import { Zod } from '@wollybeard/oak/extensions'
import { z } from 'zod'
// ---cut---
const args = Command.create()
  .use(Zod)
  .parameter('--foo -f', z.string())
  .parameter('qux q', z.string())
  .parse()

args.foo
//   ^?
args.qux
//   ^?
```

## Short, Long, & Aliasing

You can give your parameters short and long names, as well as aliases.

```ts twoslash
import { Command } from '@wollybeard/oak'
import { Zod } from '@wollybeard/oak/extensions'
import { z } from 'zod'
// ---cut---
const args = Command.create()
  .use(Zod)
  .parameter('--foobar --foo -f ', z.string())
  .parameter('--bar -b -x', z.number())
  .parameter('-q --qux', z.boolean())
  .parameter('-m -n', z.boolean())
  .parse()

// $ mybin --foobar moo --bar 2 --qux -m
// $ mybin --foo    moo  -x   2 --qux -m
// $ mybin  -f      moo  -b   1  -q   -n
args.foobar
//   ^?
args.bar
//   ^?
args.qux
//   ^?
args.m
//   ^?
```

If you prefer you can use a dash-prefix free syntax:

```ts twoslash
import { Command } from '@wollybeard/oak'
import { Zod } from '@wollybeard/oak/extensions'
import { z } from 'zod'
// ---cut---
const args = Command.create()
  .use(Zod)
  .parameter('foobar foo f ', z.string())
  .parameter('bar b x', z.number())
  .parameter('q qux', z.boolean())
  .parameter('m n', z.boolean())
  .parse()
// ^?
```

## Kebab / Camel Case

You can use kebab or camel case.

```ts twoslash
import { Command } from '@wollybeard/oak'
import { Zod } from '@wollybeard/oak/extensions'
import { z } from 'zod'
// ---cut---
const args = Command.create()
  .use(Zod)
  .parameter('--foo-bar', z.string())
  .parameter('--quxLot', z.string())
  .parameter('foo-bar-2', z.string())
  .parameter('quxLot2', z.string())
  .parse()

// $ mybin --foo-bar moo --qux-lot zoo
// $ mybin --fooBar moo --quxLot zoo
args.fooBar
//   ^?
args.quxLot
//   ^?
```

## Duplicate Detection

Duplicate parameter names will be caught statically via TypeScript. The following shows examples of the many forms duplication can happen. Note how case and syntax are not contributing factors to uniqueness.

```ts twoslash
// @errors: 2345 2769
import { Command } from '@wollybeard/oak'
import { Zod } from '@wollybeard/oak/extensions'
import { z } from 'zod'
// ---cut---
const args = Command.create()
  .use(Zod)
  .parameter('f foo barBar', z.string())
  .parameter('bar-bar', z.string()) //  <-- TS error: already taken
  .parameter('f', z.string()) //        <-- TS error: already taken
  .parameter('--foo', z.string()) //    <-- TS error: already taken
  .parse()
```

## Reserved Names

Some names are reserved for use by default.

```ts twoslash
// @errors: 2345 2769
import { Command } from '@wollybeard/oak'
import { Zod } from '@wollybeard/oak/extensions'
import { z } from 'zod'
// ---cut---
const args = Command.create()
  .use(Zod)
  .parameter('help', z.string()) //     <-- TS error: reserved name
  .parameter('h', z.string()) //        <-- TS error: reserved name
  .parse()
```

## Internal Canonical Form

Internally, the canonical form of a parameter name is the representation that will be used whenever that name has to be referenced. Primarily this means the names you will find on the arguments returned from `.parse`.

The algorithm is:

1. The first long name, else first short
2. Stripped of flag syntax
3. Using camel case

The following shows an exaggerated example of how the many permutations normalize.

```ts twoslash
import { Command } from '@wollybeard/oak'
import { Zod } from '@wollybeard/oak/extensions'
import { z } from 'zod'
// ---cut---
const args = Command.create()
  .use(Zod)
  .parameter('--foo-foo f', z.string())
  .parameter('-q quxQux', z.string())
  .parameter('a b c --a-b-c', z.string())
  .parameter('x', z.string())
  .parameter('-z', z.string())
  .parse()

args.fooFoo
//   ^?
args.quxQux
//   ^?
args.aBC
//   ^?
args.x
//   ^?
args.z
//   ^?
```
