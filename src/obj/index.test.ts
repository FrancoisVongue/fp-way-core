import {obj} from "./index";
import { IsOfType, Return, TRUE} from "../core";
import { DataObject, DeepPartial } from "../core.types";

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
describe('ExcludeProps', () => {
    it('Should remove properties from objects', () => {
        const cat = {
            age: 8,
            name: 'John',
            amountOfLegs: 4
        };

        const catWOAge: Partial<Cat> = obj.Exclude(["age"], cat);

        expect(catWOAge.age).toBeUndefined();
        expect(catWOAge.name).toBeDefined();
    })

    it('Should have no link with the old obj', () => {
        const cat = {
            age: 8,
            name: 'John',
            amountOfLegs: 4
        };

        const catWOAge: Partial<Cat> = obj.Exclude(["age"], cat);
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

        const catWOAge: Partial<Cat> = obj.Pick(["name", "amountOfLegs"], cat);

        expect(catWOAge.age).toBeUndefined();
        expect(catWOAge.name).toBeDefined();
        expect(catWOAge.amountOfLegs).toBeDefined();
    })

    it('Should have no link with the old obj', () => {
        const cat = {
            age: 8,
            name: 'John',
            amountOfLegs: 4
        };

        const catWithAge: Partial<Cat> = obj.Pick(["age"], cat);
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
            }
        };
        const result = obj.Flatten<typeof person>(person);
        
        expect(result['child.age']).toBe(person.child.age);
    })
})