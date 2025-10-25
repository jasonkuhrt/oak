import { Either } from 'effect'

export const BooleanLookup = {
  true: true,
  false: false,
} as const

export const environmentVariableBooleanLookup = {
  ...BooleanLookup,
  '1': true,
  '0': false,
} as const

export type Values<T> = T[keyof T]

export const getLowerCaseEnvironment = (): NodeJS.ProcessEnv => lowerCaseObjectKeys(process.env)

export const lowerCaseObjectKeys = (obj: object) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]))

export const parseEnvironmentVariableBoolean = (serializedValue: string): Either.Either<boolean, Error> => {
  // @ts-expect-error ignore
  const value = environmentVariableBooleanLookup[serializedValue]
  if (value === undefined) return Either.left(new Error(`Invalid boolean value: ${value}`))
  return Either.right(value)
}

export const parseEnvironmentVariableBooleanOrThrow = (value: string) => {
  const result = parseEnvironmentVariableBoolean(value)
  if (Either.isLeft(result)) {
    throw result.left
  }
  return result.right
}

export const invertTable = <T>(rows: T[][]): T[][] => {
  const columns: T[][] = []
  for (const row of rows) {
    let i = 0
    for (const col of row) {
      const column = columns[i] || []
      column.push(col)
      columns[i] = column
      i++
    }
  }
  return columns
}

export const entries = <O extends object>(
  obj: O,
): Exclude<{ [k in keyof O]: [k, O[k]] }[keyof O], undefined>[] => Object.entries(obj) as any

export const casesExhausted = (_: never): never => {
  throw new Error(`Cases exhausted: ${_}`)
}

export namespace HKT {
  /**
   * Model a Higher Kinded Type (HKT).
   */
  export interface Fn<Params = unknown, Return = unknown> {
    params: Params
    return: Return
  }

  /**
   * Apply a Higher Kinded Type (HKT).
   */
  export type Call<F extends Fn, P> = (F & { params: P })['return']

  export type ID<T> = IDFn<T>

  export interface IDFn<T> extends HKT.Fn<T> {
    return: this['params']
  }
}
