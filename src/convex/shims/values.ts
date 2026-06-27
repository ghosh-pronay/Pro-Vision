/* eslint-disable @typescript-eslint/no-unused-vars */
type Validator<T> = { _type: T; kind: string };

function makeValidator<T>(kind: string): Validator<T> {
  return { _type: undefined as T, kind };
}

function object<T extends Record<string, Validator<unknown>>>(
  fields: T,
): Validator<{
  [K in keyof T]: T[K] extends Validator<infer V> ? V : never;
}> {
  return { _type: undefined as never, kind: "object" };
}

function array<T>(item: Validator<T>): Validator<T[]> {
  return { _type: undefined as unknown as T[], kind: "array" };
}

function union<T extends Validator<unknown>[]>(
  ...variants: T
): Validator<T[number] extends Validator<infer V> ? V : never> {
  return { _type: undefined as never, kind: "union" };
}

function literal<T extends string | number | boolean>(value: T): Validator<T> {
  return { _type: undefined as unknown as T, kind: "literal" };
}

export const v = {
  string: makeValidator<string>("string"),
  number: makeValidator<number>("number"),
  boolean: makeValidator<boolean>("boolean"),
  float64: makeValidator<number>("float64"),
  id: <T extends string = string>(table?: T) => makeValidator<string>("id"),
  optional: <T>(validator: Validator<T>) =>
    makeValidator<T | undefined>("optional"),
  nullable: <T>(validator: Validator<T>) => makeValidator<T | null>("nullable"),
  object,
  array,
  union,
  literal,
  any: makeValidator<unknown>("any"),
};
