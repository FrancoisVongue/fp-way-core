import { Predicate, Unary, Ternary, Curried2 } from "../core.types"

export namespace arrTypes {
  export interface Select {
    <T1>(p: Ternary<T1, number, T1[], boolean>, arr: T1[]): T1[]
    <T1>(p: Ternary<T1, number, T1[], boolean>): Unary<T1[], T1[]>
  }

  export interface Exclude {
    <T1>(p: Ternary<T1, number, T1[], boolean>, arr: T1[]): T1[]
    <T1>(p: Ternary<T1, number, T1[], boolean>): Unary<T1[], T1[]>
  }

  export interface Map {
    <T1, T2>(f: Ternary<T1, number, T1[], T2>, arr: T1[]): T2[]
    <T1, T2>(f: Ternary<T1, number, T1[], T2>): Unary<T1[], T2[]>
  }

  export interface Reduce {
    <T1, R>(reducer: Ternary<R, T1, T1[], R>, base: R, arr: T1[]): R
    <T1, R>(reducer: Ternary<R, T1, T1[], R>, base: R): Unary<T1[], R>
    <T1, R>(reducer: Ternary<R, T1, T1[], R>): Curried2<R, T1[], R>
  }

  export interface TakeNFirst {
    <T1>(n: number, arr: T1[]): T1[]
    (n: number): <T1>(arr: T1[]) => T1[]
  }

  export interface TakeNLast {
    <T1>(n: number, arr: T1[]): T1[]
    (n: number): <T1>(arr: T1[]) => T1[]
  }

  export interface ConcatTo {
    <T1>(arr: T1[], arr2: T1[]): T1[]
    <T1>(arr: T1[]): Unary<T1[], T1[]>
  }

  export interface Append {
    <T1>(v: T1, arr: T1[]): T1[]
    <T1>(v: T1): Unary<T1[], T1[]>
  }

  export interface Prepend {
    <T1>(v: T1, arr: T1[]): T1[]
    <T1>(v: T1): Unary<T1[], T1[]>
  }

  export interface Intersection {
    <T1>(arr1: T1[], arr2: T1[]): T1[]
    <T1>(arr1: T1[]): Unary<T1[], T1[]>
  }

  export interface Subtract {
    <T1>(arr1: T1[], arr2: T1[]): T1[]
    <T1>(arr1: T1[]): Unary<T1[], T1[]>
  }

  export interface Every {
    <T1>(p: Ternary<T1, number, T1[], boolean>, arr: T1[]): boolean
    <T1>(p: Ternary<T1, number, T1[], boolean>): Unary<T1[], boolean>
  }

  export interface Some {
    <T1>(p: Ternary<T1, number, T1[], boolean>, arr: T1[]): boolean
    <T1>(p: Ternary<T1, number, T1[], boolean>): Unary<T1[], boolean>
  }

  export interface None {
    <T1>(p: Ternary<T1, number, T1[], boolean>, arr: T1[]): boolean
    <T1>(p: Ternary<T1, number, T1[], boolean>): Unary<T1[], boolean>
  }

  export interface ContainedIn {
    <T1>(arr: T1[], v: T1): boolean
    <T1>(arr: T1[]): Unary<T1, boolean>
  }

  export interface Contains {
    <T1>(v: T1, arr: T1[]): boolean
    <T1>(v: T1): Unary<T1[], boolean>
  }

  export interface IsSupersetOf {
    <T1>(sub: T1[], sup: T1[]): boolean
    <T1>(sub: T1[]): Unary<T1[], boolean>
  }

  export interface IsSubsetOf {
    <T1>(sup: T1[], sub: T1[]): boolean
    <T1>(sup: T1[]): Unary<T1[], boolean>
  }

  export interface EqualsArray {
    (arr: any[], arrUnderTest: any[]): boolean
    (arr: any[]): Unary<any[], boolean>
  }

  export interface IsUnique {
    (arr: any[]): boolean
  }

  export interface Partition {
    <T>(p: Predicate, arr: T[]): [T[], T[]];
    <T>(p: Predicate): Unary<T[], [T[], T[]]>;
  }

  export interface Chunk {
    <T>(size: number, arr: T[]): T[][];
    <T>(size: number): Unary<T[], T[][]>;
  }

  export interface GroupBy {
    <T>(fn: Unary<T, string>, arr: T[]): Record<string, T[]>;
    <T>(fn: Unary<T, string>): Unary<T[], Record<string, T[]>>;
  }

  export interface Zip {
    <T1, T2>(arr1: T1[], arr2: T2[]): [T1, T2][];
    <T1, T2>(arr1: T1[]): Unary<T2[], [T1, T2][]>;
  }

  export interface SortBy {
    <T, K extends number | string>(fn: Unary<T, K>, order: "asc" | "desc", arr: T[]): T[];
    <T, K extends number | string>(fn: Unary<T, K>, order: "asc" | "desc"): Unary<T[], T[]>;
    <T, K extends number | string>(fn: Unary<T, K>): Curried2<"asc" | "desc", T[], T[]>;
  }
}
