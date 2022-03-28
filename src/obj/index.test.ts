import {obj} from "./index";
import {Focus} from "./index.types";

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
})
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
})
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
})
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
    })
})
describe('Flatten', () => {
    it('should flatten a simple object', () => {
        const person = {
            age: 14,
            name: "gregor",
        };
        const result = obj.Flatten<typeof person>(person);
        
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
        const result = obj.Flatten<typeof person>(person);
        
        expect(result['child.age']).toBe(person.child.age);
        expect(result['child.friends.1']).toBeDefined();
    })
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
    it('should return correct type for deeply nested objects', () => {
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

        // "unknown" property doesn't exist
        // @ts-expect-error
        const nilResult = obj.Get(["father", "daughter", "grandSon", "unknown"], grandPa);
        const father = obj.Get(["father"], grandPa);

        expect(result).toBe(gggSonName);
        expect(typeof result2?.name).toBe('string');
        expect(nilResult).toBeUndefined();
        expect(father).toBeInstanceOf(Object);
    });
});
describe('Put', () => {
    it('Should create new objects along the way', () => {
        const person = {} as any;
        const result = obj.Put(["child", "age"], 2, person);

        expect(person.child).toBeUndefined();
        expect(result.child).toBeInstanceOf(Object);
        expect(result.child.age).toBe(2);
    })
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

        // @ts-expect-error
        const err = obj.Put(["child", "age"], '', person);
        // @ts-expect-error
        const err2 = obj.Put(["child", "friend", "name"], [], person);

        expect(person?.child?.age).toBe(1);
        expect(result?.child?.age).toBe(2);
        expect(result2.child?.friend?.name).toBe(newName);
    });
});