import {DeepRequired} from "../core.types";

export type PathTree<T> = {
    [P in keyof T]-?: T[P] extends object
        ? [P] | [P, ...Path<T[P]>]
        : [P];
};
export type Path<T> = PathTree<T>[keyof PathTree<T>];

export type OptionalPathTree<T> = {
    [P in keyof T]-?: T[P] extends object
        ? [P] | [P, ...OptionalPath<DeepRequired<T>[P]>]
        : [P];
};
export type OptionalPath<T> = OptionalPathTree<DeepRequired<T>>[keyof OptionalPathTree<DeepRequired<T>>]

export type Focus<T, P> =
    P extends [infer K1]
        ? K1 extends keyof T
            ? T[K1] | undefined
            : never
        : P extends [infer K1, ...infer K2]
            ? K1 extends keyof T
                ? Required<T>[K1] extends object
                    ? Focus<DeepRequired<T>[K1], K2>
                    : unknown
                : never
            : never