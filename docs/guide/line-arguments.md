# Line Arguments

This section is about users passing arguments via the command line (as opposed to [the environment](/guide/environment-arguments)), also known as "flags", to the parameters you've defined for your CLI.

## Parameter Argument Separator

Arguments can be separated from parameters using the following characters:

- whitespace
- equals sign

Examples:

```
$ mybin --foo=moo
$ mybin --foo= moo
$ mybin --foo = moo
$ mybin --foo moo
```

Note that when `=` is attached to the value side then it is considered part of the value:

```
$ mybin --foo =moo
```

## Stacked Short Flags

Boolean short flags can be stacked. Imagine you have defined three parameters `a`, `b`, `c`. They could be passed like so:

```
$ mybin -abc
```

The last short flag does not have to be boolean flag. For example if there were a `d` parameter taking a string, this could work:

```
$ mybin -abcd foobar
```

## Case

You can write flags in kebab or camel case:

```
$ mybin --foo-bar moo
$ mybin --fooBar moo
```
