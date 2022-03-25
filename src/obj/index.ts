import {Curry, Exists, InCase, IsOfType, Pipe, Swap, TRUE, Identity, When, TypeOf} from "../core";
import {Binary, DataObject, DeepPartial, DeepRequired, Unary} from "../core.types";
import {Focus, OptionalPath, Path} from "./index.types";

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
            def: T,
            obj: DeepPartial<T>
        ): T

        <T extends DataObject>(
            def: T
        ): Unary<DeepPartial<T>, T>
    } = Curry((def, obj) => {
        const objCopy = DeepCopy(obj);
        const defCopy = DeepCopy(def);
        const allProps = [...new Set([...Keys(objCopy), ...Keys(defCopy)])];

        for(const key of allProps) {
            objCopy[key] = InCase([
                [   // if both are objects, merge them again
                    (both) => both.every(IsOfType("object")),
                    ([def, o]) => WithDefault(def, o)],
                [([_, v]) => Exists(v), ([_, v]) => v],// if not, and obj has value, simply replace
                [TRUE, ([defv, _]) => defv],          // if there's no value, return default
            ], [defCopy[key], objCopy[key]])
        }

        return objCopy;
    });

    export const Impose: {
        <T extends DataObject>(
            obj: DeepPartial<T>,
            def: T
        ): T

        <T extends DataObject>(
            obj: DeepPartial<T>,
        ): Unary<T, T>
    } = Swap(WithDefault);

    export const Pick: {
        <T1 extends DataObject, KS extends keyof T1>(
            keys: KS[], 
            obj: T1
        ): Pick<T1, KS>

        <T1 extends DataObject, KS extends keyof T1>(
            keys: KS[], 
        ): Unary<T1, Pick<T1, KS>>
    } = Curry((props, obj) => {
        const newObj = {};
        const objCopy = DeepCopy(obj);
        props.forEach(p => newObj[p] = objCopy[p]);

        return newObj;
    });

    export const Exclude: {
        <T1 extends DataObject, KS extends keyof T1>(
            keys: KS[], 
            obj: T1
        ): Omit<T1, KS>

        <T1 extends DataObject, KS extends keyof T1>(
            keys: KS[], 
        ): Unary<T1, Omit<T1, KS>>
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

    export const Get: {
        <T extends DataObject, P extends OptionalPath<T>>(
            k: P,
            o: T,
        ): Focus<T, P>

        <T extends DataObject, P extends OptionalPath<T>>(
            k: P,
        ): Unary<T, Focus<T, P>>
    } = Curry((ks, o) => {
        for(let k of ks) { o = o?.[k] }
        return DeepCopy(o);
    }) as any;

    export const Put: {
        <T extends DataObject, P extends OptionalPath<T>>(
            k: P,
            v: Focus<T, P>,
            o: T,
        ): T

        <T extends DataObject, P extends OptionalPath<T>>(
            v: Focus<T, P>,
            o: T,
        ): Unary<P, T>

        <T extends DataObject, P extends OptionalPath<T>>(
            o: T,
        ): Binary<Focus<T, P>, P, T>
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
            currentObj = IsOfType('object', currentObj?.[p])
                ? currentObj[p]
                : (currentObj[p] = {}, currentObj[p])
        }
        currentObj[prop] = v;
        return obj;
    });
}
