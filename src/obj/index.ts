import {
  Curry,
  Exists,
  IsOfType,
  TypeOf
} from '../core';
import { DataObject, DeepPartial } from '../core.types';
import { objTypes } from './index.types';

export namespace obj {
  // Basic Object Accessors
  export const Keys: objTypes.Keys = <T extends DataObject>(obj: T) => Object.keys(obj) as (keyof T & string)[];
  export const Values: objTypes.Values = <T extends DataObject>(obj: T) => Object.values(obj);
  export const Entries: objTypes.Entries = <T extends DataObject>(obj: T) => Object.entries(obj) as [string, any][];
  export const FromEntries: objTypes.FromEntries = <T extends DataObject>(entries: [string, any][]) =>
    Object.fromEntries(entries) as T;

  // Deep Copy - self-contained implementation for recursion
  export const DeepCopy: objTypes.DeepCopy = <T extends DataObject>(obj: T): T => {
    // Use a WeakMap to track copied objects and avoid circular reference issues
    const visited = new WeakMap<any, any>();

    // Define a recursive function inside to avoid namespace references
    function deepCopyInternal(value: any): any {
      // Handle null or undefined
      if (value === null || value === undefined) {
        return value;
      }

      // Check if we've already copied this object
      if (typeof value === 'object' && visited.has(value)) {
        return visited.get(value);
      }

      // Handle arrays
      if (Array.isArray(value)) {
        const result = [];
        visited.set(value, result); // Store the array before copying elements
        value.forEach((item, index) => {
          (result[index] as any) = deepCopyInternal(item);
        });
        return result;
      }

      // Handle objects
      if (typeof value === 'object') {
        const result: any = {};
        visited.set(value, result); // Store the object before copying properties
        Object.entries(value).forEach(([k, v]) => {
          result[k] = deepCopyInternal(v);
        });
        return result;
      }

      // Return primitives as-is
      return value;
    }

    return deepCopyInternal(obj) as T;
  };

  // Merging with Defaults
  export const WithDefault: objTypes.WithDefault = Curry(<T extends DataObject>(def: T, obj2: DeepPartial<T>): T => {
    // Create internal implementation to avoid namespace references
    function withDefaultInternal(defaultObj: any, partialObj: any): any {
      if (!IsOfType('object')(defaultObj) || !IsOfType('object')(partialObj)) {
        return Exists(partialObj) ? partialObj : defaultObj;
      }

      const result = {} as any;
      const allKeys = [...new Set([...Object.keys(defaultObj), ...Object.keys(partialObj)])];

      for (const key of allKeys) {
        const defValue = defaultObj[key];
        const objValue = partialObj[key];

        if (IsOfType('object')(defValue) && IsOfType('object')(objValue)) {
          result[key] = withDefaultInternal(defValue, objValue);
        } else if (Exists(objValue)) {
          result[key] = objValue;
        } else {
          result[key] = defValue;
        }
      }

      return result;
    }

    const defCopy = obj.DeepCopy(def);
    const objCopy = obj.DeepCopy(obj2 as T);
    return withDefaultInternal(defCopy, objCopy) as T;
  });

  export const Impose: objTypes.Impose = Curry(<T extends DataObject>(o: DeepPartial<T>, def: T): T => {
    return obj.WithDefault(def, o);
  });

  // Property Selection
  export const Pick: objTypes.ObjPick = Curry(<T extends DataObject, K extends keyof T>(keys: K[], object: T): Pick<T, K> => {
    const objCopy = obj.DeepCopy(object);
    const result = {} as Pick<T, K>;

    for (const key of keys) {
      result[key] = objCopy[key];
    }

    return result;
  });

  export const Omit: objTypes.ObjOmit = Curry(<T extends DataObject, K extends keyof T>(keys: K[], object: T): Omit<T, K> => {
    const objCopy = obj.DeepCopy(object);
    const result = {} as any;

    const allKeys = obj.Keys(object);
    for (const key of allKeys) {
      if (!keys.includes(key as any)) {
        result[key] = objCopy[key as keyof T];
      }
    }

    return result as Omit<T, K>;
  });

