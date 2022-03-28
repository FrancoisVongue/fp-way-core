import {Curry, IsOfType, Not, Swap,} from "../core";
import {Curried2, Predicate, Ternary, Unary} from "../core.types";
import {num} from "../num";

export namespace arr {
    // create
    export const OfValues = <T>(...v: T[]) => [...v];
    export const OfLength = (n: number): null[] => Array(n).fill(null);
    export const FromRange = Curry((
        start: number,
        finish: number,
        step: number
    ): number[] => {
        if(start >= finish || step <= 0) {
            throw Error(`Invalid input to FromRange: start:${start} finish:${finish} step:${step}`)
        } if (!num.IsQuotientOf(1, step)) {
            throw Error(`Invalid input to FromRange: step must be integer`)
        }

        const result: number[] = []

        let current = start;
        while(current <= finish) {
            result.push(current)
            current += step;
        }

        if(result?.[result.length - 1] !== finish) {
            result.push(finish)
        }

        return result
    });

    // transform
    export const Select: {
        <T1>(
            p: Predicate,
            arr: T1[]
        ): T1[]
        <T1>(
            p: Predicate,
        ): Unary<T1[], T1[]>
    } = Curry((p: Predicate, arr: any[]) => arr.filter(p));
    export const Exclude: {
        <T1>(
            p: Predicate,
            arr: T1[]
        ): T1[]
        <T1>(
            p: Predicate,
        ): Unary<T1[], T1[]>
    } = Curry((p: Predicate, arr: any[]) => arr.filter(Not(p)));
    export const Map: {
        <T1, T2>(
            f: Unary<T1, T2>,
            arr: T1[]
        ): T2[]

        <T1, T2>(
            f: Unary<T1, T2>,
        ): Unary<T1[], T2[]>
    } = Curry((f, arr) => arr.map(f));
    export const Reduce: {
        <T1, R>(
            reducer: Ternary<R, T1, T1[], R>,
            base: R,
            arr: T1[]
        ): R
        <T1, R>(
            reducer: Ternary<R, T1, T1[], R>,
            base: R,
        ): Unary<T1[], R>
        <T1, R>(
            reducer: Ternary<R, T1, T1[], R>,
        ): Curried2<R, T1[], R>
    } = Curry((reducer, base, arr) => arr.reduce(reducer, base));


    export const Tail = <T1>(arr: T1[]): T1[] => [...arr].slice(1);
    export const Nose = <T1>(arr: T1[]): T1[] => [...arr].slice(0, -1)
    export const Head = <T1>(arr: T1[]): T1 | undefined => [...arr].shift();
    export const Butt = <T1>(arr: T1[]): T1 | undefined => [...arr].pop();
    export const TakeNFirst: {
        <T1>(
            n: number,
            arr: T1[]
        ): T1[]
        <T1>(
            arr: T1[]
        ): Unary<number, T1[]>
    } = Curry((n, arr) => arr.slice(0, n));
    export const TakeNLast: {
        <T1>(
            n: number,
            arr: T1[]
        ): T1[]
        <T1>(
            arr: T1[]
        ): Unary<number, T1[]>
    } = Curry((n, arr) => arr.slice(-n));

    export const ConcatTo: {
        <T1>(
            arr: T1[],
            arr2: T1[],
        ): T1[]
        <T1>(
            arr: T1[],
        ): Unary<T1[], T1[]>
    } = Curry((arr, arrOfValues) => [...arr, ...arrOfValues]);
    export const Append: {
        <T1>(
            v: T1,
            arr: T1[]
        ): T1[]

        <T1>(
            v: T1,
        ): Unary<T1[], T1[]>
    } = Curry((value: any, arr: any[]) => [...arr, value]);
    export const Prepend: {
        <T1>(
            v: T1,
            arr: T1[]
        ): T1[]

        <T1>(
            v: T1,
        ): Unary<T1[], T1[]>
    } = Curry((value: any, arr: any[]) => [value, ...arr]);

    export const Flatten = function Flatten<T1>(arr: any[]): T1[] {
        return arr.reduce((b, v) => (IsOfType("array", v)
                ? b.push(...Flatten(v))
                : b.push(v)
            , b), [])
    }

    export const Intersection: {
        <T1>(
            arr1: T1[],
            arr2: T1[],
        ): T1[]
        <T1>(
            arr1: T1[],
        ): Unary<T1[], T1[]>
    } = Curry((arr1: any[], arr2: any[]) => {
        const [smallerArr, biggerArr] = arr1.length > arr2.length
            ? [arr2, arr1]
            : [arr1, arr2];

        const smallSet = new Set(smallerArr);
        return biggerArr.filter(v => smallSet.has(v));
    })
    export const Subtract: {
        <T1>(
            arr1: T1[],
            arr2: T1[],
        ): T1[]
        <T1>(
            arr1: T1[],
        ): Unary<T1[], T1[]>
    } = Curry((deduction, source) => {
        const dedSet = new Set(deduction);
        return source.filter(v => !dedSet.has(v));
    })

    // validate
    export const IsArray = arr => Array.isArray(arr);

    export const Every: {
        <T1>(
            p: Unary<T1, boolean>,
            arr: T1[],
        ): boolean
        <T1>(
            p: Unary<T1, boolean>,
        ): Unary<T1[], boolean>
    } = Curry((p: Predicate, arr: any[]): boolean => arr.every(p));
    export const Some: {
        <T1>(
            p: Unary<T1, boolean>,
            arr: T1[],
        ): boolean
        <T1>(
            p: Unary<T1, boolean>,
        ): Unary<T1[], boolean>
    } =  Curry((p: Predicate, arr: any[]): boolean => arr.some(p));
    export const None: {
        <T1>(
            p: Unary<T1, boolean>,
            arr: T1[],
        ): boolean
        <T1>(
            p: Unary<T1, boolean>,
        ): Unary<T1[], boolean>
    } =  Curry((p: Predicate, arr: any[]): boolean => !arr.some(p));

    export const ContainedIn: {
        <T1>(
            arr: T1[],
            v: T1
        ): boolean
        <T1>(
            arr: T1[],
        ): Unary<T1, boolean>
    } = Curry((arr: any[], v) => arr.includes(v))
    export const Contains: {
        <T1>(
            v: T1,
            arr: T1[],
        ): boolean
        <T1>(
            v: T1,
        ): Unary<T1[], boolean>
    } = Swap(ContainedIn) as any;
    export const IsSupersetOf: {
        <T1>(
            sub: T1[],
            sup: T1[],
        ): boolean
        <T1>(
            sub: T1[],
        ): Unary<T1[], boolean>
    } = Curry((sub: any[], sup: any[]) => {
        const supSet = new Set(sup);
        return sub.every(subel => supSet.has(subel));
    });
    export const IsSubsetOf: {
        <T1>(
            sup: T1[],
            sub: T1[],
        ): boolean
        <T1>(
            sup: T1[],
        ): Unary<T1[], boolean>
    } = Curry((sup: any[], sub: any[]) => {
        const supSet = new Set(sup);
        return sub.every(subel => supSet.has(subel));
    });

    export const EqualsArray =  Curry((arr: any[], arrUnderTest: any[]): boolean => {
        if(arr.length !== arrUnderTest.length) {
            return false
        } else {
            const set = new Set(arr);
            return arrUnderTest.every(v => set.has(v));
        }
    });
    export const IsUnique = (arr: any[]) => {
        const arrSet = new Set(arr);
        return arrSet.size === arr.length;
    }
}
