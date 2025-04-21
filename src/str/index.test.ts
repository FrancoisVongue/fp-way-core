import { IsOfType } from "../core";
import {str} from "./index";

describe('ToUpperCase', () => {
    it('should convert string to uppercase', () => {
        expect(str.ToUpperCase('hello')).toBe('HELLO');
        expect(str.ToUpperCase('Hello World')).toBe('HELLO WORLD');
        expect(str.ToUpperCase('')).toBe('');
    });
});

describe('ToLowerCase', () => {
    it('should convert string to lowercase', () => {
        expect(str.ToLowerCase('HELLO')).toBe('hello');
        expect(str.ToLowerCase('Hello World')).toBe('hello world');
        expect(str.ToLowerCase('')).toBe('');
    });
});

describe('Capitalize', () => {
    it('should capitalize the first letter and lowercase the rest', () => {
        expect(str.Capitalize('hello')).toBe('Hello');
        expect(str.Capitalize('HELLO')).toBe('Hello');
        expect(str.Capitalize('hello world')).toBe('Hello world');
        expect(str.Capitalize('')).toBe('');
    });
});

describe('Replace', () => {
    it('should replace occurrences of a string or regex', () => {
        const replaceA = str.Replace('a', 'b');
        expect(replaceA('banana')).toBe('bbnana');
        
        const replaceVowels = str.Replace(/[aeiou]/g, 'x');
        expect(replaceVowels('hello world')).toBe('hxllx wxrld');
    });
});

describe('PadLeft', () => {
    it('should pad the string from the left', () => {
        const padTo5 = str.PadLeft(5, '0');
        expect(padTo5('123')).toBe('00123');
        expect(padTo5('12345')).toBe('12345');
        expect(padTo5('123456')).toBe('123456');
    });
});

describe('PadRight', () => {
    it('should pad the string from the right', () => {
        const padTo5 = str.PadRight(5, '0');
        expect(padTo5('123')).toBe('12300');
        expect(padTo5('12345')).toBe('12345');
        expect(padTo5('123456')).toBe('123456');
    });
});

describe('JoinBy', () => {
    it('should join an array of strings with the specified separator', () => {
        const joinWithComma = str.JoinBy(',');
        expect(joinWithComma(['a', 'b', 'c'])).toBe('a,b,c');
        expect(joinWithComma([])).toBe('');
        
        const joinWithSpace = str.JoinBy(' ');
        expect(joinWithSpace(['hello', 'world'])).toBe('hello world');
    });
});

describe('Trim', () => {
    it('should remove whitespace from both ends of a string', () => {
        expect(str.Trim('  hello  ')).toBe('hello');
        expect(str.Trim('hello')).toBe('hello');
        expect(str.Trim('  ')).toBe('');
    });
});

describe('TrimLeft', () => {
    it('should remove whitespace from the beginning of a string', () => {
        expect(str.TrimLeft('  hello  ')).toBe('hello  ');
        expect(str.TrimLeft('hello')).toBe('hello');
        expect(str.TrimLeft('  ')).toBe('');
    });
});

describe('TrimRight', () => {
    it('should remove whitespace from the end of a string', () => {
        expect(str.TrimRight('  hello  ')).toBe('  hello');
        expect(str.TrimRight('hello')).toBe('hello');
        expect(str.TrimRight('  ')).toBe('');
    });
});

describe('PrefixWith', () => {
    it('should add a prefix to a string', () => {
        const addHello = str.PrefixWith('Hello ');
        expect(addHello('World')).toBe('Hello World');
        expect(addHello('')).toBe('Hello ');
        
        const hello = 'hello';
        const world = ' world';
        const prefixWithHello = str.PrefixWith(hello);
        const hw = prefixWithHello(world);
        
        expect(hw).toBe(hello + world);
    });
});

describe('SuffixWith', () => {
    it('should add a suffix to a string', () => {
        const addExclamation = str.SuffixWith('!');
        expect(addExclamation('Hello')).toBe('Hello!');
        expect(addExclamation('')).toBe('!');
    });
});

