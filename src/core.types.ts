export type DataObject = Record<string, any>

export type DeepPartial<T> =
    T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T

export type DeepRequired<T> =
    T extends object
    ? { [P in keyof T]-?: DeepPartial<T[P]> }
    : T

export type Predicate = (...args: any[]) => boolean

export type Unary<T, R> = (a: T) => R;
export type Binary<T1, T2, R> = (a: T1, b: T2) => R;
export type Ternary<T1, T2, T3, R> = (a: T1, b: T2, c: T3) => R;
export type Quaternary<T1, T2, T3, T4, R> = (a: T1, b: T2, c: T3, d: T4) => R;
export type Quinary<T1, T2, T3, T4, T5, R> = (a: T1, b: T2, c: T3, d: T4, e: T5) => R;
export type Hexenary<T1, T2, T3, T4, T5, T6, R> = (a: T1, b: T2, c: T3, d: T4, e: T5, f: T6) => R;

export type UnaryPredicate<T> = Unary<T, boolean>;
export type BinaryPredicate<T1, T2> = Binary<T1, T2, boolean>;
export type TernaryPredicate<T, T2, T3> = Ternary<T, T2, T3, boolean>
export type QuaternaryPredicate<T1, T2, T3, T4> = Quaternary<T1, T2, T3, T4, boolean>
export type QuinaryPredicate<T1, T2, T3, T4, T5> = Quinary<T1, T2, T3, T4, T5, boolean>
export type HexenaryPredicate<T1, T2, T3, T4, T5, T6> = Hexenary<T1, T2, T3, T4, T5, T6, boolean>

export type TCurry = {
    <T1, R>(f: Unary<T1, R>): Curried1<T1, R>;
    <T1, T2, R>(f: Binary<T1, T2, R>): Curried2<T1, T2, R>;
    <T1, T2, T3, R>(f: Ternary<T1, T2, T3, R>): Curried3<T1, T2, T3, R>;
    <T1, T2, T3, T4, R>(f: Quaternary<T1, T2, T3, T4, R>): Curried4<T1, T2, T3, T4, R>;
};
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


export namespace FunctionTypes {
    export interface InCase {
        <T, R>(entries: [Unary<T, boolean>, Unary<T, R>][], v: T): R | void
        <T, R>(entries: [Unary<T, boolean>, Unary<T, R>][]): Unary<T, R | void>
    }
    export interface IndependentInCase {
        <T, R>(entries: [Unary<T, boolean>, Unary<T, R>][], v: T): R[]
        <T, R>(entries: [Unary<T, boolean>, Unary<T, R>][]): Unary<T, R[]>
    }
    export type Swap = {
        <T1, T2, R>(fn: Binary<T1, T2, R>): Binary<T2, T1, R>;
    };
}