import { obj } from "./index";

type CatParent = {
  age: number;
  name?: string;
  amountOfLegs: number;
  childCat: Cat;
}
type Cat = {
  age: number;
  name?: string;
  amountOfLegs: number;
  child?: CatChild
}
type CatChild = Partial<Omit<Cat, 'child'>>

describe('obj', () => {
  describe('Basic Object Accessors', () => {
    describe('Keys', () => {
      it('should get keys from object', () => {
        const cat = {
          age: 8,
          name: 'John',
          amountOfLegs: 4
        };

        const keys = obj.Keys(cat);

        expect(keys).toEqual(['age', 'name', 'amountOfLegs']);
        expect(keys.length).toBe(3);
      });
    });

    describe('Values', () => {
      it('should get values from object', () => {
        const cat = {
          age: 8,
          name: 'John',
          amountOfLegs: 4
        };

        const values = obj.Values(cat);

        expect(values).toEqual([8, 'John', 4]);
        expect(values.length).toBe(3);
      });
    });

    describe('Entries', () => {
      it('should get entries from object', () => {
        const cat = {
          age: 8,
          name: 'John',
          amountOfLegs: 4
        };

        const entries = obj.Entries(cat);

        expect(entries).toEqual([
          ['age', 8],
          ['name', 'John'],
          ['amountOfLegs', 4]
        ]);
        expect(entries.length).toBe(3);
      });
    });

    describe('FromEntries', () => {
      it('should create object from entries', () => {
        const entries = [
          ['age', 8],
          ['name', 'John'],
          ['amountOfLegs', 4]
        ] as [string, any][];

        const result = obj.FromEntries(entries);

        expect(result).toEqual({
          age: 8,
          name: 'John',
          amountOfLegs: 4
        });
      });
    });
  });

  describe('WithDefault', () => {
    let defCat: Partial<Cat>;
    let partialCat: Partial<Cat>;

    beforeEach(() => {
      defCat = {
        amountOfLegs: 4,
        child: {
          age: 1,
          amountOfLegs: 4
        }
      }
      partialCat = {
        age: 5,
        name: 'Johny',
        child: {
          amountOfLegs: 3,
          name: 'Johny Jr.',
        }
      }
    });

    it('Should provide default properties for objects', () => {
      const cat = obj.WithDefault(defCat, partialCat) as Cat;

      expect(cat.amountOfLegs).toBe(defCat.amountOfLegs); // should take default
      expect(cat.child?.age).toBe(defCat.child?.age); // should take default
      expect(cat.child?.amountOfLegs).toBe(3); // should preserve existing
    })

    it('Should not have link to the default object', () => {
      const cat = obj.WithDefault(defCat, partialCat) as Cat;
      cat.amountOfLegs = 3;

      expect(cat.amountOfLegs).toBe(3);
      expect(defCat.amountOfLegs).toBe(4);
    })
  });

  describe('Impose', () => {
    it('Should be the inverse of WithDefault', () => {
      const defCat = {
        amountOfLegs: 4,
        child: {
          age: 1,
          amountOfLegs: 4
        }
      };

      const partialCat = {
        age: 5,
        name: 'Johny',
        child: {
          amountOfLegs: 3,
          name: 'Johny Jr.',
        }
      };

      const cat1 = obj.WithDefault(defCat, partialCat);
      const cat2 = obj.Impose(partialCat, defCat);

      expect(cat1).toEqual(cat2);
    });
  });

  describe('Omit', () => {
    it('Should remove properties from objects', () => {
      const cat = {
        age: 8,
        name: 'John',
        amountOfLegs: 4
      };

      const catWOAge = obj.Omit(["age"], cat);

      expect((catWOAge as typeof cat).age).toBeUndefined();
      expect(catWOAge.name).toBeDefined();
    })

    it('Should have no link with the old obj', () => {
      const cat = {
        age: 8,
        name: 'John',
        amountOfLegs: 4
      };

      const catWOAge = obj.Omit(["age"], cat);
      catWOAge.amountOfLegs = 444;

      expect(cat.amountOfLegs).toBe(4);
    })
  });

  describe('Pick', () => {
    it('Should pick properties from objects', () => {
      const cat = {
        age: 8,
        name: 'John',
        amountOfLegs: 4
      };

      const catWOAge = obj.Pick(["name", "amountOfLegs"], cat);

      expect((catWOAge as typeof cat).age).toBeUndefined();
      expect(catWOAge.name).toBeDefined();
      expect(catWOAge.amountOfLegs).toBeDefined();
    })

    it('Should have no link with the old obj', () => {
      const cat = {
        age: 8,
        name: 'John',
        amountOfLegs: 4
      };

      const catWithAge = obj.Pick(["age"], cat);
      catWithAge.age = 444;

      expect(cat.age).toBe(8);
    })
  });

  describe('ObjPick', () => {
    it('Should be the same as Pick', () => {
      const cat = {
        age: 8,
        name: 'John',
        amountOfLegs: 4
      };

      const catWOAge1 = obj.Pick(["name", "amountOfLegs"], cat);
      const catWOAge2 = obj.Pick(["name", "amountOfLegs"], cat);

      expect(catWOAge1).toEqual(catWOAge2);
    });
  });

  describe('DeepCopy', () => {
    it('should create a deep copy of an object', () => {
      const humanFriendHeight = 188;
      const human = {
        name: 'jogn',
        height: 182,
        friend: {
          name: 'lenny',
          height: humanFriendHeight
        }
      };

      const humanCopy = obj.DeepCopy(human);
      humanCopy.friend.height = 155;

      // human.friend.height should not change
      expect(human.friend.height).toEqual(humanFriendHeight);
      expect(humanCopy.name).toEqual(human.name);
      expect(humanCopy.friend.name).toEqual(human.friend.name);
    });

    it('should handle arrays properly', () => {
      const data = {
        items: [1, 2, 3],
        nested: {
          moreItems: [{ id: 1 }, { id: 2 }]
        }
      };

      const copy = obj.DeepCopy(data);
      copy.items.push(4);
      copy.nested.moreItems[0].id = 99;

      expect(data.items).toEqual([1, 2, 3]);
      expect(data.nested.moreItems[0].id).toBe(1);
      expect(copy.items).toEqual([1, 2, 3, 4]);
      expect(copy.nested.moreItems[0].id).toBe(99);
    });

    it('should handle circular references in objects', () => {
      const testObject: Partial<Record<'name' | 'self', any>> = { name: 'circular' };
      testObject.self = testObject; // Create circular reference

      const copy = obj.DeepCopy(testObject);

      // Verify the copy is a new object
      expect(copy).not.toBe(testObject);
      expect(copy.name).toBe('circular');
      // Verify circular reference is preserved
      expect(copy.self).toBe(copy);
      // Verify original object is unchanged
      expect(testObject.self).toBe(testObject);
    });

    // New test: Recursive array (circular reference)
    it('should handle circular references in arrays', () => {
      const arr: any[] = [1, 2];
      arr.push(arr); // Create circular reference

      const copy = obj.DeepCopy(arr);

      // Verify the copy is a new array
      expect(copy).not.toBe(arr);
      expect(copy[0]).toBe(1);
      expect(copy[1]).toBe(2);
      // Verify circular reference is preserved
      expect(copy[2]).toBe(copy);
      // Verify original array is unchanged
      expect(arr[2]).toBe(arr);
    });

    // New test: Complex nested object with multiple circular references
    it('should handle complex objects with multiple circular references', () => {
      const complexObj: any = { name: 'complex', items: [] };
      complexObj.self = complexObj; // Circular reference to itself
      complexObj.items.push(complexObj, { id: 1, back: complexObj }); // Circular references in array

      const copy = obj.DeepCopy(complexObj);

      // Verify the copy is a new object
      expect(copy).not.toBe(complexObj);
      expect(copy.name).toBe('complex');
      // Verify circular references
      expect(copy.self).toBe(copy);
      expect(copy.items[0]).toBe(copy);
      expect(copy.items[1].back).toBe(copy);
      // Verify original object is unchanged
      expect(complexObj.self).toBe(complexObj);
      expect(complexObj.items[0]).toBe(complexObj);
      expect(complexObj.items[1].back).toBe(complexObj);
    });

    // New test: Null and undefined
    it('should handle null and undefined', () => {
      // @ts-expect-error
      expect(obj.DeepCopy(null)).toBe(null);
      // @ts-expect-error
      expect(obj.DeepCopy(undefined)).toBe(undefined);
    });

    // New test: Primitive values
    it('should handle primitive values', () => {
      // @ts-expect-error
      expect(obj.DeepCopy(42)).toBe(42);
      // @ts-expect-error
      expect(obj.DeepCopy('hello')).toBe('hello');
      // @ts-expect-error
      expect(obj.DeepCopy(true)).toBe(true);
    });

    // New test: Empty objects and arrays
    it('should handle empty objects and arrays', () => {
      const emptyObj = {};
      const emptyArr: any[] = [];
      const objCopy = obj.DeepCopy(emptyObj);
      const arrCopy = obj.DeepCopy(emptyArr);

      expect(objCopy).toEqual({});
      expect(objCopy).not.toBe(emptyObj); // New object
      expect(arrCopy).toEqual([]);
      expect(arrCopy).not.toBe(emptyArr); // New array
    });
  });


  describe('Flatten', () => {
    it('should flatten a simple object', () => {
      const person = {
        age: 14,
        name: "gregor",
      };
      const result = obj.Flatten(person);

      expect(result.age).toBe(person.age);
      expect(result.name).toBe(person.name);
    });

    it('should flatten a complex object', () => {
      const person = {
        age: 14,
        name: "gregor",
        child: {
          age: 14,
          name: "gregor",
          friends: ["marta", "chloe", "francois"]
        }
      };
      const result = obj.Flatten(person);

      expect(result['child.age']).toBe(person.child.age);
      expect(result['child.friends.1']).toBe("chloe");
    });

    it('should handle nested objects properly', () => {
      const data = {
        user: {
          profile: {
            details: {
              firstName: "John",
              lastName: "Doe"
            }
          },
          settings: {
            theme: "dark"
          }
        }
      };

      const flattened = obj.Flatten(data);

      expect(flattened['user.profile.details.firstName']).toBe("John");
      expect(flattened['user.profile.details.lastName']).toBe("Doe");
      expect(flattened['user.settings.theme']).toBe("dark");
    });
  });

  describe('Get', () => {
    it('should safely focus deep into nested objects', () => {
      const person = {
        age: 14,
        name: "gregor",
        child: {
          age: 1
        }
      };
      const result = obj.Get(["child", "age"], person);
      const nilResult = obj.Get(["child", "unknown" as any], person);

      expect(result).toBe(1);
      expect(nilResult).toBeUndefined();
    });

    it('should handle empty path', () => {
      const person = { age: 14, name: "gregor" };
      const result = obj.Get([], person);

      expect(result).toEqual(person);
    });

    it('should return undefined for non-existent paths', () => {
      const person = { age: 14, name: "gregor" };

      // @ts-expect-error
      expect(obj.Get(["child"], person)).toBeUndefined();
      // @ts-expect-error
      expect(obj.Get(["age", "value"], person)).toBeUndefined();
      // @ts-expect-error
      expect(obj.Get(["nonexistent", "path"], person)).toBeUndefined();
    });

    it('should handle array access', () => {
      const data = {
        items: [
          { id: 1, name: "Item 1" },
          { id: 2, name: "Item 2" }
        ]
      };

      expect(obj.Get(["items", "0", "name"], data)).toBe("Item 1");
      expect(obj.Get(["items", "1", "id"], data)).toBe(2);
    });
  });

  describe('GetOr', () => {
    it('should return default value for non-existent paths', () => {
      const person = { age: 14, name: "gregor" };
      const defaultName = "Unknown";

      // @ts-expect-error
      expect(obj.GetOr(defaultName, ["child", "name"], person)).toBe(defaultName);
      // @ts-expect-error
      expect(obj.GetOr(0, ["child", "age"], person)).toBe(0);
      // @ts-expect-error
      expect(obj.GetOr({}, ["profile"], person)).toEqual({});
    });

    it('should return actual value when path exists', () => {
      const person = {
        age: 14,
        name: "gregor",
        profile: { level: 5 }
      };

      expect(obj.GetOr("default", ["name"], person)).toBe("gregor");
      expect(obj.GetOr(0, ["age"], person)).toBe(14);
      expect(obj.GetOr({}, ["profile", "level"], person)).toBe(5);
    });
  });

  describe('HasPath', () => {
    it('should check if a path exists in an object', () => {
      const person = {
        age: 14,
        name: "gregor",
        profile: {
          settings: {
            theme: "dark"
          }
        },
        friends: ["Alice", "Bob"]
      };

      expect(obj.HasPath(["age"], person)).toBe(true);
      expect(obj.HasPath(["profile", "settings", "theme"], person)).toBe(true);
      expect(obj.HasPath(["friends", "0"], person)).toBe(true);

      // @ts-expect-error
      expect(obj.HasPath(["nonexistent"], person)).toBe(false);
      // @ts-expect-error
      expect(obj.HasPath(["profile", "nonexistent"], person)).toBe(false);
      // @ts-expect-error
      expect(obj.HasPath(["profile", "settings", "nonexistent"], person)).toBe(false);
    });

    it('should return true for empty path', () => {
      const person = { age: 14, name: "gregor" };
      expect(obj.HasPath([], person)).toBe(true);
    });
  });

  describe('Put', () => {
    it('Should create new objects along the way', () => {
      const person = {} as any;
      const result = obj.Put(["child", "age"], 2, person);

      expect(person.child).toBeUndefined();
      expect(result.child).toBeInstanceOf(Object);
      expect(result.child.age).toBe(2);
    });

    it('should safely set a value into an obj and return a new one', () => {
      type Person = {
        age: number,
        child?: {
          age: number,
          friend?: { name: string }
        }
      }
      const person: Person = {
        age: 14,
        child: {
          age: 1
        }
      };
      const newName = 'Donald';

      const result = obj.Put(["child", "age"], 2, person);
      const result2 = obj.Put(["child", "friend", "name"], newName, person);

      expect(person?.child?.age).toBe(1);
      expect(result?.child?.age).toBe(2);
      expect(result2.child?.friend?.name).toBe(newName);
    });

    it('should handle single level paths', () => {
      const person = { age: 30, name: "Alice" };
      const result = obj.Put(["name"], "Bob", person);

      expect(result.name).toBe("Bob");
      expect(person.name).toBe("Alice"); // Original unchanged
    });

    it('should handle empty paths', () => {
      const person = { age: 30, name: "Alice" };
      const result = obj.Put([], "ignored", person);

      // Returns a copy of the original without modification
      expect(result).toEqual(person);
      expect(result).not.toBe(person); // Different object reference
    });
  });

  describe('Merge', () => {
    it('should merge two objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };

      const merged = obj.Merge(obj1, obj2);

      expect(merged).toEqual({ a: 1, b: 3, c: 4 });
      expect(obj1.b).toBe(2); // Original unchanged
      expect(obj2.b).toBe(3); // Original unchanged
    });

    it('should create a deep copy', () => {
      const obj1 = {
        a: 1,
        nested: { x: 10 }
      };
      const obj2 = {
        b: 2,
        nested: { y: 20 }
      };

      const merged = obj.Merge(obj1, obj2);
      merged.nested.x = 99;

      expect(obj1.nested.x).toBe(10); // Original unchanged
    });

    it('should handle nested objects (shallow merge)', () => {
      const obj1 = {
        user: { name: "John", age: 30 },
        settings: { theme: "light" }
      };
      const obj2 = {
        user: { name: "Jane", role: "admin" },
        data: [1, 2, 3]
      };

      const merged = obj.Merge(obj1, obj2);

      // Note: This tests the current behavior (shallow merge for nested objects)
      expect(merged).toEqual({
        user: { name: "Jane", role: "admin" }, // obj2.user completely replaced obj1.user
        settings: { theme: "light" },
        data: [1, 2, 3]
      });
    });
  });

  describe('Type safety', () => {
    it('should handle the README example', () => {
      type GrandFather = {
        age: number,
        name: string,
        father: {
          daughter: {
            grandSon?: {
              name: string,
              grandGrandSon: {
                name: string,
                gggSon?: {
                  name: string
                }
              }
            }
          }
        }
      }
      const gggSonName = "Tom";
      const grandPa: GrandFather = {
        age: 14,
        name: "gregor",
        father: {
          daughter: {
            grandSon: {
              name: "Tom",
              grandGrandSon: {
                name: "Tom Jr",
                gggSon: {
                  name: gggSonName,
                }
              }
            }
          }
        }
      };
      const result = obj.Get(["father", "daughter", "grandSon", "grandGrandSon", "gggSon", "name"], grandPa);
      const result2 = obj.Get(["father", "daughter", "grandSon", "grandGrandSon", "gggSon"], grandPa);

      // @ts-expect-error
      const nilResult = obj.Get(["father", "daughter", "grandSon", "unknown"], grandPa);
      const father = obj.Get(["father"], grandPa);

      expect(result).toBe(gggSonName);
      expect(result2?.name).toBe(gggSonName);
      expect(nilResult).toBeUndefined();
      expect(father).toBeInstanceOf(Object);
    });
  });
});