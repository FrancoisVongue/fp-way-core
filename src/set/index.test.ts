import { set } from "./index";

describe('set', () => {
  describe('Creation functions', () => {
    it('OfValues should create a set from values', () => {
      const result = set.OfValues(1, 2, 3, 2, 1);
      expect(result.size).toBe(3);
      expect(set.Has(1, result)).toBe(true);
      expect(set.Has(2, result)).toBe(true);
      expect(set.Has(3, result)).toBe(true);
    });

    it('FromArray should create a set from an array', () => {
      const result = set.FromArray([1, 2, 3, 2, 1]);
      expect(result.size).toBe(3);
      expect(set.ToArray(result)).toEqual([1, 2, 3]);
    });

    it('ToArray should convert a set to an array', () => {
      const set1 = new Set([1, 2, 3]);
      const result = set.ToArray(set1);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('Basic operations', () => {
    it('Add should add a value to a set and return a new set', () => {
      const set1 = new Set([1, 2, 3]);
      const result = set.Add(4, set1);
      expect(set.Has(4, result)).toBe(true);
      expect(result.size).toBe(4);
      expect(set1.size).toBe(3); // Original unchanged
    });

    it('Delete should remove a value from a set and return a new set', () => {
      const set1 = new Set([1, 2, 3, 4]);
      const result = set.Delete(2, set1);
      expect(set.Has(2, result)).toBe(false);
      expect(result.size).toBe(3);
      expect(set1.size).toBe(4); // Original unchanged
    });

    it('Has should check if a set contains a value', () => {
      const set1 = new Set([1, 2, 3]);
      expect(set.Has(2, set1)).toBe(true);
      expect(set.Has(5, set1)).toBe(false);
    });

    it('Size should return the size of a set', () => {
      const set1 = new Set([1, 2, 3]);
      expect(set.Size(set1)).toBe(3);
    });

    it('IsEmpty should check if a set is empty', () => {
      const emptySet = new Set();
      const nonEmptySet = new Set([1, 2, 3]);
      expect(set.IsEmpty(emptySet)).toBe(true);
      expect(set.IsEmpty(nonEmptySet)).toBe(false);
    });
  });

  describe('Set comparison functions', () => {
    it('IsSubsetOf should check if one set is a subset of another', () => {
      const set1 = new Set([1, 2]);
      const set2 = new Set([1, 2, 3, 4]);
      const set3 = new Set([1, 2, 5]);
      
      expect(set.IsSubsetOf(set2, set1)).toBe(true);
      expect(set.IsSubsetOf(set3, set1)).toBe(true);
      expect(set.IsSubsetOf(set1, set2)).toBe(false);
      expect(set.IsSubsetOf(set1, set3)).toBe(false);
    });

    it('IsSupersetOf should check if one set is a superset of another', () => {
      const set1 = new Set([1, 2]);
      const set2 = new Set([1, 2, 3, 4]);
      
      expect(set.IsSupersetOf(set1, set2)).toBe(true);
      expect(set.IsSupersetOf(set2, set1)).toBe(false);
    });

    it('IsEqual should check if two sets are equal', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([3, 2, 1]);
      const set3 = new Set([1, 2, 3, 4]);
      
      expect(set.IsEqual(set1, set2)).toBe(true);
      expect(set.IsEqual(set1, set3)).toBe(false);
    });
  });

  describe('Set operations', () => {
    it('Intersection should return common elements between two sets', () => {
      const set1 = new Set([1, 2, 3, 4]);
      const set2 = new Set([3, 4, 5, 6]);
      const result = set.Intersection(set1, set2);
      
      expect(result.size).toBe(2);
      expect(set.Has(3, result)).toBe(true);
      expect(set.Has(4, result)).toBe(true);
    });

    it('Union should return all elements from both sets', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([3, 4, 5]);
      const result = set.Union(set1, set2);
      
      expect(result.size).toBe(5);
      expect(set.ToArray(result).sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('Subtract should remove elements in second set from first set', () => {
      const set1 = new Set([1, 2, 3, 4, 5]);
      const set2 = new Set([2, 4]);
      const result = set.Subtract(set1, set2);
      
      expect(result.size).toBe(3);
      expect(set.Has(1, result)).toBe(true);
      expect(set.Has(2, result)).toBe(false);
      expect(set.Has(3, result)).toBe(true);
      expect(set.Has(4, result)).toBe(false);
      expect(set.Has(5, result)).toBe(true);
    });

    it('Difference should return elements that are in either set but not both', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([3, 4, 5]);
      const result = set.Difference(set1, set2);
      
      expect(result.size).toBe(4);
      expect(set.Has(1, result)).toBe(true);
      expect(set.Has(2, result)).toBe(true);
      expect(set.Has(3, result)).toBe(false); // In both sets
      expect(set.Has(4, result)).toBe(true);
      expect(set.Has(5, result)).toBe(true);
    });
  });

  describe('Array-based set functions', () => {
    it('IsUnique should check if all elements in an array are unique', () => {
      const uniqueArr = [1, 2, 3, 4, 5];
      const notUniqueArr = [1, 2, 3, 4, 5, 1];
      
      expect(set.IsUnique(uniqueArr)).toBe(true);
      expect(set.IsUnique(notUniqueArr)).toBe(false);
    });

    it('Distinct should remove duplicates from an array', () => {
      const arr = [1, 2, 3, 2, 1, 4];
      const result = set.Distinct(arr);
      
      expect(result).toEqual([1, 2, 3, 4]);
    });
  });
});
