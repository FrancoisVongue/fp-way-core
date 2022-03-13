import {
    Binary,
    Curried2, Curried3,
    JSTypesWithArrayAndNull,
    Predicate,
    TCurry,
    Unary, UnaryPredicate
} from "./core.types";

export const Curry: TCurry = function (f, ...initialArgs) {
    return function curried(...newArgs) {
        const args = [...initialArgs, ...newArgs];

        if (args.length >= f.length)
            return f(...args);
        else
            return (Curry as any)(f, ...args);
    }
}

export const Identity = <T1>(v: T1) => v;
export const Const: {
    <T1>(
        value: T1,
    ): (_?: any) => T1
    <T1>(
        value: T1,
        _: any
    ): T1
} = Curry((a, _) => a)
export const Return = Const;
export const TRUE = Const(true);
export const FALSE = Const(false);
export const Variable: {
    <T1>(
        _: any,
        value: T1,
    ): T1
    <T1>(
        _: any,
    ): Unary<T1, T1>
} = Curry((_, b) => b)
export const DoNothing = (_?) => {};
export const Not = (f: Predicate): Predicate => (...args) => !f(...args);

export const Is = Curry((a, b) => a === b);
export const Exists = a => !(a === null || a === undefined);
export const IsNot = Not(Is);
export const NotExists = Not(Exists);

export const Swap = <T1, T2, R>(
    f: Binary<T1, T2, R> | Curried2<T1, T2, R>
): Curried2<T2, T1, R> => Curry((a, b) => f(b,a)) as any;

export const Call = Curry((f, v) => f(v))
export const ApplyOn = Swap(Call)

export const IfElse: {
    <T, R>(
        predicate: Unary<T, boolean>,
        onSuccess: Unary<T, R>,
        onFail: Unary<T, R>,
        value: T
    ): R

    <T, R>(
        predicate: Unary<T, boolean>,
        onSuccess: Unary<T, R>,
        onFail: Unary<T, R>,
    ): Unary<T, R>

    <T, R>(
        predicate: Unary<T, boolean>,
        onSuccess: Unary<T, R>,
    ): Curried2<Unary<T, R>, T, R>

    <T, R>(
        predicate: Unary<T, boolean>,
    ): Curried3<Unary<T, R>, Unary<T, R>, T, R>
} = Curry((
    p, onSuccess, onFail, arg
) => p(arg) ? onSuccess(arg) : onFail(arg));

export const When: {
    <T>(
        predicate: Unary<T, boolean>,
        onSuccess: Unary<T, T>,
        value: T
    ): T

    <T>(
        predicate: Unary<T, boolean>,
        onSuccess: Unary<T, T>,
    ): Unary<T, T>

    <T>(
        predicate: Unary<T, boolean>,
    ): Curried2<Unary<T, T>, T, T>
} = Curry((p, f, a) => p(a) ? f(a) : a);

export const Unless: {
    <T>(
        predicate: Unary<T, boolean>,
        onFail: Unary<T, T>,
        value: T
    ): T

    <T>(
        predicate: Unary<T, boolean>,
        onFail: Unary<T, T>,
    ): Unary<T, T>

    <T>(
        predicate: Unary<T, boolean>,
    ): Curried2<Unary<T, T>, T, T>
} = Curry((p, f, a) => !p(a) ? f(a) : a);

export const InCase: {
    <T, R>(
        entries: [Unary<T, boolean>, Unary<T, R>][],
    ): (v: T) => R

    <T, R>(
        entries: [Unary<T, boolean>, Unary<T, R>][],
        v: T
    ): R
} = Curry((
    entries: [Unary<any, boolean>, Unary<any, any>][],
    v: any
): any => {
    for(let entry of entries) {
        const [predicate, f] = entry;
        if(predicate(v)) {
            return f(v);
        }
    }
});

export const IndependentInCase: {
    <T, R>(
        entries: [Unary<T, boolean>, Unary<T, R>][],
    ): (v: T) => R[]

    <T, R>(
        entries: [Unary<T, boolean>, Unary<T, R>][],
        v: T
    ): R[]
} = Curry((
    entries: [Unary<any, boolean>, Unary<any, any>][],
    val: any
): any[] => {
    const results: any[] = [];

    for(let entry of entries) {
        const [predicate, f] = entry;
        if(predicate(val)) {
            results.push(f(val));
        }
    }

    return results;
});

