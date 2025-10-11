# Migration from `@molt/command`

This package was previously published as `@molt/command`. To migrate:

1. Update your imports:
   ```typescript
   // Before
   import { Command } from '@molt/command'

   // After
   import { Command } from '@wollybeard/cli'
   ```

2. Update your package.json:
   ```json
   {
     "dependencies": {
       "@wollybeard/cli": "^0.9.0"
     }
   }
   ```

The API remains the same - only the package name has changed.
