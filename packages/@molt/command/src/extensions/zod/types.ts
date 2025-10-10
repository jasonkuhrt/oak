import type { z } from 'zod/v4'

export type ZodType = SomeBasicType | SomeUnionType

// Simplified type definitions for Zod v4 compatibility
// Using any for complex Zod internals to avoid type system issues
type ZodEnumBase = z.ZodEnum<any>

type ZodNativeEnumBase = z.ZodType // ZodNativeEnum type is not exported in Zod v4

type SomeBasicType =
  | SomeBasicTypeScalar
  | z.ZodOptional<SomeBasicTypeScalar>
  | z.ZodDefault<SomeBasicTypeScalar>

type SomeUnionType = SomeUnionTypeScalar | z.ZodOptional<any> | z.ZodDefault<any>

type SomeUnionTypeScalar = z.ZodUnion<[SomeBasicTypeScalar, SomeBasicTypeScalar, ...SomeBasicTypeScalar[]]>

type SomeBasicTypeScalar =
  | z.ZodString
  | ZodEnumBase
  | ZodNativeEnumBase
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodLiteral<number>
  | z.ZodLiteral<string>
  | z.ZodLiteral<boolean>
