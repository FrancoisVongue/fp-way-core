import { Curry, Exists, IsOfType, TypeOf } from "../core";
import { DataObject } from "../core.types";
import { obj } from "../obj";
import { Union } from "../union";
import { FormTypes } from "./index.types";

// private namespace for validation summary
namespace _ValidationSummary {
  export const incErrCount = (s: FormTypes.ValidationSummary<any>) => {
    s.errorCount++
    s.valid = false
  }
  export const addErr = (k: string, msg: string, summary: FormTypes.ValidationSummary<any>) => {
    if (!summary.errors.keys[k]) {
      summary.errors.keys[k] = { string: msg };
      incErrCount(summary);
    }
  }
  export const New = <T1 extends DataObject>(): FormTypes.ValidationSummary<T1> => {
    return {
      valid: true,
      errorCount: 0,
      errors: {
        keys: {},
        missingProperties: [],
        redundantProperties: [],
        root: null,
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
      summary.errors.keys[key] = { nestedSummary: nestedSummary };
    }
  }
}

export namespace ValidationSummary {
  export const getErrorMessages = <T extends DataObject>(
    summary: FormTypes.ValidationSummary<T>
  ): string[] => {
    if (summary.valid) return [];

    const messages: string[] = [];

    // Root level errors (e.g., "Value must be an object")
    if (summary.errors.root) {
      return [summary.errors.root];
    }

    // Missing required properties
    if (summary.errors.missingProperties.length > 0) {
      const fields = summary.errors.missingProperties.join(', ');
      messages.push(`Missing required fields: ${fields}`);
    }

    // Redundant properties
    if (summary.errors.redundantProperties.length > 0) {
      const fields = summary.errors.redundantProperties.join(', ');
      messages.push(`Unexpected fields: ${fields}`);
    }

    // Field-specific errors
    const moreMessages = Object.keys(summary.errors.keys).map((key) => {
      const error = summary.errors.keys[key];
      if (!error) return;

      const message = Union.match<FormTypes.ValidationKeyError<T[keyof T]>, string | undefined>({
        string: (msg) => `${key}: ${msg}`,
        nestedSummary: (nestedSummary) => {
          const nestedMessage = getErrorMessages(nestedSummary);
          if (nestedMessage) {
            return `${key}: ${nestedMessage}`;
          }
        }
      }, error);

      return message;
    }).filter(Exists);

    return [...messages, ...moreMessages];
  };

  export const getErrorsFlat = <T extends DataObject>(
    summary: FormTypes.ValidationSummary<T>,
    prefix: string = ''
  ): Record<string, string> => {
    if (summary.valid) return {};

    const errors: Record<string, string> = {};

    if (summary.errors.root) {
      errors['_root'] = summary.errors.root;
      return errors;
    }

    summary.errors.missingProperties.forEach(field => {
      const key = prefix ? `${prefix}.${field}` : field;
      errors[key] = 'This field is required';
    });

    summary.errors.redundantProperties.forEach(field => {
      const key = prefix ? `${prefix}.${field}` : field;
      errors[key] = 'This field is not allowed';
    });

    Object.entries(summary.errors.keys).forEach(([key, error]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (!error) return;

      Union.match<FormTypes.ValidationKeyError<T[keyof T]>, void>({
        string: (msg) => {
          errors[fullKey] = msg;
        },
        nestedSummary: (nestedSummary) => {
          const nestedErrors = getErrorsFlat(nestedSummary, fullKey);
          Object.assign(errors, nestedErrors);
        }
      }, error);
    });

    return errors;
  };

  export const getFieldErrors = <T extends DataObject>(
    summary: FormTypes.ValidationSummary<T>,
    fieldPath: keyof T
  ): string[] => {
    const errors = getErrorsFlat(summary);
    const keys = Object.keys(errors).filter(k => k.startsWith(fieldPath as string));
    return keys.map(k => errors[k] as string);
  };

  export const hasFieldError = <T extends DataObject>(
    summary: FormTypes.ValidationSummary<T>,
    fieldPath: string
  ): boolean => {
    return getFieldErrors(summary, fieldPath).length > 0;
  };

  export const hasMissingFields = <T extends DataObject>(
    summary: FormTypes.ValidationSummary<T>
  ): boolean => {
    return summary.errors.missingProperties.length > 0;
  };

  export const getFirstError = <T extends DataObject>(
    summary: FormTypes.ValidationSummary<T>
  ): string | null => {
    const messages = getErrorMessages(summary);
    return messages[0] ?? null;
  };
}

export namespace Form {

  const DEFAULT_VALIDATION_OPTIONS: FormTypes.PopulatedOptions<any> = {
    noRedundantProperties: true,
    earlyStop: true,
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
    const summary: FormTypes.ValidationSummary<any> = _ValidationSummary.New();
    if (!IsOfType("object", o)) {
      if (spec?.options?.isOptional && !Exists(o)) {
        return summary;
      }
      summary.errors.root = `Value must be an object, not ${TypeOf(o)}`;
      _ValidationSummary.incErrCount(summary);
      return summary;
    }

    const options: FormTypes.PopulatedOptions<any> = obj.WithDefault(
      DEFAULT_VALIDATION_OPTIONS as any,
      spec.options ?? {}
    );

    const { propsToCheck, missing, redundant } = _preCheckProps(spec, o);

    if (missing.length) {
      _ValidationSummary.incErrCount(summary);
      summary.errors.missingProperties = missing as string[];
    }
    if (redundant.length) {
      summary.errors.redundantProperties = redundant;
      if (options.noRedundantProperties) {
        _ValidationSummary.incErrCount(summary);
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
                ? rule.message(value, ptc as string, o, obj.Omit(['message', 'validator'], rule))
                : rule.message;
              _ValidationSummary.addErr(ptc as string, message, summary);
            }
          } catch (e) {
            const message = options.validationErrorHandler({
              key: ptc as string,
              value,
              ruleName: rule.name,
              message: e as Error
            });
            _ValidationSummary.addErr(ptc as string, message, summary);
          }
        }
      } else if ('form' in keySpec) {
        const nestedSummary = Validate(keySpec.form, value);
        _ValidationSummary.mergeNestedSummary(summary, ptc as string, nestedSummary);
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