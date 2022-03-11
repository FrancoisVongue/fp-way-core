import {arr} from "./index";
import {num} from "../num";
import {IsOfType, Not} from "../core";

describe('OfLength', function () {
    it('Should create an arr of length n', () => {
        const arrOfLength5 = arr.OfLength(5);

        expect(arrOfLength5.length).toBe(5)
    })
});
describe('FromRange', function () {
    it('Should create an arr from range of numeric values', () => {
        const arr4to6 = arr.FromRange(4, 6, 1)

        expect(arr.Butt(arr4to6)).toBe(6);
        expect(arr4to6.length).toBe(3);
    })
});
describe('Select', function () {
    it('Should select values from an arr by predicate', () => {
        const Even = num.IsQuotientOf(2);
        const arr4to16 = arr.FromRange(4, 16, 1);
        const arr4to16even = arr.Select(Even, arr4to16);

        const True = arr4to16even.every(Even);

        expect(True).toBe(true);
    })
});
describe('Flatten', function () {
    it('Should flatten an array of any depth', () => {
        const groupedArr = [
            [1, 2],
            [3, [4, 5]]
        ];
        const numArr = arr.Flatten(groupedArr)

        expect(numArr.every(IsOfType('number'))).toBe(true);
    })
});
describe('Subtract', function () {
    it('Should subtract one set from another', () => {
        const Even = num.IsQuotientOf(2);
        const Odd = Not(num.IsQuotientOf(2));

        const arr1to100 = arr.FromRange(1, 100, 1);
        const even = arr.Select(Even, arr1to100);
        const odd = arr.Subtract(even, arr1to100);

        expect(odd.every(Odd)).toBe(true);
        expect(odd.length).toBeGreaterThan(48);
        expect(odd.length).toBeLessThan(52);
    })
});
describe('IsSubsetOf', function () {
    it('Should check if arr is subset of another', () => {
        const Even = num.IsQuotientOf(2);
        const arr1to100 = arr.FromRange(1, 100, 1);
        const even = arr.Select(Even, arr1to100);

        const result = arr.IsSubsetOf(arr1to100, even)
        const falseResult = arr.IsSubsetOf(arr1to100, [...even, 101]) // 101 is not in range

        expect(result).toBe(true);
        expect(falseResult).toBe(false);
    })
});
describe('IsUnique', function () {
    it('Should check if arr is unique', () => {
        const uniqueArr = [1,2,3,4,5];
        const notUniqueArr = [1,2,3,4,5,1];

        const result = arr.IsUnique(uniqueArr);
        const falseRes = arr.IsUnique(notUniqueArr);

        expect(result).toBe(true);
        expect(falseRes).toBe(false);
    })
});
describe('Tail', () => {
    it('should take all elements of an array but the first one', () => {
        const result = arr.Tail([1,2,3]);
        expect(result).toEqual([2,3]);
    })
    it('should return an empty array in case of empty input', () => {
        const result = arr.Tail([]);
        expect(result).toEqual([]);
    })
});
describe('Nost', () => {
    it('should take all elements of an array but the last one', () => {
        const result = arr.Nose([1,2,3]);
        expect(result).toEqual([1, 2]);
    })
    it('should return an empty array in case of empty input', () => {
        const result = arr.Nose([]);
        expect(result).toEqual([]);
    })
});
describe('Head', () => {
    it('should take first element of an array without changing it', () => {
        const array = [1,2,3];
        const result = arr.Head(array);

        expect(result).toBe(1);
        expect(array).toEqual([1,2,3])
    })
    it('should return undefined in case of an empty array', () => {
        const array = [];
        const result = arr.Head(array);

        expect(result).toBeUndefined()
    })
});
describe('Butt', () => {
    it('should take last element of an array without changing it', () => {
        const array = [1,2,3];
        const result = arr.Butt(array);

        expect(result).toBe(3);
        expect(array).toEqual([1,2,3])
    })
    it('should return undefined in case of an empty array', () => {
        const array = [];
        const result = arr.Head(array);

        expect(result).toBeUndefined()
    })
});
describe('TakeNFirst', () => {
    it('should take first N elements of an array without changing it', () => {
        const array = [1,2,3];
        const result = arr.TakeNFirst(2, array);

        expect(result).toEqual([1,2]);
    })
    it('should return empty array in case of an empty array', () => {
        const array = [];
        const result = arr.TakeNFirst(3, array);

        expect(result).toEqual([]);
    })
});
describe('TakeNLast', () => {
    it('should take last N elements of an array without changing it', () => {
        const array = [1,2,3];
        const result = arr.TakeNLast(2, array);

        expect(result).toEqual([2, 3]);
    })
    it('should return empty array in case of an empty array', () => {
        const array = [];
        const result = arr.TakeNLast(3, array);

        expect(result).toEqual([]);
    })
});
describe('Intersection', () => {
    it('should return intersection of two arrays', () => {
        const array = [1,2,3];
        const array2 = [2,3,4,5]

        const result = arr.Intersection(array, array2);

        expect(result).toEqual([2, 3]);
    })
});
