export namespace set {
  // Creation functions
  export const OfValues = <T>(...values: T[]): Set<T> => new Set(values);
  export const FromArray = <T>(arr: T[]): Set<T> => new Set(arr);
  export const ToArray = <T>(set: Set<T>): T[] => Array.from(set);

  // Basic set operations
  export const Add = <T>(value: T, set: Set<T>): Set<T> => {
    const newSet = new Set(set);
    newSet.add(value);
    return newSet;
  };

  export const Delete = <T>(value: T, set: Set<T>): Set<T> => {
    const newSet = new Set(set);
    newSet.delete(value);
    return newSet;
  };

  export const Has = <T>(value: T, set: Set<T>): boolean => set.has(value);
  export const Size = <T>(set: Set<T>): number => set.size;
  export const IsEmpty = <T>(set: Set<T>): boolean => set.size === 0;

  // Set comparison functions
  export const IsSubsetOf = <T>(superset: Set<T>, subset: Set<T>): boolean => {
    if (subset.size > superset.size) return false;
    for (const value of subset) {
      if (!superset.has(value)) return false;
    }
    return true;
  };

  export const IsSupersetOf = <T>(subset: Set<T>, superset: Set<T>): boolean => {
    if (superset.size < subset.size) return false;
    for (const value of subset) {
      if (!superset.has(value)) return false;
    }
    return true;
  };

  export const IsEqual = <T>(set1: Set<T>, set2: Set<T>): boolean => {
    if (set1.size !== set2.size) return false;
    for (const value of set1) {
      if (!set2.has(value)) return false;
    }
    return true;
  };

  // Set operations
  export const Intersection = <T>(set1: Set<T>, set2: Set<T>): Set<T> => {
    const [smallerSet, largerSet] = set1.size > set2.size ? [set2, set1] : [set1, set2];
    const result = new Set<T>();
    for (const value of smallerSet) {
      if (largerSet.has(value)) {
        result.add(value);
      }
    }
    return result;
  };

  export const Union = <T>(set1: Set<T>, set2: Set<T>): Set<T> => {
    const result = new Set([...set1]);
    for (const value of set2) {
      result.add(value);
    }
    return result;
  };

  export const Subtract = <T>(set1: Set<T>, set2: Set<T>): Set<T> => {
    const result = new Set(set1);
    for (const value of set2) {
      result.delete(value);
    }
    return result;
  };

  export const Difference = <T>(set1: Set<T>, set2: Set<T>): Set<T> => {
    const result = new Set<T>();
    for (const value of set1) {
      if (!set2.has(value)) {
        result.add(value);
      }
    }
    for (const value of set2) {
      if (!set1.has(value)) {
        result.add(value);
      }
    }
    return result;
  };

  // Functions that work with arrays but are fundamentally set operations
  export const IsUnique = <T>(arr: T[]): boolean => {
    const arrSet = new Set(arr);
    return arrSet.size === arr.length;
  };

  export const Distinct = <T>(arr: T[]): T[] => {
    return Array.from(new Set(arr));
  };
}
