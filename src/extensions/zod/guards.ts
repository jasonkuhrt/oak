import type { z } from 'zod/v4'

// Type guards for Zod v4 schemas
// Zod v4 uses _def.type instead of _def.typeName

export const isUnion = (type: z.ZodType): boolean => {
  return (type as any)._def?.type === `union`
}

export const isLiteral = (type: z.ZodType): boolean => {
  return (type as any)._def?.type === `literal`
}

export const isString = (type: z.ZodType): type is z.ZodString => {
  return (type as any)._def?.type === `string`
}

export const isBoolean = (type: z.ZodType): type is z.ZodBoolean => {
  return (type as any)._def?.type === `boolean`
}

export const isNumber = (type: z.ZodType): type is z.ZodNumber => {
  return (type as any)._def?.type === `number`
}

export const isNativeEnum = (type: z.ZodType): boolean => {
  return (type as any)._def?.type === `nativeEnum`
}

export const isEnum = (type: z.ZodType): boolean => {
  return (type as any)._def?.type === `enum`
}

export const isOptional = (type: z.ZodType): boolean => {
  return (type as any)._def?.type === `optional`
}

export const isDefault = (type: z.ZodType): boolean => {
  return (type as any)._def?.type === `default`
}

export const isOptionalOrDefault = (type: z.ZodType): boolean => {
  return isOptional(type) || isDefault(type)
}