describe('Matches', () => {
    it('should check whether string matches regex', () => {
        const email = 'hello@mail.com';
        const notEmail = 'random string';
        const emailRegex = /.*@\w{1,6}\.\w{2,5}$/;
        const matchesEmail = str.Matches(emailRegex);
        
        const True = matchesEmail(email);
        const False = matchesEmail(notEmail);

        expect(True).toBe(true);
        expect(False).toBe(false);
    });
});

describe('IsOfLength', () => {
    it('should check if a string has the specified length', () => {
        const isLength5 = str.IsOfLength(5);
        expect(isLength5('hello')).toBe(true);
        expect(isLength5('hi')).toBe(false);
        expect(isLength5('')).toBe(false);
    });
});

describe('StartsWith', () => {
    it('should check if a string starts with the specified substring', () => {
        const startsWithHello = str.StartsWith('Hello');
        expect(startsWithHello('Hello World')).toBe(true);
        expect(startsWithHello('Hi World')).toBe(false);
    });
});

describe('EndsWith', () => {
    it('should check if a string ends with the specified substring', () => {
        const endsWithWorld = str.EndsWith('World');
        expect(endsWithWorld('Hello World')).toBe(true);
        expect(endsWithWorld('Hello There')).toBe(false);
    });
});

describe('Includes', () => {
    it('should check if a string includes the specified substring', () => {
        const includesLo = str.Includes('lo');
        expect(includesLo('Hello')).toBe(true);
        expect(includesLo('Hi')).toBe(false);
    });
});

describe('IsEmpty', () => {
    it('should check if a string is empty', () => {
        expect(str.IsEmpty('')).toBe(true);
        expect(str.IsEmpty('hello')).toBe(false);
        expect(str.IsEmpty(' ')).toBe(false);
    });
});

describe('CharAt', () => {
    it('should return the character at the specified index', () => {
        const charAtZero = str.CharAt(0);
        expect(charAtZero('hello')).toBe('h');
        expect(charAtZero('')).toBe('');
        
        const charAtTwo = str.CharAt(2);
        expect(charAtTwo('hello')).toBe('l');
    });
});

describe('CharCodeAt', () => {
    it('should return the character code at the specified index', () => {
        const codeAtZero = str.CharCodeAt(0);
        expect(codeAtZero('hello')).toBe(104); // ASCII code for 'h'
        
        const codeAtTwo = str.CharCodeAt(2);
        expect(codeAtTwo('hello')).toBe(108); // ASCII code for 'l'
    });
});

describe('Slice', () => {
    it('should extract a section of a string', () => {
        const sliceFrom1To3 = str.Slice(1, 3);
        expect(sliceFrom1To3('hello')).toBe('el');
        
        const sliceFrom2ToEnd = str.Slice(2, 100);
        expect(sliceFrom2ToEnd('hello')).toBe('llo');
    });
});

describe('SplitBy', () => {
    it('should split a string by the specified separator', () => {
        const splitBySpace = str.SplitBy(' ');
        expect(splitBySpace('hello world')).toEqual(['hello', 'world']);
        
        const splitByComma = str.SplitBy(',');
        expect(splitByComma('a,b,c')).toEqual(['a', 'b', 'c']);
    });
});

describe('Substring', () => {
    it('should return the part of the string between the start and end indexes', () => {
        const substringFrom1To3 = str.Substring(1, 3);
        expect(substringFrom1To3('hello')).toBe('el');
        
        const substringFrom2To5 = str.Substring(2, 5);
        expect(substringFrom2To5('hello')).toBe('llo');
    });
});

describe('OccurrencesOf', () => {
    it('should return every occurrence of the pattern', () => {
        const threeMoo = `"Moooo". Who said that? It was a cow, they moo all the time. "Moooooo"`;
        const mooRegex = /[Mm]o+/;
        const Moos = str.OccurrencesOf(mooRegex, threeMoo);
        
        expect(Moos.length).toBe(3);
    });
    it('should return an empty array in case of no matches', () => {
        const text = `some words are loud`;
        const reg = /what?/;
        const occurences = str.OccurrencesOf(reg, text);
        
        const isArray = IsOfType("array", occurences);
        const isEmpty = occurences?.length === 0;
        
        expect(isArray).toBe(true);
        expect(isEmpty).toBe(true);
    });
});
