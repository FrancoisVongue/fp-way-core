import { Curry, IsOfType, Not, Swap } from "../core";
import { Predicate, Unary } from "../core.types";
import { arrTypes } from "./index.types";

export namespace arr {
    // create
    export const OfValues = <T>(...v: T[]) => [...v];
    export const OfLength = (n: number): null[] => Array(n).fill(null);
    export const FromRange = Curry((start: number, finish: number, step: number): number[] => {
        if (step <= 0) throw new Error("Step must be positive");
        if (start > finish) return [];
        const length = Math.floor((finish - start) / step) + 1;
        return Map((_, i: number) => start + i * step, OfLength(length));
    });

    // transform
    export const Select: arrTypes.Select = Curry(
        (p: Predicate, arr: any[]) => arr.filter(p)
    );

    export const Exclude: arrTypes.Exclude = Curry((p: Predicate, arr: any[]) => arr.filter(Not(p)));
    export const Map: arrTypes.Map = Curry((f, arr) => arr.map(f));
    export const Reduce: arrTypes.Reduce = Curry((reducer, base, arr) => arr.reduce(reducer, base));
    export const Distinct = <T>(arr: T[]): T[] => {
        const seen = new Set();
        return arr.filter(v => !seen.has(v) && (seen.add(v), true));
    };

    export const Reverse = <T>(arr: T[]): T[] => [...arr].reverse();

    // Fisher-Yates shuffle
    export const Shuffle = Curry(<T>(arr: T[]): T[] => {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    });

    // Default SortBy (no comparator, type-specific behavior)
    export const SortBy: arrTypes.SortBy = Curry(<T, K extends number | string>(
        fn: Unary<T, K>,
        order: string,
        arr: T[]
    ): T[] => {
        const defaultComparator = (ka: K, kb: K): number => {
            if (typeof ka === "number" && typeof kb === "number") {
                return ka - kb; // Numeric ascending
            }
            if (typeof ka === "string" && typeof kb === "string") {
                return ka.localeCompare(kb); // Locale-aware string comparison
            }
            throw new Error("arr.SortBy: Inconsistent key types or unsupported type");
        };
        const compare = order === "asc"
            ? defaultComparator
            : Swap(defaultComparator);

        return [...arr].sort((a, b) => compare(fn(a), fn(b)));
    });

    export const Find = Curry(<T>(p: Unary<T, boolean>, arr: T[]): T | undefined => arr.find(p));

    export const Tail = <T1>(arr: T1[]): T1[] => [...arr].slice(1);
    export const Nose = <T1>(arr: T1[]): T1[] => [...arr].slice(0, -1)
    export const Head = <T1>(arr: T1[]): T1 | undefined => [...arr].shift();
    export const Butt = <T1>(arr: T1[]): T1 | undefined => [...arr].pop();
    export const TakeNFirst: arrTypes.TakeNFirst = Curry((n, arr) => arr.slice(0, n));
    export const TakeNLast: arrTypes.TakeNLast = Curry((n, arr) => arr.slice(-n));

    export const ConcatTo: arrTypes.ConcatTo = Curry((arr, arrOfValues) => [...arr, ...arrOfValues]);
    export const Append: arrTypes.Append = Curry((value: any, arr: any[]) => [...arr, value]);
    export const Prepend: arrTypes.Prepend = Curry((value: any, arr: any[]) => [value, ...arr]);

    export const Flatten = function Flatten<T1>(arr: any[]): T1[] {
        return arr.reduce((b, v) => (IsOfType("array", v)
            ? b.push(...Flatten(v))
            : b.push(v)
            , b), [])
    }

    export const Intersection: arrTypes.Intersection = Curry((arr1: any[], arr2: any[]) => {
        const [smallerArr, biggerArr] = arr1.length > arr2.length
            ? [arr2, arr1]
            : [arr1, arr2];

        const smallSet = new Set(smallerArr);
        return biggerArr.filter(v => smallSet.has(v));
    })
    export const Subtract: arrTypes.Subtract = Curry((deduction, source) => {
        const dedSet = new Set(deduction);
        return source.filter(v => !dedSet.has(v));
    })

    // Partition: Splits an array into two based on a predicate
    export const Partition: arrTypes.Partition = Curry(<T>(p: Predicate, arr: T[]): [T[], T[]] => [
        arr.filter(p),
        arr.filter(Not(p)),
    ]);

    // Chunk: Splits an array into chunks of a specified size
    export const Chunk: arrTypes.Chunk = Curry(<T>(size: number, arr: T[]): T[][] => {
        if (size <= 0) return [arr];
        const result: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    });

    // GroupBy: Groups array elements by a key function
    export const GroupBy: arrTypes.GroupBy = Curry(<T>(fn: Unary<T, string>, arr: T[]): Record<string, T[]> =>
        arr.reduce((acc, v) => {
            const key = fn(v);
            acc[key] = acc[key] || [];
            acc[key].push(v);
            return acc;
        }, {} as Record<string, T[]>)
    );
    // Zip: Combines two arrays into an array of pairs
    export const Zip: arrTypes.Zip = Curry(<T1, T2>(arr1: T1[], arr2: T2[]): [T1, T2][] => {
        const len = Math.min(arr1.length, arr2.length);
        return Array.from({ length: len }, (_, i) => [arr1[i], arr2[i]]);
    });

    // validate
    export const IsArray = arr => Array.isArray(arr);

    export const Every: arrTypes.Every = Curry((p: Predicate, arr: any[]): boolean => arr.every(p));
    export const Some: arrTypes.Some = Curry((p: Predicate, arr: any[]): boolean => arr.some(p));
    export const None: arrTypes.None = Curry((p: Predicate, arr: any[]): boolean => !arr.some(p));

    export const ContainedIn: arrTypes.ContainedIn = Curry((arr: any[], v) => arr.includes(v))
    export const Contains: arrTypes.Contains = Swap(ContainedIn) as any;
    export const IsSupersetOf: arrTypes.IsSupersetOf = Curry((sub: any[], sup: any[]) => {
        const supSet = new Set(sup);
        return sub.every(subel => supSet.has(subel));
    });
    export const IsSubsetOf: arrTypes.IsSubsetOf = Curry((sup: any[], sub: any[]) => {
        const supSet = new Set(sup);
        return sub.every(subel => supSet.has(subel));
    });

    export const EqualsArray: arrTypes.EqualsArray = Curry((arr: any[], arrUnderTest: any[]): boolean => {
        if (arr.length !== arrUnderTest.length) {
            return false
        } else {
            const set = new Set(arr);
            return arrUnderTest.every(v => set.has(v));
        }
    });
    export const IsUnique: arrTypes.IsUnique = (arr: any[]) => {
        const arrSet = new Set(arr);
        return arrSet.size === arr.length;
    }
}
