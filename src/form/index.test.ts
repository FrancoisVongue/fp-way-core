import { Form } from "./index";
import { FormTypes } from "./index.types";
import { DataObject } from "../core.types";
import { Exists } from "../core";

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
      expect(noNameResult.missingProperties).toContain('name');

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
      expect(minimalResult.missingProperties.length).toBe(0);
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
      const validResult = Form.Validate(customerForm as any, validCustomer);
      expect(validResult.valid).toBe(true);

      // Invalid customer with incomplete address
      const invalidCustomer = {
        name: 'Bob',
        address: {
          street: '456 Oak Ave'
          // Missing city
        }
      } as Customer;
      const invalidResult = Form.Validate(customerForm as any, invalidCustomer);
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
      expect(redundantResult.redundantProperties).toContain('age');
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
});
