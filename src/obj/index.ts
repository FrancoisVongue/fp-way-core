import {
  Curry,
  Exists,
  IsOfType,
  TypeOf
} from '../core';
import { DataObject, DeepPartial } from '../core.types';
import { objTypes } from './index.types';

export namespace obj {
  export const Keys: objTypes.Keys = <T extends DataObject>(obj: T) => Object.keys(obj) as (keyof T & string)[];
  export const Values: objTypes.Values = <T extends DataObject>(obj: T) => Object.values(obj);
  export const Entries: objTypes.Entries = <T extends DataObject>(obj: T) => Object.entries(obj) as [string, any][];
  export const FromEntries: objTypes.FromEntries = <T extends DataObject>(entries: [string, any][]) =>
    Object.fromEntries(entries) as T;

  export const DeepCopy: objTypes.DeepCopy = <T extends DataObject>(obj: T): T => {
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

  export const WithDefault: objTypes.WithDefault = Curry(<T extends DataObject>(def: T, obj2: DeepPartial<T>): T => {
    function withDefaultInternal(defaultObj: any, partialObj: any): any {
      if (!IsOfType('object', defaultObj) || !IsOfType('object', partialObj)) {
        return Exists(partialObj) ? partialObj : defaultObj;
      }

      const result = {} as any;
      const allKeys = [...new Set([...Object.keys(defaultObj), ...Object.keys(partialObj)])];

      for (const key of allKeys) {
        const defValue = defaultObj[key];
        const objValue = partialObj[key];

        if (IsOfType('object', defValue) && IsOfType('object', objValue)) {
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

  export const Flatten: objTypes.Flatten = <T extends DataObject>(object: T): DataObject => {
    function flattenInternal(obj: any, prefix = ''): [string, any][] {
      const result: [string, any][] = [];

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const fullKey = prefix ? `${prefix}.${index}` : `${index}`;
          if (typeof item === 'object' && item !== null) {
            result.push(...flattenInternal(item, fullKey));
          } else {
            result.push([fullKey, item]);
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          const fullKey = prefix ? `${prefix}.${key}` : key;

          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              const arrayKey = `${fullKey}.${index}`;
              if (typeof item === 'object' && item !== null) {
                result.push(...flattenInternal(item, arrayKey));
              } else {
                result.push([arrayKey, item]);
              }
            });
          } else if (Exists(value) && IsOfType('object', value)) {
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
    }
  );

  export const HasPath: objTypes.HasPath = Curry(
    <T extends DataObject>(path: string[] | (keyof T)[], object: T): boolean => {
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
    }
  );

  export const Merge: objTypes.Merge = Curry(<A extends DataObject, B extends DataObject>(a: A, b: B): A & B => {
    return obj.DeepCopy({ ...a, ...b }) as A & B;
  });


  export const Map: objTypes.Map = Curry((
    mapSpec: objTypes.ObjectMapSpec<any, any>,
    originalSrc: DataObject
  ): any => {
    if (!IsOfType('object', mapSpec))
      throw Error(`Invalid input to Map: spec must be an object`);
    if (!IsOfType('object', originalSrc))
      throw Error(`Invalid input to Map: src must be an object`);

    const src = obj.DeepCopy(originalSrc);
    const entries: [string, any][] = [];

    for (let [destKey, mapper] of obj.Entries(mapSpec)) {
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