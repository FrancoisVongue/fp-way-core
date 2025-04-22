import { DataObject, Unary } from "../core.types";

export namespace FormTypes {
  export type Form<T1 extends DataObject> = {
    definition: {
      [P in keyof T1]: PropertyForm<T1, P>
    },
    options: Options<T1>,
    name: string;
  };

  export type PropertyForm<T1 extends DataObject, P extends keyof T1> =
    | { form: Form<Required<T1>[P]> }
    | { rules: PropertyRule<Required<T1>, P>[], isOptional?: boolean, alias?: string }

  export type PropertyRule<T1 extends DataObject, P extends keyof T1> = {
    validator: (v: T1[P], k: P, o: T1) => boolean;
    message: 
      | ((v: T1[P], k: P, o: T1, rule: Omit<PropertyRule<T1, P>, 'validator' | 'message'>) => string)
      | string

    name: string;
  }

  export type ValidationSummary<T1 extends DataObject> = {
    valid: boolean,
    errorCount: number,
    missingProperties: string[],
    redundantProperties: string[],
    errors: {
      keys: Partial<Record<keyof T1, string | ValidationSummary<T1[keyof T1]>>>
      root: string | null
      main: string | null // main error message
    } 
  }

  export type ValidationError<T1 extends DataObject = any> = {
    key: Exclude<keyof T1, symbol>,
    value: any,
    ruleName: string,
    message: Error
  }

  export type Options<T extends DataObject> = {
    earlyStop?: boolean,
    validationErrorHandler?: (e: ValidationError<T>) => string,
    noRedundantProperties?: boolean,
    isOptional?: boolean
  }
  export type PopulatedOptions<T1 extends DataObject> = Required<Options<T1>>;

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


  export type PreValidationResult<T1 extends DataObject> = {
    missing: (keyof T1)[],
    propsToCheck: (keyof T1)[],
    redundant: string[],
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
}

// add:
// - ability to specify "or" or "and" operator on list of rules
// - create function that will create spec from object, giving it a descriptive name to use instead of _self
// - give rules a name that will be used in error messages
// - 
