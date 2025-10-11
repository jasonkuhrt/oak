# Parameter Types

This section covers the different kinds of built-in types and how they affect argument parsing.

## Boolean

- Flag does not accept any arguments.
- Environment variable accepts `"true"` or `"1"` for `true` and `"false"` or `"0"` for `false`.
- Negated form of parameters automatically accepted.

Examples:

```ts
const args = Command.create().parameter('f force forcefully', z.boolean())
  .parse()
// $ CLI_PARAM_NO_F='true' mybin
// $ CLI_PARAM_NO_FORCE='true' mybin
// $ CLI_PARAM_NO_FORCEFULLY='true' mybin
// $ CLI_PARAM_F='false' mybin
// $ CLI_PARAM_FORCE='false' mybin
// $ CLI_PARAM_FORCEFULLY='false' mybin
// $ mybin --no-f
// $ mybin --noF
// $ mybin --no-force
// $ mybin --noForce
// $ mybin --no-forcefully
// $ mybin --noForcefully
args.force === false
// $ CLI_PARAM_NO_F='false' mybin
// $ CLI_PARAM_NO_FORCE='false' mybin
// $ CLI_PARAM_NO_FORCEFULLY='false' mybin
// $ CLI_PARAM_F='true' mybin
// $ CLI_PARAM_FORCE='true' mybin
// $ CLI_PARAM_FORCEFULLY='true' mybin
// $ mybin -f
// $ mybin --force
// $ mybin --forcefully
args.force === true
```

## String

- Flag expects an argument.

### Transformations

- `trim`
- `toLowerCase`
- `toUpperCase`

### Validations

- `startsWith` - A prefix-string the value must be begin with.
- `endsWith` - A suffix-string the value must end with.
- `includes` - A sub-string the value must exactly contain.
- `regex` - An arbitrary Regular Expression that the value must conform to.
- `min` - The minimum allowed string length
- `max` - The maximum allowed string length
- `length` - An exact length the string must be
- `pattern` - Different well known patterns that the value must conform to.
  - `email` - An email
  - `ip` - An IP address. Can be configured:
    - Version 4
    - Version 6
    - Accept any version
  - `url` - A URL
  - `emoji` - An emoji
  - `ulid` - [A ULID](https://github.com/ulid/javascript)
  - `uuid` - A [UUID](https://www.ietf.org/rfc/rfc4122.txt)
  - `cuid` - A [CUID](https://github.com/paralleldrive/cuid)
  - `cuid2` - A [CUID v2](https://github.com/paralleldrive/cuid2)
  - `dateTime` - An ISO DateTime. Can be configured:
    - To forbid or accept an `offset`
    - To require a specific level of precision

## Number

- Flag expects an argument.
- Argument is cast via the `Number()` function.

### Validations

- `min` - The minimum allowed number.
- `max` - the maximum allowed number.
- `multipleOf` - The multiple that the given number must be of. For example `20, 15, 10,5` would all be allowed if `multipleOf` was `5` since all those numbers are divisible by `5`.
- `int`

## Enum

- Flag expects an argument.

## Union

- If no variant is a boolean then flag expects an argument.

- If one variant is a boolean then flag will interpret no argument as being an argument of the boolean variant. For example given this CLI:

  ```ts
  Command.create().parameter('xee', z.union([z.boolean(), z.number()]))
  ```

  A user could call your CLI in any of these ways:

  ```
  $ mybin --xee
  $ mybin --no-xee
  $ mybin --xee 1
  ```

- When a parameter is a union type, the variant that can first successfully parse the given value becomes the interpreted type for the given value. Variant parsers are tried in order of most specific to least, which is: `enum`, `number`, `boolean`, `string`. So for example if you had a union parameter like this:

  ```ts
  Command.create().parameter('xee', z.union([z.string(), z.number()]))
  ```

### Help Rendering

- By default help rendering will render something like so:

  ```ts
  Command.create().parameter(
    'xee',
    z.union([z.string(), z.number()]).description('Blah blah blah.'),
  )
  ```

  ```
  PARAMETERS

    Name    Type/Description                              Default

    xee     string | number                               REQUIRED
            Blah blah blah.
  ```

- When the parameters have descriptions then it will cause an expanded layout e.g.:

  ```ts
  Command.create().parameter(
    'xee',
    z
      .union([
        z.string().description('Blah blah blah string.'),
        z.number().description('Blah blah blah number.'),
      ])
      .description('Blah blah blah Overview'),
  )
  ```

  ```
  PARAMETERS

    Name    Type/Description                              Default

    xee     ┌─union                                       REQUIRED
            │ Blah blah blah overview.
            │
            ◒ string
            │ Blah blah blah string.
            │
            ◒ number
            │ Blah blah blah number.
            └─
  ```

- You can force expanded layout even when parameters do not have descriptions via the settings, e.g.:

  ```ts
  Command.create()
    .parameter('xee', z.union([z.string(), z.number()]))
    .parameter('foo', z.union([z.string(), z.number()]))
    .settings({
      helpRendering: {
        union: {
          mode: 'expandAlways',
        },
      },
    })
  ```

  ```
  PARAMETERS

    Name    Type/Description                              Default

    xee     ┌─union                                       REQUIRED
            ◒ string
            ◒ number
            └─

    foo     ┌─union                                       REQUIRED
            │ Blah blah blah string.
            ◒ string
            ◒ number
            └─
  ```
