import { Curry, IsOfType } from "../core";

export namespace num {
    export const ParseInt = (s: string) => Number.parseInt(s, 10);
    export const ParseFloat = (s: string) => Number.parseFloat(s);

    // validate
    export const IsNum = IsOfType("number");
    export const IsQuotientOf = Curry((n1: number, n2: number) => n2 % n1 === 0)
    export const IsInt = (n: number) => Number.isInteger(n);
    export const IsNaN = (n: any) => Number.isNaN(n);

    export const Gt = Curry((n1: number, n2: number) => n2 > n1 );
    export const Gte = Curry((n1, n2) => n2 >= n1 );
    export const Lt = Curry((n1: number, n2: number) => n2 < n1 );
    export const Lte = Curry((n1: number, n2: number) => n2 <= n1 );
    export const IsPos = (n: number) => n > 0;
    export const IsNeg = (n: number) => n < 0;
    export const InRangeInc = Curry((min: number, max: number, v: number) => {
        return v <= max && v >= min;
    });
    export const InRangeEx = Curry((min: number, max: number, v: number) => {
        return v < max && v > min;
    });

    // transform
    export const Negate = (v: number) => -v;
    export const Inc = (v: number) => v + 1;
    export const Dec = (v: number) => v - 1;
    export const AtMost = Curry((max: number, n2: number) => n2 > max ? max : n2);
    export const AtLeast = Curry((min: number, n2: number) => n2 < min ? min : n2);
    export const Add = Curry((a: number, b: number) => a + b);
    export const Subtr = Curry((a: number, b: number) => b - a);
    export const Diff = Curry((a: number, b: number) => Math.abs(a - b));
    export const MulBy = Curry((a: number, b: number) => b * a);
    export const DivBy = Curry((a: number, b: number) => b / a);
    export const Mod = Curry((a: number, b: number) => b % a);
    export const ToExtent = Curry((extent: number, a: number) => a**extent);
    export const Floor = (n: number) => Math.floor(n);
    export const Ceil = (n: number) => Math.ceil(n);
    export const ToInt = (v: number) => Math.trunc(v);
    export const Abs = (n: number) => Math.abs(n);
}
