export type DataObject = Record<string, any>

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export type Predicate = (...args: any[]) => boolean

export type Unary<T1, R> =
    (a: T1) => R
export type Binary<T1, T2, R> =
    (a: T1, b: T2) => R
export type Ternary<T1, T2, T3, R> =
    (a: T1, b: T2, c: T3) => R
export type Quaternary<T1, T2, T3, T4, R> =
    (a: T1, b: T2, c: T3, d: T4) => R

export type UnaryPredicate<T> = Unary<T, boolean>
export type BinaryPredicate<T, T2> = Binary<T, T2, boolean>
export type TernaryPredicate<T, T2, T3> = Ternary<T, T2, T3, boolean>
export type QuaternaryPredicate<T, T2, T3, T4> = Quaternary<T, T2, T3, T4, boolean>

export interface Curried1<T1, R> {
    (): Curried1<T1, R>;
    (t1: T1): R;
}
export interface Curried2<T1, T2, R> {
    (): Curried2<T1, T2, R>;
    (t1: T1): Curried1<T2, R>;
    (t1: T1, t2: T2): R;
}
export interface Curried3<T1, T2, T3, R> {
    (): Curried3<T1, T2, T3, R>;
    (t1: T1): Curried2<T2, T3, R>;
    (t1: T1, t2: T2): Curried1<T3, R>;
    (t1: T1, t2: T2, t3: T3): R;
}
export interface Curried4<T1, T2, T3, T4, R> {
    (): Curried4<T1, T2, T3, T4, R>;
    (t1: T1): Curried3<T2, T3, T4, R>;
    (t1: T1, t2: T2): Curried2<T3, T4, R>;
    (t1: T1, t2: T2, t3: T3): Curried1<T4, R>;
    (t1: T1, t2: T2, t3: T3, t4: T4): R;
}

export type TCurry = {
    <T1, R>(f: Unary<T1, R>): Curried1<T1, R>;
    <T1, T2, R>(f: Binary<T1, T2, R>): Curried2<T1, T2, R>;
    <T1, T2, T3, R>(f: Ternary<T1, T2, T3, R>): Curried3<T1, T2, T3, R>;
    <T1, T2, T3, T4, R>(f: Quaternary<T1, T2, T3, T4, R>): Curried4<T1, T2, T3, T4, R>;
}

export type JSTypesWithArrayAndNull =
    | "undefined"
    | "null"
    | "object"
    | "boolean"
    | "number"
    | "bigint"
    | "string"
    | "symbol"
    | "function"
    | "array"
