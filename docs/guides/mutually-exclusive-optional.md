# Optional

By default, input for a group of mutually exclusive parameters is required. You can mark the group as being optional:

```ts
const args = Command.create()
  .parametersExclusive(
    `method`,
    (_) =>
      _.parameter(`v version`, z.string().regex(semverRegex()))
        .parameter(`b bump`, z.enum([`major`, `minor`, `patch`]))
        .optional(),
  )
```

When marked as optional, users are not required to provide any of the mutually exclusive parameters.
