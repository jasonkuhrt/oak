# Type Safety

In mutually exclusive parameters, `args` will end up with a property whose type is a discriminated union based on the parameter names.

For example:

```ts
const args = Command.create()
  .parametersExclusive(
    `method`,
    (_) =>
      _.parameter(`v version`, z.string().regex(semverRegex()))
        .parameter(`b bump`, z.enum([`major`, `minor`, `patch`])),
  )
```

The `args.method` property will have the type:

```ts
type Method =
  | { _tag: 'version'; value: string }
  | { _tag: 'bump'; value: 'major' | 'minor' | 'patch' }
```

You automatically get a proper TypeScript-ready discriminant property based on the canonical names of your parameters. This helps you to write type-safe code. Also, it pairs well with [Alge 🌱](https://github.com/jasonkuhrt/alge) :). In the following example `Semver.inc` expects a strongly typed semver bump level of `'major'|'minor'|'patch'`:

```ts
const newVersion = Alge.match(args.method)
  .bump(({ value }) => Semver.inc(pkg.version, value))
  .version(({ value }) => value)
  .done()
```
