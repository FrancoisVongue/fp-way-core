import { Curry } from "../core";

export namespace str {
    // transformation
    export const ToUpperCase = (s: string) => s.toUpperCase();
    export const ToLowerCase = (s: string) => s.toLowerCase();
    export const Capitalize = (s: string) => s.length > 0
        ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
        : s;
    export const Replace = Curry((
        search: string | RegExp,
        replacement: string,
        s: string
    ) => s.replace(search, replacement));
    export const PadLeft = Curry((length: number, pad: string, s: string) => s.padStart(length, pad));
    export const PadRight = Curry((length: number, pad: string, s: string) => s.padEnd(length, pad));
    export const JoinBy = Curry((sep: string, arr: string[]) => arr.join(sep));
    export const Trim = (s: string) => s.trim();
    export const TrimLeft = (s: string) => s.trimStart();
    export const TrimRight = (s: string) => s.trimEnd();
    export const PrefixWith = Curry((pref: string, s2: string) => pref + s2);
    export const SuffixWith = Curry((suff: string, s2: string) => s2 + suff);

    // validate
    export const Matches = Curry((regex: RegExp, str: string): boolean => regex.test(str));
    export const IsOfLength = Curry((l: number, s: string) => s.length === l);
    export const StartsWith = Curry((start: string, s: string) => s.startsWith(start));
    export const EndsWith = Curry((end: string, s: string) => s.endsWith(end));
    export const Includes = Curry((search: string, s: string) => s.includes(search));
    export const IsEmpty = (s: string) => s.length === 0;

    // extract
    export const CharAt = Curry((n: number, s: string) => s.charAt(n));
    export const CharCodeAt = Curry((n: number, s: string) => s.charCodeAt(n));
    export const Slice = Curry((start: number, end: number, s: string) =>
        s.slice(start, end));
    export const SplitBy = Curry((splitter: string | RegExp, s: string) =>
        s.split(splitter));
    export const Substring = Curry((start: number, end: number, s: string) => s.substring(start, end));
    export const OccurrencesOf = Curry((R: RegExp, str: string): string[] => {
        const regex = R.global ? R : new RegExp(R, 'g');
        const result = str.match(regex);
        return result
            ? Array.from(result)
            : [];
    });
}