export const CanBeDescribedAs: {
    <T>(
        predicates: UnaryPredicate<T>[],
        value: T
    ): boolean

    <T>(
        predicates: UnaryPredicate<T>[],
    ): Unary<T, boolean>
} = Curry((ps: Predicate[], v: any) => {
    return ps.map(ApplyOn(v)).every(Is(true))
});

export const IsEither: {
    <T>(
        predicates: UnaryPredicate<T>[],
        value: T
    ): boolean

    <T>(
        predicates: UnaryPredicate<T>[],
    ): Unary<T, boolean>
} = Curry((ps: Predicate[], v: any) => {
    return ps.map(ApplyOn(v)).some(Is(true))
});

export const Pipe: {
    <T1, R>(fns: [Unary<T1, R>], v: T1): R
    <T1, R>(fns: [Unary<T1, R>]): Unary<T1, R>
    <T1, T2, R>(fns: [Unary<T1, T2>, Unary<T2, R>], v: T1): R
    <T1, T2, R>(fns: [Unary<T1, T2>, Unary<T2, R>]): Unary<T1, R>
    <T1, T2, R>(fns: [Unary<T1, T2>, Unary<T2, R>], v: T1): R
    <T1, T2, T3, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, R>]): Unary<T1, R>
    <T1, T2, T3, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, R>], v: T1): R
    <T1, T2, T3, T4, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, R>]): Unary<T1, R>
    <T1, T2, T3, T4, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, R>], v: T1): R
    <T1, T2, T3, T4, T5, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, T5>, Unary<T5, R>]): Unary<T1, R>
    <T1, T2, T3, T4, T5, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, T5>, Unary<T5, R>], v: T1): R
    <T1, T2, T3, T4, T5, T6, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, T5>, Unary<T5, T6>, Unary<T6, R>]): Unary<T1, R>
    <T1, T2, T3, T4, T5, T6, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, T5>, Unary<T5, T6>, Unary<T6, R>], v: T1): R
    <T1, T2, T3, T4, T5, T6, T7, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, T5>, Unary<T5, T6>, Unary<T6, T7>, Unary<T7, R>]): Unary<T1, R>
    <T1, T2, T3, T4, T5, T6, T7, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, T5>, Unary<T5, T6>, Unary<T6, T7>, Unary<T7, R>], v: T1): R
    <T1, T2, T3, T4, T5, T6, T7, T8, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, T5>, Unary<T5, T6>, Unary<T6, T7>, Unary<T7, T8>, Unary<T8, R>]): Unary<T1, R>
    <T1, T2, T3, T4, T5, T6, T7, T8, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, T5>, Unary<T5, T6>, Unary<T6, T7>, Unary<T7, T8>, Unary<T8, R>], v: T1): R
    <T1, T2, T3, T4, T5, T6, T7, T8, T9, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, T5>, Unary<T5, T6>, Unary<T6, T7>, Unary<T7, T8>, Unary<T8, T9>, Unary<T9, R>]): Unary<T1, R>
    <T1, T2, T3, T4, T5, T6, T7, T8, T9, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, T5>, Unary<T5, T6>, Unary<T6, T7>, Unary<T7, T8>, Unary<T8, T9>, Unary<T9, R>], v: T1): R
    <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, T5>, Unary<T5, T6>, Unary<T6, T7>, Unary<T7, T8>, Unary<T8, T9>, Unary<T9, T10>, Unary<T10, R>]): Unary<T1, R>
    <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, R>(fns: [Unary<T1, T2>, Unary<T2, T3>, Unary<T3, T4>, Unary<T4, T5>, Unary<T5, T6>, Unary<T6, T7>, Unary<T7, T8>, Unary<T8, T9>, Unary<T9, T10>, Unary<T10, R>], v: T1): R
} = Curry((fns: Unary<any, any>[], arg: any): Unary<any, any> => {
    let currentArg = arg;

    for(let fn of fns)
        currentArg = fn(currentArg);

    return currentArg;
});

