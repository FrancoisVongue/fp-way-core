import { Curry, Exists, IsOfType } from "../core";
import { DataObject } from "../core.types";
import { obj } from "../obj";
import { FormTypes } from "./index.types";

export namespace Form {
  namespace ValidationSummary {
    export const incErrCount = (s: FormTypes.ValidationSummary<any>) => {
      s.errorCount++
      s.valid = false
    }
    export const addErr = (k: string, msg: string, summary: FormTypes.ValidationSummary<any>) => {
      if (!summary.errors.keys[k]) {
        summary.errors.keys[k] = msg;
        incErrCount(summary);
      }
    }
    export const New = <T1 extends DataObject>(): FormTypes.ValidationSummary<T1> => {
      return {
        valid: true,
        errorCount: 0,
        missingProperties: [],
        redundantProperties: [],
        errors: {
          keys: {},
          root: null,
          main: null
        }
      }
    }
    export const mergeNestedSummary = (
      summary: FormTypes.ValidationSummary<any>,
      key: string,
      nestedSummary: FormTypes.ValidationSummary<any>,
    ) => {
      if (!nestedSummary.valid) {
        summary.valid = false;
        summary.errorCount += nestedSummary.errorCount;
        summary.errors.keys[key] = nestedSummary;
      }
    }
  }

  const DEFAULT_VALIDATION_OPTIONS: FormTypes.PopulatedOptions<any> = {
    noRedundantProperties: true,
    earlyStop: false,
    validationErrorHandler: ({ key, value, ruleName, message }) =>
      `Error while validating property "${key}" with rule "${ruleName}": ${message}`,
    isOptional: false
  }

  export const _preCheckProps = <T1 extends DataObject>(
    form: FormTypes.Form<T1>,
    o: T1
  ): FormTypes.PreValidationResult<T1> => {
    const requiredProps = Object.entries(form.definition)
      .filter(([_, v]) => !v.isOptional)
      .map(([k]) => k);

    const presentProps = obj.Keys(o)
      .filter(k => Exists(o[k]));

    const missingRequiredProps = requiredProps.filter(r => !presentProps.includes(r));
    const redundantProps = presentProps.filter(p => !form.definition[p]);
    const propsToCheck = presentProps.filter(p => form.definition[p]);

    return {
      missing: missingRequiredProps as (keyof T1)[],
      propsToCheck: propsToCheck as (keyof T1)[],
      redundant: redundantProps,
    }
  }

  export const Validate: FormTypes.Validate = Curry((spec: FormTypes.Form<any>, o) => {
    const summary: FormTypes.ValidationSummary<any> = ValidationSummary.New();
    if (!IsOfType("object", o)) {
      if (spec?.options?.isOptional && !Exists(o)) {
        return summary;
      }
      summary.errors.root = `Value must be an object, not ${typeof o}`;
      ValidationSummary.incErrCount(summary);
      return summary;
    }

    const options: FormTypes.PopulatedOptions<any> = obj.WithDefault(
      DEFAULT_VALIDATION_OPTIONS as any,
      spec.options ?? {}
    );

    const { propsToCheck, missing, redundant } = _preCheckProps(spec, o);

    if (missing.length) {
      ValidationSummary.incErrCount(summary);
      summary.missingProperties = missing as string[];
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
      const keySpec = spec.definition[ptc as any];
      const value = o[ptc];

      if ('rules' in keySpec) {
        for (const rule of keySpec.rules) {
          try {
            const ruleSuccess = rule.validator(value, ptc as string, o);
            if (!ruleSuccess) {
              const message = typeof rule.message === 'function'
                ? rule.message(value, ptc as string, o, obj.Pick(['name'], rule))
                : rule.message;
              ValidationSummary.addErr(ptc as string, message, summary);
            }
          } catch (e) {
            const message = options.validationErrorHandler({
              key: ptc as string,
              value,
              ruleName: rule.name,
              message: e as Error
            });
            ValidationSummary.addErr(ptc as string, message, summary);
          }
        }
      } else if ('form' in keySpec) {
        const nestedSummary = Validate(keySpec.form, value);
        ValidationSummary.mergeNestedSummary(summary, ptc as string, nestedSummary);
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
  //     ext_spec || {},
  //     parent_spec?.[ValidationOptionsSym] || {}
  //   );

  //   new_options?.['omitKeys']?.forEach(k => delete new_spec[k])
  //   delete new_options['omitKeys']

  //   new_spec[ValidationOptionsSym] = new_options;
  //   return new_spec;
  // })
}