  // Flattening and Path Operations
  export const Flatten: objTypes.Flatten = <T extends DataObject>(object: T): DataObject => {
    // Define internal recursive function to avoid namespace references
    function flattenInternal(obj: any, prefix = ''): [string, any][] {
      const result: [string, any][] = [];

      if (Array.isArray(obj)) {
        // Handle arrays specifically - add each index as a key
        obj.forEach((item, index) => {
          const fullKey = prefix ? `${prefix}.${index}` : `${index}`;
          if (typeof item === 'object' && item !== null) {
            result.push(...flattenInternal(item, fullKey));
          } else {
            result.push([fullKey, item]);
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        // Handle regular objects
        Object.entries(obj).forEach(([key, value]) => {
          const fullKey = prefix ? `${prefix}.${key}` : key;

          if (Array.isArray(value)) {
            // Handle nested arrays
            value.forEach((item, index) => {
              const arrayKey = `${fullKey}.${index}`;
              if (typeof item === 'object' && item !== null) {
                result.push(...flattenInternal(item, arrayKey));
              } else {
                result.push([arrayKey, item]);
              }
            });
          } else if (Exists(value) && IsOfType('object')(value)) {
            result.push(...flattenInternal(value, fullKey));
          } else {
            result.push([fullKey, value]);
          }
        });
      }

      return result;
    }

    return Object.fromEntries(flattenInternal(object));
  };

  export const Get: objTypes.Get = Curry(<T extends DataObject>(path: string[] | (keyof T)[], object: T): any => {
    const objCopy = obj.DeepCopy(object);
    let current: any = objCopy;

    for (const key of path) {
      if (current === undefined || current === null) break;
      current = current[key];
    }

    return current;
  });

  export const GetOr: objTypes.GetOr = Curry(
    <T extends DataObject, D>(defaultValue: D, path: string[] | (keyof T)[], object: T): any | D => {
      const result = obj.Get(path as any, object);
      return Exists(result) ? result : defaultValue;
    }
  );

  export const Put: objTypes.Put = Curry(
    <T extends DataObject>(path: string[] | (keyof T)[], value: any, object: T): T => {
      if (!IsOfType('object')(object)) {
        throw new Error(`Invalid input to Put: type must be "object", got ${TypeOf(object)}`);
      }

      const objCopy = obj.DeepCopy(object);

      // Empty path, return the object as is
      if (path.length === 0) return objCopy;

      // Handle single-level property directly
      if (path.length === 1) {
        const result = objCopy as any;
        result[path[0]] = value;
        return objCopy;
      }

      // Handle nested properties
      let current: any = objCopy;
      const props = path.slice(0, -1);
      const lastProp = path[path.length - 1];

      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        current[prop] = IsOfType('object')(current[prop]) ? current[prop] : {};
        current = current[prop];
      }

      current[lastProp] = value;
      return objCopy;
    }
  );

  // Additional Path Utilities
  export const HasPath: objTypes.HasPath = Curry(
    <T extends DataObject>(path: string[] | (keyof T)[], object: T): boolean => {
      if (path.length === 0) return true;

      let current: any = object;

      for (const key of path) {
        // For arrays, check if key is a valid index
        if (Array.isArray(current)) {
          const index = parseInt(key as string, 10);
          // Check if key is a valid array index
          if (Number.isNaN(index) || index < 0 || index >= current.length) {
            return false;
          }
          current = current[index];
        } else if (!Exists(current) || !IsOfType('object')(current) || !(key in current)) {
          return false;
        } else {
          current = current[key];
        }
      }

      return true;
    }
  );

  // Merging and Combining
  export const Merge: objTypes.Merge = Curry(<A extends DataObject, B extends DataObject>(a: A, b: B): A & B => {
    return obj.DeepCopy({ ...a, ...b }) as A & B;
  });


  // =========== mapping
  export const Map: objTypes.Map = Curry((
    mapSpec: objTypes.ObjectMapSpec<any, any>,
    originalSrc: DataObject
  ): any => {
    if (!IsOfType('object', mapSpec))
      throw Error(`Invalid input to Map: spec must be an object`);
    if (!IsOfType('object', originalSrc))
      throw Error(`Invalid input to Map: src must be an object`);

    const src = obj.DeepCopy(originalSrc);
    // const fnsWithParamsAndKey: FPK[] = [];
    const entries: [string, any][] = [];

    for (let [destKey, mapper] of obj.Entries(mapSpec)) {
      // fnsWithParamsAndKey.push([mapper, src, destKey]);
      const key = destKey as keyof typeof src;
      const value = mapper(src);
      entries.push([key, value]);
    }

    return obj.FromEntries(entries);
  })
  
  export const MapAsync: objTypes.MapAsync = Curry(async (
    mapSpec: objTypes.AsyncObjectMapSpec<any, any>,
    originalSrc: DataObject
  ): Promise<any> => {
    if (!IsOfType('object', mapSpec))
      throw Error(`Invalid input to MapAsync: spec must be an object`);
    if (!IsOfType('object', originalSrc))
      throw Error(`Invalid input to MapAsync: src must be an object`);

    const src = obj.DeepCopy(originalSrc);

    const promises = obj.Entries(mapSpec).map(async ([destKey, mapper]) => {
      const key = destKey as keyof typeof src;
      const value = await mapper(src);
      return [key, value] as [string, any];
    });

    const entries = await Promise.all(promises);

    return obj.FromEntries(entries);
  })
}