export const Compose: {
    <T1, R>(fns: [Unary<T1, R>], v: T1): R
    <T1, R>(fns: [Unary<T1, R>]): Unary<T1, R>
    <T1, T2, R>(fns: [Unary<T2, R>, Unary<T1, T2>]): Unary<T1, R>
    <T1, T2, R>(fns: [Unary<T2, R>, Unary<T1, T2>], v: T1): R
    <T1, T2, T3, R>(fns: [Unary<T3, R>, Unary<T2, T3>, Unary<T1, T2>]): Unary<T1, R>
    <T1, T2, T3, R>(fns: [Unary<T3, R>, Unary<T2, T3>, Unary<T1, T2>], v: T1): R
    <T1, T2, T3, T4, R>(fns: [Unary<T4, R>, Unary<T3, T4>, Unary<T2, T3>, Unary<T1, T2>]): Unary<T1, R>
    <T1, T2, T3, T4, R>(fns: [Unary<T4, R>, Unary<T3, T4>, Unary<T2, T3>, Unary<T1, T2>], v: T1): R
    <T1, T2, T3, T4, T5, T6, R>(fns: [Unary<T6, R>, Unary<T5, T6>, Unary<T4, T5>, Unary<T3, T4>, Unary<T2, T3>, Unary<T1, T2>]): Unary<T1, R>
    <T1, T2, T3, T4, T5, T6, R>(fns: [Unary<T6, R>, Unary<T5, T6>, Unary<T4, T5>, Unary<T3, T4>, Unary<T2, T3>, Unary<T1, T2>], v: T1): R
    <T1, T2, T3, T4, T5, T6, T7, R>(fns: [Unary<T7, R>, Unary<T6, T7>, Unary<T5, T6>, Unary<T4, T5>, Unary<T3, T4>, Unary<T2, T3>, Unary<T1, T2>]): Unary<T1, R>
    <T1, T2, T3, T4, T5, T6, T7, R>(fns: [Unary<T7, R>, Unary<T6, T7>, Unary<T5, T6>, Unary<T4, T5>, Unary<T3, T4>, Unary<T2, T3>, Unary<T1, T2>], v: T1): R
    <T1, T2, T3, T4, T5, T6, T7, T8, R>(fns: [Unary<T8, R>, Unary<T7, T8>, Unary<T6, T7>, Unary<T5, T6>, Unary<T4, T5>, Unary<T3, T4>, Unary<T2, T3>, Unary<T1, T2>]): Unary<T1, R>
    <T1, T2, T3, T4, T5, T6, T7, T8, R>(fns: [Unary<T8, R>, Unary<T7, T8>, Unary<T6, T7>, Unary<T5, T6>, Unary<T4, T5>, Unary<T3, T4>, Unary<T2, T3>, Unary<T1, T2>], v: T1): R
    <T1, T2, T3, T4, T5, T6, T7, T8, T9, R>(fns: [Unary<T9, R>, Unary<T8, T9>, Unary<T7, T8>, Unary<T6, T7>, Unary<T5, T6>, Unary<T4, T5>, Unary<T3, T4>, Unary<T2, T3>, Unary<T1, T2>]): Unary<T1, R>
    <T1, T2, T3, T4, T5, T6, T7, T8, T9, R>(fns: [Unary<T9, R>, Unary<T8, T9>, Unary<T7, T8>, Unary<T6, T7>, Unary<T5, T6>, Unary<T4, T5>, Unary<T3, T4>, Unary<T2, T3>, Unary<T1, T2>], v: T1): R
    <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, R>(fns: [Unary<T10, R>, Unary<T9, T10>, Unary<T8, T9>, Unary<T7, T8>, Unary<T6, T7>, Unary<T5, T6>, Unary<T4, T5>, Unary<T3, T4>, Unary<T2, T3>, Unary<T1, T2>]): Unary<T1, R>
    <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, R>(fns: [Unary<T10, R>, Unary<T9, T10>, Unary<T8, T9>, Unary<T7, T8>, Unary<T6, T7>, Unary<T5, T6>, Unary<T4, T5>, Unary<T3, T4>, Unary<T2, T3>, Unary<T1, T2>], v: T1): R
} = Curry((fns: Unary<any, any>[], a: any): Unary<any, any> => Pipe(fns.reverse() as any, a));

export const IsOfType = Curry((desiredType: JSTypesWithArrayAndNull, v: any) => {
    return desiredType === TypeOf(v)
});

export const TypeOf = (v): JSTypesWithArrayAndNull => {
    return InCase([
        [Is(null), Return("null")],
        [a => Array.isArray(a), Return("array")],
        [TRUE, a => typeof a]
    ], v);
}
