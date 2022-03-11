import { Identity } from "..";
import { Curry, Exists, InCase, IsEither, IsOfType, Not, NotExists, Pipe, Return, Swap, TRUE } from "../core";
import { DataObject, DeepPartial, Unary } from "../core.types";

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
                [([defv, v]) => [defv, v].every(IsOfType("object")), ([n, o]) => WithDefault(n, o)],
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
        const SeparateEntires = o => {
            const objSimpleEntries: [keyof DataObject, any][] = [];
            const objObjEntries: [keyof DataObject, any][] = [];

            Entries(o).forEach(([k, v]) => {
                if(v && typeof v === 'object') {
                    objObjEntries.push([k, v]);
                } else {
                    objSimpleEntries.push([k, v]);
                }
            });
            
            return [objSimpleEntries, objObjEntries];
        };
        
        const [obsimen, obcomen] = SeparateEntires(o);
        
        obcomen.forEach(([k, v]) => {
            const flatv = Flatten(v);
            const newObsimen = Entries(flatv)
                .map(([newKey, v]) => [`${k}.${newKey}`, v] as [string, any]);
            obsimen.push(...newObsimen);
        });
        
        const obj = FromEntries<any>(obsimen);
        return obj;
    };
};
