# Extensions

Extensions allow you to integrate custom schema validation libraries with @wollybeard/cli.

## Using Extensions

Extensions are added with `.use()`:

```typescript
import { Command } from '@wollybeard/cli'
import { Zod } from '@wollybeard/cli/extensions'

const args = Command.create()
  .use(Zod)  // Enable Zod schemas
  .parameter('name', z.string())
  .parse()
```

## Built-in Extensions

### Zod Extension

The Zod extension provides seamless Zod integration:

```typescript
import { Zod } from '@wollybeard/cli/extensions'
import { z } from 'zod/v4'

Command.create()
  .use(Zod)
  .parameter('email', z.string().email())
  .parse()
```

## Creating Custom Extensions

Extensions implement the Standard Schema specification:

```typescript
import type { Extension } from '@wollybeard/cli'
import type { StandardSchemaV1 } from '@standard-schema/spec'

interface MySchema extends StandardSchemaV1 {
  // Your schema type
}

const MyExtension: Extension<MySchema> = {
  name: 'MyExtension',

  // Check if value is this schema type
  is: (value: unknown): value is MySchema => {
    return /* implementation */
  },

  // Validate value against schema
  validate: async (schema: MySchema, value: unknown) => {
    // Return validation result
  },

  // Get schema metadata
  getMetadata: (schema: MySchema) => {
    return {
      type: 'string', // or 'number', 'boolean', etc.
      optional: false,
      default: undefined
    }
  }
}
```

### Using Your Extension

```typescript
const args = Command.create()
  .use(MyExtension)
  .parameter('value', mySchema)
  .parse()
```

## Extension Capabilities

Extensions can provide:

- **Type Inference**: Full TypeScript type inference from schemas
- **Runtime Validation**: Validate parameter values
- **Error Messages**: Custom validation error formatting
- **Metadata**: Schema information for help generation

## Standard Schema

@wollybeard/cli supports the [Standard Schema](https://github.com/standard-schema/standard-schema) specification, enabling compatibility with:

- Zod
- Yup
- Joi
- ArkType
- Valibot
- And more...

## Example: Yup Extension

```typescript
import * as yup from 'yup'
import type { Extension } from '@wollybeard/cli'

const YupExtension: Extension<yup.AnySchema> = {
  name: 'Yup',

  is: (value): value is yup.AnySchema => {
    return value && typeof value.validate === 'function'
  },

  validate: async (schema, value) => {
    try {
      const result = await schema.validate(value)
      return { issues: undefined, value: result }
    } catch (error) {
      return {
        issues: [{
          message: error.message,
          path: error.path ? [error.path] : []
        }]
      }
    }
  },

  getMetadata: (schema) => ({
    type: schema.type,
    optional: !schema.spec.presence === 'required',
    default: schema.spec.default
  })
}
```

## Next Steps

- [Schemas](/guide/schemas) - Schema validation
- [API Reference](/api/) - Complete API documentation
