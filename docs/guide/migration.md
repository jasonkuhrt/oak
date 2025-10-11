# Migration from @molt/command

This guide helps you migrate from the deprecated `@molt/command` package to `@wollybeard/cli`.

## Overview

The package has been renamed from `@molt/command` to `@wollybeard/cli`. The API remains **100% compatible** - only the package name has changed.

::: warning
`@molt/command` is deprecated and will no longer receive updates. Please migrate to `@wollybeard/cli`.
:::

## Quick Migration

### 1. Update Package Dependencies

Update your `package.json`:

```json
{
  "dependencies": {
    // Remove
    // "@molt/command": "^0.9.0"

    // Add
    "@wollybeard/cli": "^0.9.0"
  }
}
```

### 2. Update Imports

Find and replace all imports in your codebase:

::: code-group

```typescript [Before]
import { Command } from '@molt/command'
import { Zod } from '@molt/command/extensions'
```

```typescript [After]
import { Command } from '@wollybeard/cli'
import { Zod } from '@wollybeard/cli/extensions'
```

:::

### 3. Reinstall Dependencies

::: code-group

```bash [pnpm]
pnpm install
```

```bash [npm]
npm install
```

```bash [yarn]
yarn install
```

:::

## Automated Migration

You can use a simple find-and-replace script to update all imports:

```bash
# macOS/Linux
find . -type f -name "*.ts" -o -name "*.tsx" | \
  xargs sed -i '' 's/@molt\/command/@wollybeard\/cli/g'

# Linux (GNU sed)
find . -type f -name "*.ts" -o -name "*.tsx" | \
  xargs sed -i 's/@molt\/command/@wollybeard\/cli/g'
```

Or use your editor's global find and replace:

1. Find: `@molt/command`
2. Replace with: `@wollybeard/cli`
3. Replace all

## What Changed?

### Package Name
- **Old**: `@molt/command`
- **New**: `@wollybeard/cli`

### Nothing Else!
- ✅ Same API
- ✅ Same types
- ✅ Same features
- ✅ Same exports
- ✅ Same behavior

## Verification

After migration, verify everything works:

```bash
# Type check
pnpm tsc --noEmit

# Run tests
pnpm test

# Build
pnpm build
```

## Why the Rename?

The package was renamed to:
- Consolidate under the `@wollybeard` scope with other related packages
- Provide a clearer package identity
- Enable better ecosystem integration

## Need Help?

If you encounter issues during migration:

1. Check the [GitHub Issues](https://github.com/jasonkuhrt/molt/issues)
2. Review the [API documentation](/api/)
3. Open a new issue if needed

## Deprecation Timeline

- **v0.9.0**: `@wollybeard/cli` released, `@molt/command` deprecated
- **Future**: `@molt/command` will continue to work but won't receive updates
- **Recommendation**: Migrate as soon as possible

::: tip
The migration should take less than 5 minutes for most projects!
:::
