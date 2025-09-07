import { Curry, Is, IsEither } from "../core";

export namespace bool {
    export const IsBool = IsEither([Is(true), Is(false)]);

    export const And = Curry((a: boolean, b: boolean) => a && b);
    export const Or = Curry((a: boolean, b: boolean) => a || b);
    export const Not = Curry((a: boolean) => !a);
    export const Xor = Curry((a: boolean, b: boolean) => a !== b);
    export const Nand = Curry((a: boolean, b: boolean) => !(a && b));
    export const Nor = Curry((a: boolean, b: boolean) => !(a || b));
    export const Xnor = Curry((a: boolean, b: boolean) => a === b);
}