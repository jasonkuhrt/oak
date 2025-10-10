import type { z } from 'zod'

// Type guards for Zod v4 schemas
// Zod v4 uses a different internal structure than v3

export const isUnion = (type: z.ZodType): boolean => {
  return (type as any)._def?.typeName === 'ZodUnion'
}

export const isLiteral = (type: z.ZodType): boolean => {
  return (type as any)._def?.typeName === 'ZodLiteral'
}

export const isString = (type: z.ZodType): type is z.ZodString => {
  return (type as any)._def?.typeName === 'ZodString'
}

export const isBoolean = (type: z.ZodType): type is z.ZodBoolean => {
  return (type as any)._def?.typeName === 'ZodBoolean'
}

export const isNumber = (type: z.ZodType): type is z.ZodNumber => {
  return (type as any)._def?.typeName === 'ZodNumber'
}

export const isNativeEnum = (type: z.ZodType): boolean => {
  return (type as any)._def?.typeName === 'ZodNativeEnum'
}

export const isEnum = (type: z.ZodType): boolean => {
  return (type as any)._def?.typeName === 'ZodEnum'
}

export const isOptional = (type: z.ZodType): boolean => {
  return (type as any)._def?.typeName === 'ZodOptional'
}

export const isDefault = (type: z.ZodType): boolean => {
  return (type as any)._def?.typeName === 'ZodDefault'
}

export const isOptionalOrDefault = (type: z.ZodType): boolean => {
  return isOptional(type) || isDefault(type)
}
