# Zod Extension

The `Zod` extension lets you use Zod schemas wherever types are accepted.

::: warning Zod Version
This extension requires **Zod v4**. Zod v3 is not supported.
:::

To use this extension you must install `zod` into your project:

```bash
npm add zod
```

The supported Zod types and their mapping is as follows:

| Zod                                                                               | Oak Type                                     |
| --------------------------------------------------------------------------------- | -------------------------------------------- |
| [`boolean`](https://github.com/colinhacks/zod#booleans)                           | [`boolean`](/guides/parameter-types#boolean) |
| [`string`](https://github.com/colinhacks/zod#strings)                             | [`string`](/guides/parameter-types#string)   |
| [`number`](https://github.com/colinhacks/zod#numbers)                             | [`number`](/guides/parameter-types#number)   |
| [`enum`](https://github.com/colinhacks/zod#zod-enums)                             | [`enum`](/guides/parameter-types#enum)       |
| [`nativeEnum`](https://github.com/colinhacks/zod#native-enums)                    | [`enum`](/guides/parameter-types#enum)       |
| [`union`](https://github.com/colinhacks/zod#unions) (of any other Zod type above) | [`union`](/guides/parameter-types#union)     |

All validation methods are accepted (`.min(1)`, `.regex(/.../)`, `.cuid()`, ...).

The following modifiers are accepted:

```ts
.optional()
.default(...)
```

If both `optional` and `default` are used then `default` takes precedence.
The `describe` method is used for adding docs. It can show up in any part of the chain. All the following are fine:

```ts
z.string().describe('...').optional()
z.string().optional().describe('...')
z.string().min(1).describe('...').optional()
```
