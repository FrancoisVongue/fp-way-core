import {Curry, Exists, InCase, IsOfType, Pipe, Swap, TRUE, Identity, When, TypeOf} from "../core";
import {Binary, DataObject, DeepPartial, Unary} from "../core.types";

export namespace obj {
    export const Keys = <T1 extends DataObject>(obj: T1): (keyof T1 & string)[] => Object.keys(obj);
    export const Entries = <T1 extends DataObject>(obj: T1): [(keyof T1 & string), any][] => Object.entries(obj);
    export const FromEntries = <T1 extends DataObject>(entries: [keyof T1, any][]): T1 =>
        entries.reduce((b, [k, v]) => (b[k] = v, b), {} as T1);

    export const DeepCopy = <T1>(obj: T1): T1 => {
        return InCase<T1, T1>([
            [IsOfType('array'), arr => (arr as any).map(DeepCopy)],
            [IsOfType('object'), Pipe([
                Entries,
                (entries: [string, any][]) => entries.map(([k, v]) => [k, DeepCopy(v)]),
                FromEntries
            ])],
            [TRUE, Identity]
        ], obj)
    };

    export const WithDefault: {
        <T extends DataObject>(
            def: DeepPartial<T>,
            obj: DeepPartial<T>,
        ): DeepPartial<T>

        <T extends DataObject>(
            def: DeepPartial<T>,
        ): Unary<DeepPartial<T>, DeepPartial<T>>
    } = Curry((def, obj) => {
        const objCopy = DeepCopy(obj);
        const defCopy = DeepCopy(def);
        const allProps = [...new Set([...Keys(objCopy), ...Keys(defCopy)])];

        for(const key of allProps) {
            objCopy[key] = InCase([
                // if both are objects, merge them again
                [
                    ([defv, v]) => [defv, v].every(IsOfType("object")),
                    ([def, o]) => WithDefault(def, o)],
                [([_, v]) => Exists(v), ([_, v]) => v],// if not, and obj has value, simply replace
                [TRUE, ([defv, _]) => defv],          // if there's no value, return default
            ], [defCopy[key], objCopy[key]])
        }

        return objCopy;
    });

    export const Impose: {
        <T1 extends DataObject, R extends DeepPartial<T1>>(
            def: DeepPartial<T1>,
            obj: DeepPartial<T1>,
        ): R

        <T1 extends DataObject, R extends DeepPartial<T1>>(
            def: DeepPartial<T1>,
        ): R
    } = Swap(WithDefault);

    export const Pick: {
        <T1 extends DataObject>(
            keys: (keyof T1)[],
            obj: T1
        ): Partial<T1>

        <T1 extends DataObject>(
            keys: (keyof T1)[],
        ): Unary<T1, Partial<T1>>
    } = Curry((props, obj) => {
        const newObj = {};
        const objCopy = DeepCopy(obj);
        props.forEach(p => newObj[p] = objCopy[p]);

        return newObj;
    });

    export const Exclude: {
        <T1 extends DataObject>(
            keys: (keyof T1)[],
            obj: T1
        ): Partial<T1>

        <T1 extends DataObject>(
            keys: (keyof T1)[],
        ): Unary<T1, Partial<T1>>
    } = Curry((propsToExclude, obj) => {
        const allProps = Keys(obj);
        const props = allProps.filter(p => !propsToExclude.includes(p));
        return Pick(props, obj);
    });
    
    export const Flatten: {
        <T extends DataObject>(o: T): DataObject & T
    } = (o) => {
        const allSimpen: [string, any][] = [];

        Entries(o).forEach(([k, v]) => {
            if(v && typeof v === 'object') {
                const simpleobj = Flatten(v);
                const simpen = Entries(simpleobj)
                    .map(([innerKey, v]) => [`${k}.${innerKey}`, v] as [string, any]);
                allSimpen.push(...simpen);
            } else {
                allSimpen.push([k, v]);
            }
        });
        
        const obj = FromEntries(allSimpen);
        return obj as any;
    };

    export const FocusOn: {
        <T extends DataObject, R>(
            k: (keyof T | string)[],
            o: T,
        ): R

        <T extends DataObject, R>(
            k: (keyof T | string)[],
        ): Unary<T, R>
    } = Curry((ks, o) => {
        let res = o;
        for(let k of ks) {
            res = res?.[k] ?? null;
        }

        return When(IsOfType("object"), DeepCopy, res);
    });

    export const Put: {
        <T>(
            path: (keyof T | string)[],
            value: any,
            obj: T,
        ): T

        <T>(
            path: (keyof T | string)[],
            value: any,
        ): Unary<T, T>

        <T>(
            path: (keyof T | string)[],
        ): Binary<any, T, T>
    } = Curry((p, v, o) => {
        const type = TypeOf(o);
        if(type !== "object") {
            throw Error(`Invalid input to Put: type must be "object", not ${type}`);
        }
        const obj = DeepCopy(o);
        let currentObj = obj;
        const props = p.slice(0, -1);
        const prop = p[p.length - 1]; 

        for(let p of props) {
            currentObj = InCase([
                [IsOfType('object'), Identity],
                [TRUE, (_) => (currentObj[p] = {}, currentObj[p])],
            ], currentObj?.[p]);
        }
        currentObj[prop] = v;
        return obj;
    });
}
