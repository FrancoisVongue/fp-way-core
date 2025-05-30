import { Form, ValidationSummary } from "./index";
import { FormTypes } from "./index.types";
import { Exists } from "../core";
import { DataObject } from "../core.types";

describe('Form', () => {
  describe('Validate', () => {
    it('Should validate a simple object with basic rules', () => {
      // Define a simple form for a user
      type User = { name: string, age: number };

      const userForm: FormTypes.Form<User> = {
        name: 'userForm',
        definition: {
          name: {
            rules: [
              {
                name: 'required',
                validator: (v: string) => typeof v === 'string' && v.length > 0,
                message: 'Name is required'
              }
            ]
          },
          age: {
            rules: [
              {
                name: 'isNumber',
                validator: (v: number) => typeof v === 'number',
                message: 'Age must be a number'
              },
              {
                name: 'isAdult',
                validator: (v: number) => v >= 18,
                message: 'Must be at least 18 years old'
              }
            ]
          }
        },
        options: {
          noRedundantProperties: true
        }
      };

      // Valid object
      const validUser = { name: 'John', age: 25 };
      const validResult = Form.Validate(userForm as any, validUser);
      expect(validResult.valid).toBe(true);
      expect(validResult.errorCount).toBe(0);

      // Invalid object - missing name
      const noNameUser = { age: 25 } as User;
      const noNameResult = Form.Validate(userForm as any, noNameUser);
      expect(noNameResult.valid).toBe(false);
      expect(noNameResult.errors.missingProperties).toContain('name');

      // Invalid object - underage
      const underageUser = { name: 'John', age: 16 };
      const underageResult = Form.Validate(userForm as any, underageUser);
      expect(underageResult.valid).toBe(false);
      expect(underageResult.errorCount).toBeGreaterThan(0);
    });

    it('Should handle optional properties correctly', () => {
      type Profile = { name: string, bio?: string };

      const profileForm: FormTypes.Form<Profile> = {
        name: 'profileForm',
        definition: {
          name: {
            rules: [
              {
                name: 'required',
                validator: (v: string) => typeof v === 'string' && v.length > 0,
                message: 'Name is required'
              }
            ]
          },
          bio: {
            rules: [
              {
                name: 'isString',
                validator: (v: string) => typeof v === 'string',
                message: 'Bio must be a string'
              }
            ],
            isOptional: true
          }
        },
        options: {}
      };

      // Valid with optional property
      const fullProfile = { name: 'Jane', bio: 'Software developer' };
      const fullResult = Form.Validate(profileForm as any, fullProfile);
      expect(fullResult.valid).toBe(true);

      // Valid without optional property
      const minimalProfile = { name: 'Jane' };
      const minimalResult = Form.Validate(profileForm as any, minimalProfile);
      expect(minimalResult.valid).toBe(true);
      expect(minimalResult.errors.missingProperties.length).toBe(0);
    });

    it('Should validate nested objects', () => {
      // Define types
      type Address = { street: string, city: string };
      type Customer = { name: string, address: Address };

      // Define a form for the nested address
      const addressForm: FormTypes.Form<Address> = {
        name: 'addressForm',
        definition: {
          street: {
            rules: [
              {
                name: 'required',
                validator: (v: string) => typeof v === 'string' && v.length > 0,
                message: 'Street is required'
              }
            ]
          },
          city: {
            rules: [
              {
                name: 'required',
                validator: (v: string) => typeof v === 'string' && v.length > 0,
                message: 'City is required'
              }
            ]
          }
        },
        options: {}
      };

      // Define a customer form with a nested address
      const customerForm: FormTypes.Form<Customer> = {
        name: 'customerForm',
        definition: {
          name: {
            rules: [
              {
                name: 'required',
                validator: (v: string) => typeof v === 'string' && v.length > 0,
                message: 'Name is required'
              }
            ]
          },
          address: {
            form: addressForm
          }
        },
        options: {}
      };

      // Valid customer with address
      const validCustomer: Customer = {
        name: 'Alice',
        address: {
          street: '123 Main St',
          city: 'Springfield'
        }
      };
      const validResult = Form.Validate(customerForm, validCustomer);
      expect(validResult.valid).toBe(true);

      // Invalid customer with incomplete address
      const invalidCustomer = {
        name: 'Bob',
        address: {
          street: '456 Oak Ave'
          // Missing city
        }
      } as Customer;
      const invalidResult = Form.Validate(customerForm, invalidCustomer);
      expect(invalidResult.valid).toBe(false);
    });

    it('Should detect redundant properties when configured', () => {
      type SimpleObj = { name: string };

      const strictForm: FormTypes.Form<SimpleObj> = {
        name: 'strictForm',
        definition: {
          name: {
            rules: [
              {
                name: 'required',
                validator: (v: string) => typeof v === 'string',
                message: 'Name is required'
              }
            ]
          }
        },
        options: {
          noRedundantProperties: true
        }
      };

      // Valid object
      const validObj = { name: 'John' };
      const validResult = Form.Validate(strictForm as any, validObj);
      expect(validResult.valid).toBe(true);

      // Object with extra property
      const redundantObj = { name: 'John', age: 30 };
      const redundantResult = Form.Validate(strictForm as any, redundantObj as any);
      expect(redundantResult.valid).toBe(false);
      expect(redundantResult.errors.redundantProperties).toContain('age');
    });

    it('Should correctly handle non-object values', () => {
      type NameObj = { name: string };

      const simpleForm: FormTypes.Form<NameObj> = {
        name: 'simpleForm',
        definition: {
          name: {
            rules: [
              {
                name: 'required',
                validator: (v: string) => Exists(v),
                message: 'Name is required'
              }
            ]
          }
        },
        options: {}
      };

      const nullResult = Form.Validate(simpleForm as any, null as any);
      expect(nullResult.valid).toBe(false);
      expect(nullResult.errors.root).toContain('object');

      const numberResult = Form.Validate(simpleForm as any, 42 as any);
      expect(numberResult.valid).toBe(false);
      expect(numberResult.errors.root).toContain('number');
    });
  });

  describe('_preCheckProps', () => {
    it('Should correctly identify missing, redundant, and valid properties', () => {
      type TestObj = { required: string, optional?: string };

      const testForm: FormTypes.Form<TestObj> = {
        name: 'testForm',
        definition: {
          required: {
            rules: [
              {
                name: 'required',
                validator: (v: string) => Exists(v),
                message: 'This field is required'
              }
            ]
          },
          optional: {
            rules: [
              {
                name: 'isString',
                validator: (v: string) => typeof v === 'string',
                message: 'Must be a string'
              }
            ],
            isOptional: true
          }
        },
        options: {}
      };

      // Test with missing required property
      const emptyObj = {} as TestObj;
      const emptyResult = Form._preCheckProps(testForm, emptyObj);
      expect(emptyResult.missing).toContain('required');
      expect(emptyResult.propsToCheck.length).toBe(0);

      // Test with all properties
      const fullObj = { required: 'value', optional: 'value', extra: 'value' } as TestObj & { extra: string };
      const fullResult = Form._preCheckProps(testForm, fullObj);
      expect(fullResult.missing.length).toBe(0);
      expect(fullResult.redundant).toContain('extra');
      expect(fullResult.propsToCheck).toContain('required');
      expect(fullResult.propsToCheck).toContain('optional');
    });
  });

  describe('Form - Additional Tests', () => {
    describe('Complex Validation Scenarios', () => {
      it('Should handle deeply nested objects with multiple levels', () => {
        type Country = { name: string, code: string };
        type City = { name: string, population: number };
        type Address = { street: string, city: City, country: Country };
        type Company = { name: string, address: Address };

        const countryForm: FormTypes.Form<Country> = {
          name: 'countryForm',
          definition: {
            name: {
              rules: [{
                name: 'required',
                validator: (v) => typeof v === 'string' && v.length > 0,
                message: 'Country name is required'
              }]
            },
            code: {
              rules: [{
                name: 'countryCode',
                validator: (v) => typeof v === 'string' && v.length === 2,
                message: 'Country code must be 2 characters'
              }]
            }
          },
          options: {}
        };

        const cityForm: FormTypes.Form<City> = {
          name: 'cityForm',
          definition: {
            name: {
              rules: [{
                name: 'required',
                validator: (v) => typeof v === 'string' && v.length > 0,
                message: 'City name is required'
              }]
            },
            population: {
              rules: [{
                name: 'positive',
                validator: (v) => typeof v === 'number' && v > 0,
                message: 'Population must be positive'
              }]
            }
          },
          options: {}
        };

        const addressForm: FormTypes.Form<Address> = {
          name: 'addressForm',
          definition: {
            street: {
              rules: [{
                name: 'required',
                validator: (v) => typeof v === 'string' && v.length > 0,
                message: 'Street is required'
              }]
            },
            city: { form: cityForm },
            country: { form: countryForm }
          },
          options: { noRedundantProperties: true }
        };

        const companyForm: FormTypes.Form<Company> = {
          name: 'companyForm',
          definition: {
            name: {
              rules: [{
                name: 'required',
                validator: (v) => typeof v === 'string' && v.length > 0,
                message: 'Company name is required'
              }]
            },
            address: { form: addressForm }
          },
          options: {}
        };

        // Valid deeply nested object
        const validCompany: Company = {
          name: 'TechCorp',
          address: {
            street: '123 Innovation Drive',
            city: { name: 'San Francisco', population: 873965 },
            country: { name: 'United States', code: 'US' }
          }
        };
        const validResult = Form.Validate(companyForm, validCompany);
        expect(validResult.valid).toBe(true);
        expect(validResult.errorCount).toBe(0);

        // Invalid at multiple levels
        const invalidCompany = {
          name: 'TechCorp',
          address: {
            street: '',  // Empty street
            city: { name: 'San Francisco', population: -100 },  // Negative population
            country: { name: 'United States', code: 'USA' }  // 3-char code
          }
        };
        const invalidResult = Form.Validate(companyForm, invalidCompany);
        expect(invalidResult.valid).toBe(false);
        expect(invalidResult.errorCount).toBeGreaterThan(0);
      });

      it('Should handle cross-field validation with access to parent object', () => {
        type DateRange = {
          startDate: Date;
          endDate: Date;
          includeWeekends: boolean;
        };

        const dateRangeForm: FormTypes.Form<DateRange> = {
          name: 'dateRangeForm',
          definition: {
            startDate: {
              rules: [{
                name: 'isDate',
                validator: (v) => v instanceof Date && !isNaN(v.getTime()),
                message: 'Must be a valid date'
              }]
            },
            endDate: {
              rules: [
                {
                  name: 'isDate',
                  validator: (v) => v instanceof Date && !isNaN(v.getTime()),
                  message: 'Must be a valid date'
                },
                {
                  name: 'afterStartDate',
                  validator: (v, k, obj) => v > obj.startDate,
                  message: 'End date must be after start date'
                },
                {
                  name: 'weekdayIfRequired',
                  validator: (v, k, obj) => {
                    if (!obj.includeWeekends) {
                      const day = v.getDay();
                      return day !== 0 && day !== 6; // Not Sunday or Saturday
                    }
                    return true;
                  },
                  message: 'End date must be a weekday when weekends are excluded'
                }
              ]
            },
            includeWeekends: {
              rules: [{
                name: 'isBoolean',
                validator: (v) => typeof v === 'boolean',
                message: 'Must be a boolean'
              }]
            }
          },
          options: {}
        };

        // Valid range
        const validRange: DateRange = {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-15'),
          includeWeekends: true
        };
        const validResult = Form.Validate(dateRangeForm, validRange);
        expect(validResult.valid).toBe(true);

        // Invalid - end before start
        const invalidRange1: DateRange = {
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-01'),
          includeWeekends: true
        };
        const invalidResult1 = Form.Validate(dateRangeForm, invalidRange1);
        expect(invalidResult1.valid).toBe(false);
        expect(invalidResult1.errors.keys.endDate).toBeDefined();

        // Invalid - weekend end date when not allowed
        const invalidRange2: DateRange = {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-06'), // Saturday
          includeWeekends: false
        };
        const invalidResult2 = Form.Validate(dateRangeForm, invalidRange2);
        expect(invalidResult2.valid).toBe(false);
      });

      it('Should handle arrays manually with user-defined validation', () => {
        type Team = {
          name: string;
          members: string[];
          scores: number[];
        };

        const teamForm: FormTypes.Form<Team> = {
          name: 'teamForm',
          definition: {
            name: {
              rules: [{
                name: 'required',
                validator: (v) => typeof v === 'string' && v.length > 0,
                message: 'Team name is required'
              }]
            },
            members: {
              rules: [
                {
                  name: 'isArray',
                  validator: (v) => Array.isArray(v),
                  message: 'Members must be an array'
                },
                {
                  name: 'minMembers',
                  validator: (v) => v.length >= 2,
                  message: 'Team must have at least 2 members'
                },
                {
                  name: 'allStrings',
                  validator: (v) => v.every(m => typeof m === 'string' && m.length > 0),
                  message: 'All members must be non-empty strings'
                },
                {
                  name: 'uniqueMembers',
                  validator: (v) => new Set(v).size === v.length,
                  message: 'All members must be unique'
                }
              ]
            },
            scores: {
              rules: [
                {
                  name: 'isArray',
                  validator: (v) => Array.isArray(v),
                  message: 'Scores must be an array'
                },
                {
                  name: 'validScores',
                  validator: (v) => v.every(s => typeof s === 'number' && s >= 0 && s <= 100),
                  message: 'All scores must be numbers between 0 and 100'
                },
                {
                  name: 'matchMemberCount',
                  validator: (v, k, obj) => v.length === obj.members.length,
                  message: 'Number of scores must match number of members'
                }
              ]
            }
          },
          options: { noRedundantProperties: true }
        };

        // Valid team
        const validTeam: Team = {
          name: 'Alpha Team',
          members: ['Alice', 'Bob', 'Charlie'],
          scores: [95, 87, 92]
        };
        const validResult = Form.Validate(teamForm, validTeam);
        expect(validResult.valid).toBe(true);

        // Invalid - duplicate members
        const duplicateTeam: Team = {
          name: 'Beta Team',
          members: ['Alice', 'Bob', 'Alice'],
          scores: [95, 87, 92]
        };
        const duplicateResult = Form.Validate(teamForm, duplicateTeam);
        expect(duplicateResult.valid).toBe(false);

        // Invalid - mismatched array lengths
        const mismatchedTeam: Team = {
          name: 'Gamma Team',
          members: ['Alice', 'Bob'],
          scores: [95, 87, 92]
        };
        const mismatchedResult = Form.Validate(teamForm, mismatchedTeam);
        expect(mismatchedResult.valid).toBe(false);
      });
    });

    describe('Edge Cases and Error Handling', () => {
      it('Should handle validation errors thrown by rules gracefully', () => {
        type RiskyObject = { value: any };

        const riskyForm: FormTypes.Form<RiskyObject> = {
          name: 'riskyForm',
          definition: {
            value: {
              rules: [{
                name: 'riskyValidation',
                validator: (v) => {
                  // This will throw if v is null/undefined
                  return v.toString().length > 0;
                },
                message: 'Value must have a string representation'
              }]
            }
          },
          options: {
            validationErrorHandler: ({ key, ruleName, message }) =>
              `Validation error in ${key} with rule ${ruleName}: ${message}`
          }
        };

        const nullValue = { value: null };
        const result = Form.Validate(riskyForm, nullValue);
        expect(result.valid).toBe(false);
        expect(result.errors.missingProperties).toContain('value');
      });

      it('Should handle null/undefined values in nested objects', () => {
        type Parent = {
          child?: {
            name: string;
          };
        };

        const childForm: FormTypes.Form<{ name: string }> = {
          name: 'childForm',
          definition: {
            name: {
              rules: [{
                name: 'required',
                validator: (v) => typeof v === 'string' && v.length > 0,
                message: 'Name is required'
              }]
            }
          },
          options: {}
        };

        const parentForm: FormTypes.Form<Parent> = {
          name: 'parentForm',
          definition: {
            child: {
              form: childForm,
              isOptional: true
            }
          },
          options: {}
        };

        // Valid with no child
        const noChild = {};
        const noChildResult = Form.Validate(parentForm, noChild);
        expect(noChildResult.valid).toBe(true);

        // Valid with child
        const withChild = { child: { name: 'Test' } };
        const withChildResult = Form.Validate(parentForm, withChild);
        expect(withChildResult.valid).toBe(true);

        // Invalid - child exists but invalid
        const invalidChild = { child: { name: '' } };
        const invalidResult = Form.Validate(parentForm, invalidChild);
        expect(invalidResult.valid).toBe(false);
      });

      it('Should handle dynamic message functions with all parameters', () => {
        type Product = {
          name: string;
          price: number;
          category: string;
        };

        const productForm: FormTypes.Form<Product> = {
          name: 'productForm',
          definition: {
            name: {
              rules: [{
                name: 'required',
                validator: (v) => typeof v === 'string' && v.length > 0,
                message: (v, k, o, rule) =>
                  `Field "${k}" with rule "${rule.name}" failed. Product category: ${o.category}`
              }]
            },
            price: {
              rules: [{
                name: 'priceRange',
                validator: (v, k, obj) => {
                  // Price validation depends on category
                  if (obj.category === 'premium') {
                    return v >= 100;
                  }
                  return v >= 10;
                },
                message: (v, k, obj) =>
                  `Price ${v} is too low for ${obj.category} category`
              }]
            },
            category: {
              rules: [{
                name: 'validCategory',
                validator: (v) => ['standard', 'premium'].includes(v),
                message: 'Category must be standard or premium'
              }]
            }
          },
          options: {
            earlyStop: false
          }
        };

        const invalidProduct: Product = {
          name: '',
          price: 50,
          category: 'premium'
        };
        const result = Form.Validate(productForm, invalidProduct);
        expect(result.valid).toBe(false);
        // Check dynamic messages
        const nameError = result.errors.keys.name?.string;
        expect(nameError?.includes('premium')).toBe(true);
        const priceError = result.errors.keys.price?.string;
        expect(priceError?.includes('premium')).toBe(true);
      });

      it('Should respect earlyStop option', () => {
        type MultiField = {
          field1: string;
          field2: string;
          field3: string;
        };

        let validationCalls = 0;
        const trackingForm: FormTypes.Form<MultiField> = {
          name: 'trackingForm',
          definition: {
            field1: {
              rules: [{
                name: 'fail',
                validator: () => {
                  validationCalls++;
                  return false;
                },
                message: 'Field 1 fails'
              }]
            },
            field2: {
              rules: [{
                name: 'track',
                validator: () => {
                  validationCalls++;
                  return true;
                },
                message: 'Field 2'
              }]
            },
            field3: {
              rules: [{
                name: 'track',
                validator: () => {
                  validationCalls++;
                  return true;
                },
                message: 'Field 3'
              }]
            }
          },
          options: { earlyStop: true }
        };

        validationCalls = 0;
        const obj = { field1: 'a', field2: 'b', field3: 'c' };
        const result = Form.Validate(trackingForm, obj);

        expect(result.valid).toBe(false);
        // With earlyStop, should stop after first failure
        expect(validationCalls).toBe(1);

        // Now test without earlyStop
        const noEarlyStopForm = { ...trackingForm, options: { earlyStop: false } };
        validationCalls = 0;
        const result2 = Form.Validate(noEarlyStopForm, obj);

        expect(result2.valid).toBe(false);
        // Without earlyStop, should validate all fields
        expect(validationCalls).toBe(3);
      });

      it('Should handle objects with null prototype', () => {
        const objWithoutProto = Object.create(null);
        objWithoutProto.name = 'Test';
        objWithoutProto.value = 42;

        type SimpleType = { name: string; value: number };
        const simpleForm: FormTypes.Form<SimpleType> = {
          name: 'simpleForm',
          definition: {
            name: {
              rules: [{
                name: 'isString',
                validator: (v) => typeof v === 'string',
                message: 'Must be string'
              }]
            },
            value: {
              rules: [{
                name: 'isNumber',
                validator: (v) => typeof v === 'number',
                message: 'Must be number'
              }]
            }
          },
          options: {}
        };

        const result = Form.Validate<SimpleType>(simpleForm, objWithoutProto);

        expect(result.valid).toBe(true);
      });

      it('Should handle circular validation dependencies gracefully', () => {
        type CircularType = {
          a: number;
          b: number;
        };

        const circularForm: FormTypes.Form<CircularType> = {
          name: 'circularForm',
          definition: {
            a: {
              rules: [{
                name: 'dependsOnB',
                validator: (v, k, obj) => v > obj.b,
                message: 'A must be greater than B'
              }]
            },
            b: {
              rules: [{
                name: 'dependsOnA',
                validator: (v, k, obj) => v < obj.a,
                message: 'B must be less than A'
              }]
            }
          },
          options: {}
        };

        // Valid case
        const valid = { a: 10, b: 5 };
        const validResult = Form.Validate(circularForm, valid);
        expect(validResult.valid).toBe(true);

        // Invalid case
        const invalid = { a: 5, b: 10 };
        const invalidResult = Form.Validate(circularForm, invalid);
        expect(invalidResult.valid).toBe(false);
      });
    });

    describe('Options and Configuration', () => {
      it('Should handle all combinations of options', () => {
        type TestType = { required: string; optional?: string };

        const baseDefinition: FormTypes.Form<TestType>['definition'] = {
          required: {
            rules: [{
              name: 'required',
              validator: (v) => Exists(v),
              message: 'Required'
            }]
          },
          optional: {
            rules: [{
              name: 'string',
              validator: (v) => typeof v === 'string',
              message: 'Must be string'
            }],
            isOptional: true
          }
        };

        // Test with redundant property allowed
        const allowRedundantForm: FormTypes.Form<TestType> = {
          name: 'allowRedundant',
          definition: baseDefinition,
          options: {
            noRedundantProperties: false,
            earlyStop: false
          }
        };

        const withExtra = { required: 'yes', extra: 'not in schema' } as any;
        const allowResult = Form.Validate<TestType>(allowRedundantForm, withExtra);
        expect(allowResult.valid).toBe(true);
        expect(allowResult.errors.redundantProperties).toContain('extra');

        // Test with form-level isOptional
        const optionalForm: FormTypes.Form<TestType> = {
          name: 'optionalForm',
          definition: baseDefinition,
          options: {
            isOptional: true
          }
        };

        const nullResult = Form.Validate<TestType>(optionalForm, null as any);
        expect(nullResult.valid).toBe(true);

        const undefinedResult = Form.Validate<TestType>(optionalForm, undefined as any);
        expect(undefinedResult.valid).toBe(true);
      });
    });

    describe('Performance and Large Objects', () => {
      it('Should handle objects with many properties efficiently', () => {
        // Create a form with 100 properties
        type LargeObject = Record<string, string>;
        const definition: FormTypes.Form<LargeObject>['definition'] = {};

        for (let i = 0; i < 100; i++) {
          definition[`field${i}`] = {
            rules: [{
              name: 'isString',
              validator: (v) => typeof v === 'string',
              message: `Field ${i} must be a string`
            }]
          };
        }

        const largeForm: FormTypes.Form<LargeObject> = {
          name: 'largeForm',
          definition,
          options: { noRedundantProperties: true }
        };

        // Create valid object
        const validLarge: LargeObject = {};
        for (let i = 0; i < 100; i++) {
          validLarge[`field${i}`] = `value${i}`;
        }

        const start = Date.now();
        const result = Form.Validate(largeForm, validLarge);
        const duration = Date.now() - start;

        expect(result.valid).toBe(true);
        expect(duration).toBeLessThan(100); // Should be fast
      });
    });
  });

  describe('Form.ValidationSummary Public API', () => {
    // Helper function to create a validation summary with specific errors
    const createSummaryWithErrors = <T extends DataObject>(
      errors: Partial<FormTypes.ValidationSummary<T>['errors']>
    ): FormTypes.ValidationSummary<T> => {
      return {
        valid: false,
        errorCount: 1, // This would be calculated in real usage
        errors: {
          keys: {},
          missingProperties: [],
          redundantProperties: [],
          root: null,
          ...errors
        }
      };
    };

    describe('getErrorMessages', () => {
      it('Should return empty array for valid summary', () => {
        const validSummary: FormTypes.ValidationSummary<any> = {
          valid: true,
          errorCount: 0,
          errors: {
            keys: {},
            missingProperties: [],
            redundantProperties: [],
            root: null
          }
        };

        expect(ValidationSummary.getErrorMessages(validSummary)).toEqual([]);
      });

      it('Should return only root error when present', () => {
        const summary = createSummaryWithErrors({
          root: 'Value must be an object, not string',
          missingProperties: ['field1'], // Should be ignored when root error exists
          keys: { field2: { string: 'Some error' } } // Should also be ignored
        });

        const messages = ValidationSummary.getErrorMessages(summary);
        expect(messages).toEqual(['Value must be an object, not string']);
        expect(messages.length).toBe(1);
      });

      it('Should format missing required fields message', () => {
        const summary = createSummaryWithErrors({
          missingProperties: ['name', 'email', 'age']
        });

        const messages = ValidationSummary.getErrorMessages(summary);
        expect(messages).toContain('Missing required fields: name, email, age');
      });

      it('Should format unexpected fields message', () => {
        const summary = createSummaryWithErrors({
          redundantProperties: ['extra1', 'extra2']
        });

        const messages = ValidationSummary.getErrorMessages(summary);
        expect(messages).toContain('Unexpected fields: extra1, extra2');
      });

      it('Should include field-specific string errors', () => {
        const summary = createSummaryWithErrors({
          keys: {
            name: { string: 'Name must be at least 3 characters' },
            email: { string: 'Must be a valid email' }
          }
        });

        const messages = ValidationSummary.getErrorMessages(summary);
        expect(messages).toContain('name: Name must be at least 3 characters');
        expect(messages).toContain('email: Must be a valid email');
      });

      it('Should handle nested validation summaries', () => {
        const nestedSummary = createSummaryWithErrors({
          keys: {
            street: { string: 'Street is required' },
            city: { string: 'City is required' }
          }
        });

        const summary = createSummaryWithErrors({
          keys: {
            address: { nestedSummary }
          }
        });

        const messages = ValidationSummary.getErrorMessages(summary);
        expect(messages.some(m => m.includes('address:'))).toBe(true);
      });

      it('Should combine all error types except when root error exists', () => {
        const summary = createSummaryWithErrors({
          missingProperties: ['phone'],
          redundantProperties: ['nickname'],
          keys: {
            name: { string: 'Too short' },
            age: { string: 'Must be positive' }
          }
        });

        const messages = ValidationSummary.getErrorMessages(summary);
        expect(messages).toHaveLength(4);
        expect(messages).toContain('Missing required fields: phone');
        expect(messages).toContain('Unexpected fields: nickname');
        expect(messages).toContain('name: Too short');
        expect(messages).toContain('age: Must be positive');
      });

      it('Should handle deeply nested summaries', () => {
        const deepestSummary = createSummaryWithErrors({
          keys: { postalCode: { string: 'Invalid postal code' } }
        });

        const middleSummary = createSummaryWithErrors({
          keys: { location: { nestedSummary: deepestSummary } }
        });

        const topSummary = createSummaryWithErrors({
          keys: { company: { nestedSummary: middleSummary } }
        });

        const messages = ValidationSummary.getErrorMessages(topSummary);
        expect(messages.some(m => m.includes('company:'))).toBe(true);
      });

      it('Should filter out undefined/null entries from keys', () => {
        const summary = createSummaryWithErrors({
          keys: {
            field1: { string: 'Error 1' },
            field2: undefined as any, // Edge case
            field3: { string: 'Error 3' }
          }
        });

        const messages = ValidationSummary.getErrorMessages(summary);
        expect(messages).toHaveLength(2);
        expect(messages).toContain('field1: Error 1');
        expect(messages).toContain('field3: Error 3');
      });
    });

    describe('getErrorsFlat', () => {
      it('Should return empty object for valid summary', () => {
        const validSummary: FormTypes.ValidationSummary<any> = {
          valid: true,
          errorCount: 0,
          errors: {
            keys: {},
            missingProperties: [],
            redundantProperties: [],
            root: null
          }
        };

        expect(ValidationSummary.getErrorsFlat(validSummary)).toEqual({});
      });

      it('Should return only root error when present', () => {
        const summary = createSummaryWithErrors({
          root: 'Not an object',
          missingProperties: ['field1'],
          keys: { field2: { string: 'Error' } }
        });

        const flat = ValidationSummary.getErrorsFlat(summary);
        expect(flat).toEqual({ '_root': 'Not an object' });
      });

      it('Should map missing fields with standard message', () => {
        const summary = createSummaryWithErrors({
          missingProperties: ['name', 'email']
        });

        const flat = ValidationSummary.getErrorsFlat(summary);
        expect(flat).toEqual({
          'name': 'This field is required',
          'email': 'This field is required'
        });
      });

      it('Should map redundant fields with standard message', () => {
        const summary = createSummaryWithErrors({
          redundantProperties: ['extra1', 'extra2']
        });

        const flat = ValidationSummary.getErrorsFlat(summary);
        expect(flat).toEqual({
          'extra1': 'This field is not allowed',
          'extra2': 'This field is not allowed'
        });
      });

      it('Should include field-specific errors', () => {
        const summary = createSummaryWithErrors({
          keys: {
            name: { string: 'Too short' },
            age: { string: 'Must be positive' }
          }
        });

        const flat = ValidationSummary.getErrorsFlat(summary);
        expect(flat).toEqual({
          'name': 'Too short',
          'age': 'Must be positive'
        });
      });

      it('Should flatten nested validation summaries', () => {
        const nestedSummary = createSummaryWithErrors({
          keys: {
            street: { string: 'Street required' },
            city: { string: 'City required' }
          }
        });

        const summary = createSummaryWithErrors({
          keys: {
            address: { nestedSummary }
          }
        });

        const flat = ValidationSummary.getErrorsFlat(summary);
        expect(flat).toEqual({
          'address.street': 'Street required',
          'address.city': 'City required'
        });
      });

      it('Should handle prefix parameter correctly', () => {
        const summary = createSummaryWithErrors({
          missingProperties: ['name'],
          keys: {
            age: { string: 'Invalid age' }
          }
        });

        const flat = ValidationSummary.getErrorsFlat(summary, 'user');
        expect(flat).toEqual({
          'user.name': 'This field is required',
          'user.age': 'Invalid age'
        });
      });

      it('Should handle deeply nested structures with prefixes', () => {
        const deepSummary = createSummaryWithErrors({
          keys: { code: { string: 'Invalid code' } }
        });

        const midSummary = createSummaryWithErrors({
          keys: { country: { nestedSummary: deepSummary } }
        });

        const topSummary = createSummaryWithErrors({
          keys: { address: { nestedSummary: midSummary } }
        });

        const flat = ValidationSummary.getErrorsFlat(topSummary, 'company');
        expect(flat).toEqual({
          'company.address.country.code': 'Invalid code'
        });
      });

      it('Should combine all error types in flat structure', () => {
        const nestedSummary = createSummaryWithErrors({
          keys: { city: { string: 'City required' } }
        });

        const summary = createSummaryWithErrors({
          missingProperties: ['name'],
          redundantProperties: ['extra'],
          keys: {
            age: { string: 'Invalid age' },
            address: { nestedSummary }
          }
        });

        const flat = ValidationSummary.getErrorsFlat(summary);
        expect(flat).toEqual({
          'name': 'This field is required',
          'extra': 'This field is not allowed',
          'age': 'Invalid age',
          'address.city': 'City required'
        });
      });
    });

    describe('getFieldErrors', () => {
      it('Should return empty array when no errors for field', () => {
        const summary = createSummaryWithErrors({
          keys: { other: { string: 'Error' }, name: undefined }
        });

        const errors = ValidationSummary.getFieldErrors(summary, 'name');
        expect(errors).toEqual([]);
      });

      it('Should return errors for exact field match', () => {
        const summary = createSummaryWithErrors({
          keys: {
            name: { string: 'Name is required' }
          }
        });

        const errors = ValidationSummary.getFieldErrors(summary, 'name');
        expect(errors).toEqual(['Name is required']);
      });

      it('Should return errors for nested field paths', () => {
        const nestedSummary = createSummaryWithErrors({
          keys: {
            street: { string: 'Street required' },
            city: { string: 'City required' }
          }
        });

        const summary = createSummaryWithErrors({
          keys: {
            address: { nestedSummary }
          }
        });

        const addressErrors = ValidationSummary.getFieldErrors(summary, 'address');
        expect(addressErrors).toHaveLength(2);
        expect(addressErrors).toContain('Street required');
        expect(addressErrors).toContain('City required');
      });

      it('Should handle missing fields', () => {
        const summary = createSummaryWithErrors({
          missingProperties: ['email', 'phone']
        });

        const emailErrors = ValidationSummary.getFieldErrors(summary, 'email');
        expect(emailErrors).toEqual(['This field is required']);
      });

      it('Should handle redundant fields', () => {
        const summary = createSummaryWithErrors({
          redundantProperties: ['extra']
        });

        const errors = ValidationSummary.getFieldErrors(summary, 'extra');
        expect(errors).toEqual(['This field is not allowed']);
      });

      it('Should return all errors starting with field path', () => {
        const deepSummary = createSummaryWithErrors({
          keys: {
            street: { string: 'Street error' },
            city: { string: 'City error' },
            postalCode: { string: 'Postal error' }
          }
        });

        const summary = createSummaryWithErrors({
          keys: {
            homeAddress: { nestedSummary: deepSummary },
            workAddress: { nestedSummary: deepSummary },
          }
        });

        const homeErrors = ValidationSummary.getFieldErrors(summary, 'homeAddress');
        expect(homeErrors).toHaveLength(3);
      });
    });

    describe('hasFieldError', () => {
      it('Should return false for valid summary', () => {
        const validSummary: FormTypes.ValidationSummary<any> = {
          valid: true,
          errorCount: 0,
          errors: {
            keys: {},
            missingProperties: [],
            redundantProperties: [],
            root: null
          }
        };

        expect(ValidationSummary.hasFieldError(validSummary, 'anyField')).toBe(false);
      });

      it('Should return true when field has error', () => {
        const summary = createSummaryWithErrors({
          keys: { name: { string: 'Error' } }
        });

        expect(ValidationSummary.hasFieldError(summary, 'name')).toBe(true);
        expect(ValidationSummary.hasFieldError(summary, 'email')).toBe(false);
      });

      it('Should work with nested field paths', () => {
        const nestedSummary = createSummaryWithErrors({
          keys: { city: { string: 'City error' } }
        });

        const summary = createSummaryWithErrors({
          keys: { address: { nestedSummary } }
        });

        expect(ValidationSummary.hasFieldError(summary, 'address')).toBe(true);
        expect(ValidationSummary.hasFieldError(summary, 'address.city')).toBe(true);
        expect(ValidationSummary.hasFieldError(summary, 'address.street')).toBe(false);
      });

      it('Should detect missing field errors', () => {
        const summary = createSummaryWithErrors({
          missingProperties: ['email']
        });

        expect(ValidationSummary.hasFieldError(summary, 'email')).toBe(true);
      });

      it('Should detect redundant field errors', () => {
        const summary = createSummaryWithErrors({
          redundantProperties: ['extra']
        });

        expect(ValidationSummary.hasFieldError(summary, 'extra')).toBe(true);
      });
    });

    describe('hasMissingFields', () => {
      it('Should return false when no missing fields', () => {
        const summary = createSummaryWithErrors({
          keys: { name: { string: 'Error' } }
        });

        expect(ValidationSummary.hasMissingFields(summary)).toBe(false);
      });

      it('Should return true when missing fields exist', () => {
        const summary = createSummaryWithErrors({
          missingProperties: ['email']
        });

        expect(ValidationSummary.hasMissingFields(summary)).toBe(true);
      });

      it('Should return true for multiple missing fields', () => {
        const summary = createSummaryWithErrors({
          missingProperties: ['email', 'name', 'age']
        });

        expect(ValidationSummary.hasMissingFields(summary)).toBe(true);
      });

      it('Should work with valid summary', () => {
        const validSummary: FormTypes.ValidationSummary<any> = {
          valid: true,
          errorCount: 0,
          errors: {
            keys: {},
            missingProperties: [],
            redundantProperties: [],
            root: null
          }
        };

        expect(ValidationSummary.hasMissingFields(validSummary)).toBe(false);
      });
    });

    describe('getFirstError', () => {
      it('Should return null for valid summary', () => {
        const validSummary: FormTypes.ValidationSummary<any> = {
          valid: true,
          errorCount: 0,
          errors: {
            keys: {},
            missingProperties: [],
            redundantProperties: [],
            root: null
          }
        };

        expect(ValidationSummary.getFirstError(validSummary)).toBeNull();
      });

      it('Should return root error as first when present', () => {
        const summary = createSummaryWithErrors({
          root: 'Not an object',
          missingProperties: ['field'],
          keys: { other: { string: 'Error' } }
        });

        expect(ValidationSummary.getFirstError(summary)).toBe('Not an object');
      });

      it('Should return missing fields error when no root error', () => {
        const summary = createSummaryWithErrors({
          missingProperties: ['name', 'email']
        });

        const firstError = ValidationSummary.getFirstError(summary);
        expect(firstError).toBe('Missing required fields: name, email');
      });

      it('Should return first error from multiple error types', () => {
        const summary = createSummaryWithErrors({
          missingProperties: ['phone'],
          redundantProperties: ['extra'],
          keys: {
            name: { string: 'Too short' }
          }
        });

        const firstError = ValidationSummary.getFirstError(summary);
        expect(firstError).toBeTruthy();
        expect(typeof firstError).toBe('string');
      });

      it('Should handle empty error summary', () => {
        const summary = createSummaryWithErrors({});
        expect(ValidationSummary.getFirstError(summary)).toBeNull();
      });
    });

    describe('Integration with Form.Validate', () => {
      // Define test types and forms
      type User = {
        name: string;
        email: string;
        profile?: {
          bio: string;
          website?: string;
        };
      };

      const profileForm: FormTypes.Form<{ bio: string; website?: string }> = {
        name: 'profileForm',
        definition: {
          bio: {
            rules: [{
              name: 'minLength',
              validator: (v) => v.length >= 10,
              message: 'Bio must be at least 10 characters'
            }]
          },
          website: {
            rules: [{
              name: 'url',
              validator: (v) => !v || v.startsWith('http'),
              message: 'Website must be a valid URL'
            }],
            isOptional: true
          }
        },
        options: { earlyStop: false }
      };

      const userForm: FormTypes.Form<User> = {
        name: 'userForm',
        definition: {
          name: {
            rules: [{
              name: 'required',
              validator: (v) => v.length > 0,
              message: 'Name is required'
            }]
          },
          email: {
            rules: [{
              name: 'email',
              validator: (v) => v.includes('@'),
              message: 'Must be a valid email'
            }]
          },
          profile: {
            form: profileForm,
            isOptional: true
          }
        },
        options: { noRedundantProperties: true, earlyStop: false }
      };

      it('Should work with actual validation results', () => {
        const invalidUser = {
          name: '',
          email: 'notanemail',
          profile: {
            bio: 'Too short',
            website: 'not-a-url'
          },
          extra: 'not allowed'
        } as any;

        const summary = Form.Validate<User>(userForm, invalidUser);

        // Test getErrorMessages
        const messages = ValidationSummary.getErrorMessages(summary);
        expect(messages.length).toBeGreaterThan(0);
        expect(messages.some(m => m.includes('Unexpected fields'))).toBe(true);

        // Test getErrorsFlat
        const flat = ValidationSummary.getErrorsFlat(summary);
        expect(flat['name']).toBe('Name is required');
        expect(flat['email']).toBe('Must be a valid email');
        expect(flat['profile.bio']).toBe('Bio must be at least 10 characters');
        expect(flat['profile.website']).toBe('Website must be a valid URL');
        expect(flat['extra']).toBe('This field is not allowed');

        // Test getFieldErrors
        const profileErrors = ValidationSummary.getFieldErrors(summary, 'profile');
        expect(profileErrors).toHaveLength(2);

        // Test hasFieldError
        expect(ValidationSummary.hasFieldError(summary, 'name')).toBe(true);
        expect(ValidationSummary.hasFieldError(summary, 'profile.bio')).toBe(true);
        expect(ValidationSummary.hasFieldError(summary, 'nonexistent')).toBe(false);

        // Test hasMissingFields
        expect(ValidationSummary.hasMissingFields(summary)).toBe(false); // All required fields present

        // Test with missing fields
        const incompleteUser = { email: 'test@example.com' } as User;
        const incompleteSummary = Form.Validate(userForm, incompleteUser);
        expect(ValidationSummary.hasMissingFields(incompleteSummary)).toBe(true);

        // Test getFirstError
        const firstError = ValidationSummary.getFirstError(summary);
        expect(firstError).toBeTruthy();
        expect(typeof firstError).toBe('string');
      });
    });
  });

});
