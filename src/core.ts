import * as R from 'ramda';
import { Binary, FunctionTypes, JSTypesWithArrayAndNull, TCurry, Unary } from './core.types';

export const Curry: TCurry = function (f, ...initialArgs) {
    return function curried(...newArgs) {
        const args = [...initialArgs, ...newArgs];
        if (args.length >= f.length)
            return f(...args);
        else
            return (Curry as any)(f, ...args);
    }
};

export const Pipe = R.pipe; // Left-to-right composition
export const Compose = R.compose; // Right-to-left composition

// Core utilities from Ramda
export const Identity = R.identity; // Simple identity function
export const Const = R.always; // Returns a constant value
export const Return = Const;
export const TRUE = R.T; // Always true
export const FALSE = R.F; // Always false
export const DoNothing = (_?: any) => { };
export const Not = R.complement; // Negates a value or predicate
export const Is = R.equals; // Equality check (curried by Ramda)
export const Exists = Not(R.isNil); // Not null or undefined
export const Variable = (_?: any) => <T>(b: T) => b;

// Swaps the order of arguments for a binary function
export const Swap: FunctionTypes.Swap = Curry(
    <T1, T2, R>(fn: Binary<T1, T2, R>) => (b: T2, a: T1): R => fn(a, b)
);

export const Satisfies = R.allPass; // Replaces R.all(R.applyTo(value), predicates)
export const IsEither = R.anyPass;   // Replaces R.any(R.applyTo(value), predicates)
export const IsNeither = Not(R.anyPass); // Replaces R.none(R.applyTo(value), predicates)

// Custom functions not directly in Ramda
export const InCase: FunctionTypes.InCase = Curry(
    <T, R>(entries: [Unary<T, boolean>, Unary<T, R>][], v: T): R | void => {
        for (const [predicate, f] of entries) {
            if (predicate(v)) return f(v);
        }
        return void 0; 
    }
);

export const IndependentInCase: FunctionTypes.IndependentInCase = Curry(
    <T, R>(entries: [Unary<T, boolean>, Unary<T, R>][], v: T): R[] => {
        const results: R[] = [];
        for (const [predicate, f] of entries) {
            if (predicate(v)) results.push(f(v));
        }
        return results;
    }
);

export const IsOfType = Curry((type: JSTypesWithArrayAndNull, v: any): boolean => {
    return TypeOf(v) === type;
});

export const TypeOf = (v: any): JSTypesWithArrayAndNull => {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    return typeof v as JSTypesWithArrayAndNull;
};

// Derived utilities (optional, can be composed as needed)
export const IsNot = R.complement(Is);
export const NotExists = R.isNil;
export const When = R.when; // Predicate-based transformation
export const Unless = R.unless; // Inverse of When
export const IfElse = R.ifElse; // Conditional logic

