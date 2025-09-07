import { IsOfType, Not, Swap } from "../core";
import { Predicate, Unary, Ternary } from "../core.types";

export namespace arr {
    // create
    export const OfValues = <T>(...v: T[]) => [...v];
    export const OfLength = (n: number): null[] => Array(n).fill(null);
    export const FromRange = (start: number, finish: number, step: number): number[] => {
        if (step <= 0) throw new Error("Step must be positive");
        if (start > finish) return [];
        const length = Math.floor((finish - start) / step) + 1;
        return arr.Map((_, i: number) => start + i * step, arr.OfLength(length));
    };

    // transform
    export const Select = <T1>(p: (value: T1, index: number, array: T1[]) => boolean, arr: T1[]): T1[] => arr.filter(p);

    export const Exclude = <T1>(p: (value: T1, index: number, array: T1[]) => boolean, arr: T1[]): T1[] => arr.filter(Not(p));
    export const Map = <T1, T2>(f: (value: T1, index: number, array: T1[]) => T2, arr: T1[]): T2[] => arr.map(f);
    export const Reduce = <T1, R>(reducer: (previousValue: R, currentValue: T1, currentIndex: number, array: T1[]) => R, base: R, arr: T1[]): R => arr.reduce(reducer, base);
    export const Distinct = <T>(arr: T[]): T[] => {
        const seen = new Set();
        return arr.filter(v => !seen.has(v) && (seen.add(v), true));
    };

    export const Reverse = <T>(arr: T[]): T[] => [...arr].reverse();

    // Fisher-Yates shuffle
    export const Shuffle = <T>(arr: T[]): T[] => {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };

    // Default SortBy (no comparator, type-specific behavior)
    export const SortBy = <T, K extends number | string>(
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
    };

    export const Find = <T>(p: Unary<T, boolean>, arr: T[]): T | undefined => arr.find(p);

    export const Tail = <T1>(arr: T1[]): T1[] => [...arr].slice(1);
    export const Nose = <T1>(arr: T1[]): T1[] => [...arr].slice(0, -1)
    export const Head = <T1>(arr: T1[]): T1 | undefined => [...arr].shift();
    export const Butt = <T1>(arr: T1[]): T1 | undefined => [...arr].pop();
    export const TakeNFirst = <T1>(n: number, arr: T1[]): T1[] => arr.slice(0, n);
    export const TakeNLast = <T1>(n: number, arr: T1[]): T1[] => arr.slice(-n);

    export const ConcatTo = <T1>(arr: T1[], arrOfValues: T1[]): T1[] => [...arr, ...arrOfValues];
    export const Append = <T1>(value: T1, arr: T1[]): T1[] => [...arr, value];
    export const Prepend = <T1>(value: T1, arr: T1[]): T1[] => [value, ...arr];

    export const Flatten = function Flatten<T1>(arr: any[]): T1[] {
        return arr.reduce((b, v) => (IsOfType("array", v)
            ? b.push(...Flatten(v))
            : b.push(v)
            , b), [])
    }

    export const Intersection = <T1>(arr1: T1[], arr2: T1[]): T1[] => {
        const [smallerArr, biggerArr] = arr1.length > arr2.length
            ? [arr2, arr1]
            : [arr1, arr2];

        const smallSet = new Set(smallerArr);
        return biggerArr.filter(smallSet.has.bind(smallSet));
    };
    export const Subtract = <T1>(arr1: T1[], arr2: T1[]): T1[] => {
        const set1 = new Set(arr1);
        return arr2.filter(v => !set1.has(v));
    };

    // Partition: Splits an array into two based on a predicate
    export const Partition = <T>(p: Predicate, arr: T[]): [T[], T[]] => [
        arr.filter(p),
        arr.filter(Not(p)),
    ];

    // Chunk: Splits an array into chunks of a specified size
    export const Chunk = <T>(size: number, arr: T[]): T[][] => {
        if (size <= 0) return [arr];
        const result: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };

    // GroupBy: Groups array elements by a key function
    export const GroupBy = <T>(fn: Unary<T, string>, arr: T[]): Record<string, T[]> =>
        arr.reduce((acc, v) => {
            const key = fn(v);
            acc[key] = acc[key] || [];
            acc[key].push(v);
            return acc;
        }, {} as Record<string, T[]>)
    ;
    // Zip: Combines two arrays into an array of pairs
    export const Zip = <T1, T2>(arr1: T1[], arr2: T2[]): [T1, T2][] => {
        const len = Math.min(arr1.length, arr2.length);
        return Array.from({ length: len }, (_, i) => [arr1[i], arr2[i]]);
    };

    // validate
    export const IsArray = <T>(arr: T[]): boolean => Array.isArray(arr);

    export const Every = <T1>(p: (value: T1, index: number, array: T1[]) => boolean, arr: T1[]): boolean => arr.every(p);
    export const Some = <T1>(p: (value: T1, index: number, array: T1[]) => boolean, arr: T1[]): boolean => arr.some(p);
    export const None = <T1>(p: (value: T1, index: number, array: T1[]) => boolean, arr: T1[]): boolean => !arr.some(p);

    export const ContainedIn = <T>(arr: T[], v: T): boolean => arr.includes(v);
    export const Contains = Swap(ContainedIn) as any;
    export const IsSupersetOf = <T>(sub: T[], sup: T[]): boolean => {
        const supSet = new Set(sup);
        return sub.every(subel => supSet.has(subel));
    };
    export const IsSubsetOf = (sup: any[], sub: any[]) => {
        const supSet = new Set(sup);
        return sub.every(subel => supSet.has(subel));
    };

    export const EqualsArray = (arr: any[], arrUnderTest: any[]): boolean => {
        if (arr.length !== arrUnderTest.length) {
            return false
        } else {
            const set = new Set(arr);
            return arrUnderTest.every(v => set.has(v));
        }
    };
    export const IsUnique = (arr: any[]) => {
        const arrSet = new Set(arr);
        return arrSet.size === arr.length;
    }
}
