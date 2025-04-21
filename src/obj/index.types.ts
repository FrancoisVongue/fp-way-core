import { Curried2, DataObject, DeepPartial, DeepRequired, Unary } from '../core.types';

export namespace objTypes {
  // Path and Focus Types
  export type PathTree<T> = {
    [P in keyof T]-?: T[P] extends object
    ? [P] | [P, ...Path<T[P]>]
    : [P];
  };
  export type Path<T> = PathTree<T>[keyof PathTree<T>];

  export type OptionalPathTree<T> = {
    [P in keyof T]-?: T[P] extends object
    ? [] | [P] | [P, ...OptionalPath<DeepRequired<T>[P]>]
    : [P];
  };
  export type OptionalPath<T> = OptionalPathTree<DeepRequired<T>>[keyof OptionalPathTree<DeepRequired<T>>] | []

  export type Focus<T, P> =
    P extends [infer K1]
    ? K1 extends keyof T
    ? T[K1] | undefined
    : never
    : P extends [infer K1, ...infer K2]
    ? K1 extends keyof T
    ? Required<T>[K1] extends object
    ? Focus<DeepRequired<T>[K1], K2>
    : unknown
    : never
    : never

  // Function Type Signatures
  export interface Keys {
    <T extends DataObject>(obj: T): (keyof T & string)[];
  }

  export interface Values {
    <T extends DataObject>(obj: T): any[];
  }

  export interface Entries {
    <T extends DataObject>(obj: T): [string, any][];
  }

  export interface FromEntries {
    <T extends DataObject>(entries: [string, any][]): T;
  }

  export interface DeepCopy {
    <T extends DataObject>(obj: T): T;
  }

  export interface WithDefault {
    <T extends DataObject>(def: T, obj: DeepPartial<T>): T;
    <T extends DataObject>(def: T): Unary<DeepPartial<T>, T>;
  }

  export interface Impose {
    <T extends DataObject>(obj: DeepPartial<T>, def: T): T;
    <T extends DataObject>(obj: DeepPartial<T>): Unary<T, T>;
  }

  export interface ObjPick {
    <T extends DataObject, K extends keyof T>(keys: K[], obj: T): Pick<T, K>;
    <T extends DataObject, K extends keyof T>(keys: K[]): Unary<T, Pick<T, K>>;
  }

  export interface ObjOmit {
    <T extends DataObject, K extends keyof T>(keys: K[], obj: T): Omit<T, K>;
    <T extends DataObject, K extends keyof T>(keys: K[]): Unary<T, Omit<T, K>>;
  }

  export interface Flatten {
    <T extends DataObject>(obj: T): DataObject;
  }

  export interface Get {
    <T extends DataObject>(path: OptionalPath<T>, obj: T): any;
    <T extends DataObject>(path: OptionalPath<T>): Unary<T, any>;
  }

  export interface Put {
    <T extends DataObject>(path: OptionalPath<T>, value: any, obj: T): T;
    <T extends DataObject>(path: OptionalPath<T>, value: any): Unary<T, T>;
    <T extends DataObject>(path: OptionalPath<T>): Curried2<any, T, T>;
  }

  export interface HasPath {
    <T extends DataObject>(path: OptionalPath<T>, obj: T): boolean;
    <T extends DataObject>(path: OptionalPath<T>): Unary<T, boolean>;
  }

  export interface GetOr {
    <T extends DataObject, D>(defaultValue: D, path: OptionalPath<T>, obj: T): any | D;
    <T extends DataObject, D>(defaultValue: D, path: OptionalPath<T>): Unary<T, any | D>;
  }

  export interface MapValues {
    <T extends DataObject, R>(fn: Unary<any, R>, obj: T): Record<keyof T, R>;
    <T extends DataObject, R>(fn: Unary<any, R>): Unary<T, Record<keyof T, R>>;
  }

  export interface FilterValues {
    <T extends DataObject>(pred: Unary<any, boolean>, obj: T): Partial<T>;
    <T extends DataObject>(pred: Unary<any, boolean>): Unary<T, Partial<T>>;
  }

  export interface Merge {
    <A extends DataObject, B extends DataObject>(a: A, b: B): A & B;
    <A extends DataObject, B extends DataObject>(a: A): Unary<B, A & B>;
  }
  
  // mapping 
  export type ObjectMapSpec<O1 extends DataObject, O2 extends DataObject> = 
  {
    spec: {
      [P in keyof O2]: (o: O1) => O2[P]
    },
    options?: Partial<{
      async: false
    }>
  }
  export type AsyncObjectMapSpec<O1 extends DataObject, O2 extends DataObject> = {
    spec: {
      [P in keyof O2]: (o: O1) => O2[P] | Promise<O2[P]>
    },
    options: {
      async: true
    }
  }

  export interface Map {
    <O1 extends DataObject, O2 extends DataObject>(
      mapSpec: ObjectMapSpec<O1, O2>,
      src: O1
    ): O2

    <O1 extends DataObject, O2 extends DataObject>(
      mapSpec: ObjectMapSpec<O1, O2>,
    ): Unary<O1, O2>
  }

  export interface MapAsync {
    <O1 extends DataObject, O2 extends DataObject>(
      mapSpec: AsyncObjectMapSpec<O1, O2>,
      src: O1
    ): Promise<O2>

    <O1 extends DataObject, O2 extends DataObject>(
      mapSpec: AsyncObjectMapSpec<O1, O2>,
    ): Unary<O1, Promise<O2>>
  }
}