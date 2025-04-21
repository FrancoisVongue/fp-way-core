import { Curry, Exists, IsOfType } from "../core";
import { DataObject, Unary } from "../core.types";
import { obj } from "../obj";
import { FormTypes } from "./index.types";

const OptionsKey = FormTypes.OptionsKey;

export namespace Form {
  namespace ValidationSummary {
    export const incErrCount = (s: FormTypes.ValidationSummary<any>) => {
      s.errorCount++
      s.valid = false
    }
    export const addErr = (k: string, msg: string, summary: FormTypes.ValidationSummary<any>) => {
      if (IsOfType('array', summary.errors[k])) {
        (summary.errors[k]).push(msg);
      } else {
        summary.errors[k] = [msg];
        incErrCount(summary);
      }
    }
    export const New = <T1 extends DataObject>(): FormTypes.ValidationSummary<T1> => {
      return {
        valid: true,
        errorCount: 0,
        missingProperties: [],
        redundantProperties: [],
        errors: {} as Record<keyof T1 | '_self', string[]>
      }
    }
    export const mergeNestedSummary = (
      summary: FormTypes.ValidationSummary<any>,
      key: string,
      nestedSummary: FormTypes.ValidationSummary<any>,
    ) => {
      const prependKey = (v: string) => `${key}.${v}`

      summary.valid = nestedSummary.valid && summary.valid;
      summary.errorCount += nestedSummary.errorCount;
      summary.missingProperties.push(...nestedSummary.missingProperties.map(prependKey));
      summary.redundantProperties.push(...nestedSummary.redundantProperties.map(prependKey));

      const nestedErrors: [any, any][] = obj.Entries(nestedSummary.errors)
        .map(([nestedKey, v]) => [prependKey(nestedKey), v])

      summary.errors = obj.FromEntries([
        ...obj.Entries(summary.errors),
        ...nestedErrors
      ])
    }
  }

  const DEFAULT_VALIDATION_OPTIONS: FormTypes.PopulatedOptions<any> = {
    optionalProps: [],
    noRedundantProperties: true,
    earlyStop: false,
    errorHandler: ({ key, ruleIndex }) => `Error while validating property "${key}" at rule index ${ruleIndex}`,
    isOptional: false
  }

  export const _preCheckProps = <T1 extends DataObject>(
    declaredPropsToCheck: string[],
    options: FormTypes.PopulatedOptions<any>,
    o: T1
  ): FormTypes._CheckPropsResult => {
    const optionalProps = options.optionalProps;
    const requiredProps = declaredPropsToCheck.filter(d => !optionalProps.includes(d));

    const presentProps = obj.Entries(o)
      .filter(([k, v]) => Exists(v))
      .map(([k, v]) => k);

    const missingRequiredProps = requiredProps.filter(r => !presentProps.includes(r));
    const redundantProps = presentProps.filter(p => !declaredPropsToCheck.includes(p));
    const propsToCheck = presentProps.filter(p => declaredPropsToCheck.includes(p));

    return {
      missing: missingRequiredProps,
      propsToCheck: propsToCheck,
      redundant: redundantProps,
    }
  }

  export const Validate: FormTypes.Validate = Curry((spec, o) => {
    const summary: FormTypes.ValidationSummary<any> = ValidationSummary.New();
    if (!IsOfType("object", o)) {
      if (spec?.[OptionsKey]?.isOptional && !Exists(o)) {
        return summary;
      }
      ValidationSummary.addErr('_self', 'Value must be an object', summary)
    }

    const options: FormTypes.PopulatedOptions<any> = obj.WithDefault(
      DEFAULT_VALIDATION_OPTIONS as any,
      spec[OptionsKey] ?? {}
    );

    const { propsToCheck, missing, redundant } =
      _preCheckProps(obj.Keys(spec), options, o);

    if (missing.length) {
      ValidationSummary.incErrCount(summary);
      summary.missingProperties = missing;
    }
    if (redundant.length) {
      summary.redundantProperties = redundant;
      if (options.noRedundantProperties) {
        ValidationSummary.incErrCount(summary);
      }
    }

    for (let i = 0; i < propsToCheck.length; i++) {
      if (options.earlyStop && !summary.valid) { return summary; }

      const ptc = propsToCheck[i];
      const keySpec = spec[ptc];
      const value = o[ptc];

      if (IsOfType('array', keySpec)) {
        for (const rule of keySpec as FormTypes.PropertyRule<any, any>[]) {
          const [validator, msgFactory] = rule;

          try {
            const rulePass = validator(value, ptc, o);
            if (!rulePass) {
              const message: string = msgFactory(value, ptc, o);
              ValidationSummary.addErr(ptc, message, summary);
            }
          } catch (e) {
            const message = options.errorHandler({ key: ptc, value, ruleIndex: i, error: e })
            ValidationSummary.addErr(ptc, message, summary)
          }
        }
      } else {
        const nestedSummary = Validate(keySpec as FormTypes.Form<any>, value)
        ValidationSummary.mergeNestedSummary(summary, ptc, nestedSummary)
      }
    }

    return summary;
  })

  // export const Extend: {
  //   <T1 extends DataObject, T2 extends DataObject>(
  //     extention_spec: FormTypes.ExtentionSpec<T1, T2>,
  //     parent_spec: FormTypes.ValidationSpec<T1>
  //   ): FormTypes.ValidationSpec<T2>

  //   <T1 extends DataObject, T2 extends DataObject>(
  //     extention_spec: FormTypes.ExtentionSpec<T1, T2>,
  //   ): Unary<FormTypes.ValidationSpec<T1>, FormTypes.ValidationSpec<T2>>
  // } = Curry((
  //   ext_spec: FormTypes.ExtentionSpec<any, any>,
  //   parent_spec: FormTypes.ValidationSpec<any>
  // ) => {
  //   const new_spec = obj.Impose(ext_spec, parent_spec);
  //   const new_options = obj.Impose(
  //     ext_spec[ValidationOptionsSym] || {},
  //     parent_spec?.[ValidationOptionsSym] || {}
  //   );

  //   new_options?.['omitKeys']?.forEach(k => delete new_spec[k])
  //   delete new_options['omitKeys']

  //   new_spec[ValidationOptionsSym] = new_options;
  //   return new_spec;
  // })
}