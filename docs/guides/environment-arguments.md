# Environment Arguments

Parameter arguments can be passed by environment variables instead of flags.

Environment arguments have lower precedence than Flags, so if an argument is available from both places, the environment argument is ignored while the flag argument is used.

## Default Name Pattern

By default environment arguments can be set using one of the following naming conventions (note: Oak reads environment variables with _case-insensitivity_):

```
CLI_PARAMETER_{parameter_name}
CLI_PARAM_{parameter_name}
```

```ts
const args = Command.create().parameter('--path', z.string()).parse()
args.path === './a/b/c/' // $ CLI_PARAMETER_PATH='./a/b/c' mybin
```

## Toggling

You can toggle environment arguments on/off. It is on by default.

```ts
const command = Command.create().parameter('--path', z.string()).settings({
  environment: false,
})
// $ CLI_PARAMETER_PATH='./a/b/c' mybin
// Throws error because no argument given for "path"
command.parse()
```

You can also toggle with the environment variable `CLI_SETTINGS_READ_ARGUMENTS_FROM_ENVIRONMENT` (case insensitive):

```ts
const command = Command.create().parameter('--path', z.string())
// $ CLI_SETTINGS_READ_ARGUMENTS_FROM_ENVIRONMENT='false' CLI_PARAMETER_PATH='./a/b/c' mybin
// Throws error because no argument given for "path"
command.parse()
```

## Selective Toggling

You can toggle environment on for just one or some parameters.

```ts
const args = Command.create()
  .parameter('--foo', z.string())
  .parameter('--bar', z.string().default('not_from_env'))
  .settings({ environment: { foo: true } })
  .parse()

// $ CLI_PARAMETER_FOO='foo' CLI_PARAMETER_BAR='bar' mybin
args.foo === 'foo'
args.bar === 'not_from_env'
```

You can toggle environment on except for just one or some parameters.

```ts
const args = Command.create()
  .parameter('--foo', z.string().default('not_from_env'))
  .parameter('--bar', z.string().default('not_from_env'))
  .parameter('--qux', z.string().default('not_from_env'))
  .settings({ environment: { $default: true, bar: false } })
  .parse()

// $ CLI_PARAMETER_FOO='foo' CLI_PARAMETER_BAR='bar' CLI_PARAMETER_QUX='qux' mybin
args.foo === 'foo'
args.bar === 'not_from_env'
args.qux === 'qux'
```

## Custom Prefix

You can customize the environment variable name prefix:

```ts
const args = Command.create()
  .parameter('--path', z.string())
  //                                              o-- case insensitive
  .settings({ environment: { $default: { prefix: 'foo' } } })
  .parse()

args.path === './a/b/c/' // $ FOO_PATH='./a/b/c' mybin
```

You can pass a list of accepted prefixes instead of just one. Earlier ones take precedence over later ones:

```ts
const args = Command.create()
  .parameter('--path', z.string())
  //                                               o---------o--- case insensitive
  .settings({ environment: { $default: { prefix: ['foobar', 'foo'] } } })
  .parse()

args.path === './a/b/c/' // $ FOOBAR_PATH='./a/b/c' mybin
args.path === './a/b/c/' // $ FOO_PATH='./a/b/c' mybin
args.path === './a/b/c/' // $ FOO_PATH='./x/y/z' FOOBAR_PATH='./a/b/c' mybin
```

## Selective Custom Prefix

You can customize the environment variable name prefix for just one or some parameters.

```ts
const args = Command.create()
  .parameter('--foo', z.string().default('not_from_env'))
  .parameter('--bar', z.string().default('not_from_env'))
  .parameter('--qux', z.string().default('not_from_env'))
  .settings({ environment: { bar: { prefix: 'MOO' } } })
  .parse()

// $ CLI_PARAMETER_FOO='foo' MOO_BAR='bar' CLI_PARAMETER_QUX='qux' mybin
args.foo === 'foo'
args.bar === 'bar'
args.qux === 'qux'
```

You can customize the environment variable name prefix except for just one or some parameters.

```ts
const args = Command.create()
  .parameter('--foo', z.string().default('not_from_env'))
  .parameter('--bar', z.string().default('not_from_env'))
  .parameter('--qux', z.string().default('not_from_env'))
  .settings({
    environment: {
      $default: { enabled: true, prefix: 'MOO' },
      bar: { prefix: true },
    },
  })
  .parse()

// $ MOO_FOO='foo' CLI_PARAM_BAR='bar' MOO_QUX='qux' mybin
args.foo === 'foo'
args.bar === 'bar'
args.qux === 'qux'
```

## Prefix Disabling

You can remove the prefix altogether. Pretty and convenient, but be careful for unexpected use of variables in host environment that would affect your CLI execution!

```ts
const args = Command.create()
  .parameter('--path', z.string())
  .settings({ environment: { $default: { prefix: false } } })
  .parse()

args.path === './a/b/c/' // $ PATH='./a/b/c' mybin
```

## Selective Prefix Disabling

You can disable environment variable name prefixes for just one or some parameters.

```ts
const args = Command.create()
  .parameter('--foo', z.string().default('not_from_env'))
  .parameter('--bar', z.string().default('not_from_env'))
  .parameter('--qux', z.string().default('not_from_env'))
  .settings({ environment: { bar: { prefix: false } } })
  .parse()

// $ CLI_PARAMETER_FOO='foo' BAR='bar' CLI_PARAMETER_QUX='qux' mybin
args.foo === 'foo'
args.bar === 'bar'
args.qux === 'qux'
```

You can disable environment variable name prefixes except for just one or some parameters.

```ts
const args = Command.create()
  .parameter('--foo', z.string().default('not_from_env'))
  .parameter('--bar', z.string().default('not_from_env'))
  .parameter('--qux', z.string().default('not_from_env'))
  .settings({
    environment: {
      $default: { enabled: true, prefix: false },
      bar: { prefix: true },
    },
  })
  .parse()

// $ FOO='foo' CLI_PARAM_BAR='bar' QUX='qux' mybin
args.foo === 'foo'
args.bar === 'bar'
args.qux === 'qux'
```

## Case Insensitive

Environment variables are considered in a case insensitive way so all of these work:

```ts
const args = Command.create().parameter('--path', z.string()).parse()
// $ CLI_PARAM_PATH='./a/b/c' mybin
// $ cli_param_path='./a/b/c' mybin
// $ cLi_pAraM_paTh='./a/b/c' mybin
args.path === './a/b/c/'
```

## Validation

By default, when a prefix is defined, a typo will raise an error:

```ts
const command = Command.create().parameter('--path', z.string())

// $ CLI_PARAM_PAH='./a/b/c' mybin
// Throws error because there is no parameter named "pah" defined.
command.parse()
```

If you pass arguments for a parameter multiple times under different environment variable name aliases an error will be raised.

```ts
const command = Command.create().parameter('--path', z.string())

// $ CLI_PARAMETER_PAH='./1/2/3' CLI_PARAM_PAH='./a/b/c' mybin
// Throws error because user intent is ambiguous.
command.parse()
```
