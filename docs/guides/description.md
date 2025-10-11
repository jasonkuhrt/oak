# Description

You can give your command a description similar to how you can give each of your parameters a description.

```ts
const args = Command.create()
  .description(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
  )
  .parameter() /* ... */
```

Descriptions will show up in the auto generated help.
