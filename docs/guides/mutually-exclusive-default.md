# Default

By default, input for a group of mutually exclusive parameters is required. You can mark the group as being optional for users via a default so that internally there is always a value:

```ts
const args = Command.create()
  .parametersExclusive(
    `method`,
    (_) =>
      _.parameter(`v version`, z.string().regex(semverRegex()))
        .parameter(`b bump`, z.enum([`major`, `minor`, `patch`]))
        .optional()
        .default('bump', 'patch'),
  )
```

With a default, users don't have to provide input, but your code always receives a value to work with.
