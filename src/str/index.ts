import {Curry} from "../core";

export namespace str {
    export const ToUpperCase = (s: string) => s.toUpperCase();
    export const ToLowerCase = (s: string) => s.toLowerCase();
    export const Trim = (s: string) => s.trim();
    export const TrimLeft = (s: string) => s.trimLeft();
    export const TrimRight = (s: string) => s.trimRight();
    export const CharAt = Curry((n: number, s: string) => s.charAt(n));
    export const CharCodeAt = Curry((n: number, s: string) => s.charCodeAt(n));
    export const Slice = Curry((start: number, end: number, s: string) =>
        s.slice(start, end));
    export const SplitBy = Curry((splitter: string | RegExp, s: string) =>
        s.split(splitter));
    export const ConcatWith = Curry((s1: string, s2: string) => s2 + s1);
    export const OccurrencesOf = Curry((R: RegExp, str: string): string[] => {
        const regex = R.global ? R : new RegExp(R, 'g');
        const result = str.match(regex);
        return result 
            ? Array.from(result) 
            : [];
    });

    // validate
    export const Matches = Curry((regex: RegExp, str: string): boolean => regex.test(str));
    export const IsOfLength = Curry((l: number, s: string) => s.length === l);
    export const StartsWith = Curry((start: string, s: string) => s.startsWith(start));
    export const EndsWith = Curry((end: string, s: string) => s.endsWith(end));
}
