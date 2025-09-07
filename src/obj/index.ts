import {
  Exists,
  IsOfType,
  TypeOf
} from '../core';
import { DataObject, DeepPartial } from '../core.types';

export namespace obj {
  export const Keys = <T extends DataObject>(obj: T) => Object.keys(obj) as (keyof T & string)[];
  export const Values = <T extends DataObject>(obj: T) => Object.values(obj);
  export const Entries = <T extends DataObject>(obj: T) => Object.entries(obj) as [string, any][];
  export const FromEntries = <T extends DataObject>(entries: [string, any][]): T =>
    Object.fromEntries(entries) as T;

  export const DeepCopy = <T>(obj: T): T => {
    const visited = new WeakMap<any, any>();

    function deepCopyInternal(value: any): any {
      if (value === null || value === undefined) {
        return value;
      }

      if (typeof value === 'object' && visited.has(value)) {
        return visited.get(value);
      }

      if (Array.isArray(value)) {
        const result = [];
        visited.set(value, result);
        value.forEach((item, index) => {
          (result[index] as any) = deepCopyInternal(item);
        });
        return result;
      }

      if (typeof value === 'object') {
        const result: any = {};
        visited.set(value, result);
        Object.entries(value).forEach(([k, v]) => {
          result[k] = deepCopyInternal(v);
        });
        return result;
      }

      return value;
    }

    return deepCopyInternal(obj) as T;
  };

  export const WithDefault = <T extends DataObject>(
    defaults: T, 
    overrides: Partial<T>
  ): T => {
    const result = { ...defaults } as any;
    
    for (const key in overrides) {
      if (overrides.hasOwnProperty(key)) {
        if (IsOfType('object', overrides[key]) && IsOfType('object', defaults[key])) {
          // For nested objects, merge them
          result[key] = { ...defaults[key], ...overrides[key] };
        } else {
          // For non-object values or when types don't match, use override value
          result[key] = overrides[key];
        }
      }
    }
    
    return result as T;
  };

  export const Impose = <T extends DataObject>(overrides: DeepPartial<T>, defaults: T): T => {
    return obj.WithDefault(defaults, overrides);
  };

  export const Pick = <T extends DataObject, K extends keyof T>(keys: K[], object: T): Pick<T, K> => {
    const objCopy = obj.DeepCopy(object);
    const result = {} as Pick<T, K>;

    for (const key of keys) {
      result[key] = objCopy[key];
    }

    return result;
  };

  export const Omit = <T extends DataObject, K extends keyof T>(keys: K[], object: T): Omit<T, K> => {
    const objCopy = obj.DeepCopy(object);
    const result = {} as any;

    const allKeys = obj.Keys(object);
    for (const key of allKeys) {
      if (!keys.includes(key as any)) {
        result[key] = objCopy[key as keyof T];
      }
    }

    return result as Omit<T, K>;
  };


  export const Get = <T extends DataObject>(path: string[] | (keyof T)[], object: T): any => {
    const objCopy = obj.DeepCopy(object);
    let current: any = objCopy;

    for (const key of path) {
      if (current === undefined || current === null) break;
      current = current[key];
    }

    return current;
  };

  export const GetOr = <T extends DataObject, D>(defaultValue: D, path: string[] | (keyof T)[], object: T): any | D => {
    const result = obj.Get(path as any, object);
    return Exists(result) ? result : defaultValue;
  };

  export const Put = <T extends DataObject>(path: string[] | (keyof T)[], value: any, object: T): T => {
    if (!IsOfType('object', object)) {
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
      current[prop] = IsOfType('object', current[prop]) ? current[prop] : {};
      current = current[prop];
    }

    current[lastProp] = value;
    return objCopy;
  };

  export const HasPath = <T extends DataObject>(path: string[] | (keyof T)[], object: T): boolean => {
    if (path.length === 0) return true;

    let current: any = object;

    for (const key of path) {
      if (Array.isArray(current)) {
        const index = parseInt(key as string, 10);
        if (Number.isNaN(index) || index < 0 || index >= current.length) {
          return false;
        }
        current = current[index];
      } else if (!Exists(current) || !IsOfType('object', current) || !(key in current)) {
        return false;
      } else {
        current = current[key];
      }
    }

    return true;
  };

  export const Merge = <A extends DataObject, B extends DataObject>(a: A, b: B): A & B => {
    return obj.DeepCopy({ ...a, ...b }) as A & B;
  };


}