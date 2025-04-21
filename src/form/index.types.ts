import { DataObject, Unary } from "../core.types";

export namespace FormTypes {
  export type ValidationSummary<T1 extends DataObject> = {
    valid: boolean,
    errorCount: number,
    missingProperties: string[],
    redundantProperties: string[],
    errors: Record<keyof T1 | '_self', string[]>
  }

  export type ValidationError<T1 extends DataObject = any> = {
    key: Exclude<keyof T1, symbol>,
    value: T1[keyof T1],
    ruleIndex: number,
    error: Error
  }

  export type PopulatedOptions<T1 extends DataObject> = Required<Options<T1>>;

  export type PropertyRule<T1, P extends keyof T1> = [
    (v: T1[P], k: P, o: T1) => boolean,
    (v: T1[P], k: P, o: T1) => string
  ];

  export type Form<T1 extends DataObject> = {
    [P in keyof T1]:
    | Form<Required<T1>[P]>
    | PropertyRule<Required<T1>, P>[]
  } & { [OptionsKey]?: Options<T1> };

  export type Options<T extends DataObject> = {
    earlyStop?: boolean,
    errorHandler?: (e: ValidationError<T>) => string,
    noRedundantProperties?: boolean,
    optionalProps?: (keyof T)[],
    isOptional?: boolean
  }

  // export type ExtentionSpec<T1 extends DataObject, T2 extends DataObject> =
  //   & { [ValidationOptionsSym]: ExtentionOptions<T1, T2> }
  //   & Pick<
  //     Form<T2>,
  //     Exclude<keyof T2, keyof T1>
  //   >
  //   & Partial<Pick<
  //     Form<T2>,
  //     Extract<keyof T2, keyof T1>
  //   >>

  // export type ExtentionOptions<T1 extends DataObject, T2 extends DataObject> = {
  //   omitKeys: (keyof T1)[],
  //   optionalProps: (keyof T2)[],
  // } & Options<T2>


  export type _CheckPropsResult = {
    missing: string[],
    redundant: string[],
    propsToCheck: string[],
  }

  export interface Validate {
    <T1 extends DataObject>(
      spec: Form<T1>,
      o: T1
    ): ValidationSummary<T1>

    <T1 extends DataObject>(
      o: T1
    ): Unary<Form<T1>, ValidationSummary<T1>>
  }

  export const OptionsKey: '$options' = '$options';
}

// add:
// - async validation (with option to specify parallellization of requests)
// - ability to specify "or" or "and" operator on list of rules
// - create function that will create spec from object, giving it a descriptive name to use instead of _self
// - give rules a name that will be used in error messages
// - 
