# molt

A set of packages related to building CLIs. Each package has its own docs.

| 📛 | Package                                                                  | Description                                                                | Use Case                                                                         | Alternatives                                                                                                       |
| -- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 🌲 | `molt`</br> [packages/molt](./packages/molt/)                            | Batteries included CLI framework. Builds on top of the `@molt/*` packages. | Building a CLI with multiple commands, sub-commands, etc.                        | [OClif](https://oclif.io) [Commander](https://github.com/tj/commander.js/) [Yargs](https://github.com/yargs/yargs) |
| 🌱 | `@molt/command`</br> [packages/@molt/command](./packages/@molt/command/) | Type-safe CLI command definition and execution.                            | Just want to setup a quick and dirty script, build a small one-command CLI, etc. | [Arg](https://github.com/vercel/arg)                                                                               |

> [!NOTE]
> `@molt/name` has been deprecated. For flag name parsing, use [`@wollybeard/kit`](https://github.com/jasonkuhrt/kit)'s FlagName instead.
