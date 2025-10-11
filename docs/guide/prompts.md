# Parameter Prompts

You can make Oak interactively _prompt_ users for arguments. This enables richer experiences for your users, like:

- Graceful recovery from invalid up front arguments.
- Guided argument passing meaning no need to know ahead of time the required parameters, just follow the prompts.

Example:

```
$ mybin --filePath ./a/b/c.yaml

1/1  to
     ❯ jsonn
     Invalid value: Value is not a member of the enum.
     ❯ json
```

## Overview

- By default, disabled.
- Can be configured at parameter level _or_ command level. Parameter level overrides command level.
- Only _basic_ parameters support prompting (so e.g. not [mutually exclusive parameters](/guide/mutually-exclusive-parameters)).
- Prompt interaction honours the parameter type. Here are some examples:

  - enumeration

    ```
    1/3  level
         ❯ high | medium | low
    ```

  - string

    ```
    1/9  name
         ❯
    ```

  - boolean

    ```
    2/3  verbose
         ❯ no | yes
    ```

  - enum

    ```
    5/5  level

        Different kinds of answers are accepted.
        Which kind do you want to give?

        ❯ string | number | enum

        ❯ low | medium | high
    ```

- Can be enabled _conditionally_ via _pattern matching_ on _events_.
  - Common patterns have been pre-defined and exported at `Command.eventPatterns` for you.
  - Custom patterns may be defined in a type-safe way.
- The order of prompts will match the order of your parameter definitions.
- When enabled, a default pattern is used when none explicitly set.
  - The default pattern may be changed.
- The default settings are:
  ```ts
  Command.create().settings({
    prompt: {
      enabled: false,
      when: Command.eventPatterns.rejectedMissingOrInvalid,
    },
  })
  ```
- When there is no `TTY` (`process.stdout.isTTY === false`) then prompts are always disabled.
- Arguments are validated just like they are when given "up front". However, when invalid, the user will be shown an error message and re-prompted, instead of the process exiting non-zero.
- Prompts are _asynchronously_ executed so you must `await` the return of `.parse()`.

## Conditional

You can enable parameter prompts conditionally by _pattern matching_ on their parse event emitted when Command runs. Every parameter whose parse event matches with your given pattern will subsequently be prompted for.

_All_ defined parameters emit parse events, irregardless if _arguments_ were given, or from where those arguments originated (line, environment). Therefore this gives you lots of flexibility about when to prompt your user for input. For example:

- When they miss a required parameter
- When their input does not pass validation
- When they an optional parameter is not given an argument up front
- ...

All you need to do is pass a _pattern_ to `prompt` either at the parameter level or the [command level settings](/guide/settings). There are three parse events you can match against:

- _Accepted_
  The parameter received an argument and it was successfully parsed.
- _Rejected_
  The parameter was not successfully parsed. This could be for various reasons such as a required parameter not receiving an argument or the given argument failing pass the parameter's validation rules.
- _Omitted_
  The parameter was not passed an argument by the user. Since this is not a _Rejected_ event it implies that the parameter was either optional, be that with or without a default.

Each event type share some core properties but also have their own unique fields. For example with `Accepted` you can match against what the value given was and with `Rejected` you can match against the specific error that occurred.

```ts
const args = await Command.create()
  .parameter(`filePath`, z.string())
  .parameter(`to`, {
    schema: z.enum([`json`, `yaml`, `toml`]),
    prompt: {
      result: 'rejected',
      error: 'ErrorMissingArgument',
    },
  })
  .parse()
```

The pattern matching library will be open-sourced and thoroughly documented in the future.

## Examples

### For the Default Event Pattern

Passing `true` will enable using the default event pattern.

```ts
const args = await Command.create()
  .parameter(`filePath`, z.string())
  .parameter(`to`, {
    schema: z.enum([`json`, `yaml`, `toml`]),
    prompt: true,
  })
  .parse()
```

### For Particular Event(s)

You can enable prompt when one of the built-in event patterns occur:

```ts
const args = await Command.create()
  .parameter(`filePath`, z.string())
  .parameter(`to`, {
    schema: z.enum([`json`, `yaml`, `toml`]),
    prompt: {
      when: Command.EventPatterns.rejectedMissingOrInvalid,
    },
  })
  .parse()
```

Or when one of multiple events occurs:

```ts
const args = await Command.create()
  .parameter(`filePath`, z.string())
  .parameter(`to`, {
    schema: z.enum([`json`, `yaml`, `toml`]),
    prompt: {
      when: [
        Command.EventPatterns.rejectedMissingOrInvalid,
        Command.EventPatterns.omittedWithoutDefault,
      ],
    },
  })
  .parse()
```

### For a Custom Event Pattern

You can enable prompt when your given _event pattern_ occurs.

```ts
const args = await Command.create()
  .parameter(`filePath`, z.string())
  .parameter(`to`, {
    schema: z.enum([`json`, `yaml`, `toml`]),
    prompt: {
      when: {
        rejected: {
          reason: 'missing',
        },
      },
    },
  })
  .parse()
```

### At Command Level

You can configure prompts for the entire instance in the settings. The configuration mirrors the parameter level. Parameter level overrides command level.

Enable explicitly with shorthand approach using a `boolean`:

```ts
const args = await Command.create()
  .parameter(`filePath`, z.string())
  .parameter(`to`, z.enum([`json`, `yaml`, `toml`]))
  .settings({ prompt: true })
  .parse()
```

Enable explicitly with longhand approach using the `enabled` nested property and include a condition.

Note that in the following `enabled` could be omitted because passing an object implies `enabled: true` by default.

```ts
const args = await Command.create()
  .parameter(`filePath`, z.string())
  .parameter(`to`, z.enum([`json`, `yaml`, `toml`]))
  .settings({
    prompt: {
      enabled: true,
      when: {
        rejected: {
          reason: 'missing',
        },
      },
    },
  })
  .parse()
```
