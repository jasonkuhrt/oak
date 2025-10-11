# Settings

You can control certain settings about the command centrally using the `.settings` method. Sometimes the options here approximate the same options passable to parameter level settings, with the difference that configuration here affects all parameters at once. However, parameter level settings will always override command level ones.

Settings documentation is not co-located. Documentation for various features will mention when there are command level settings available.

```ts
Command.create().settings({...})
```
