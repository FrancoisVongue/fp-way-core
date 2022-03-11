import {
    CanBeDescribedAs,
    Compose, Const,
    Curry,
    FALSE, IfElse,
    InCase,
    Is,
    IsOfType, Pipe, Return,
    TRUE,
    Unless,
    When
} from './core';

describe('Curry', () => {
    it('should curry a non-generic function', () => {
        const add = (a: number, b: number) => a + b;
        const cAdd = Curry(add);
        const inc = cAdd(1);

        const five = inc(4);
        const six = inc(five);

        expect(five).toBe(5);
        expect(six).toBe(6);
    })
})

describe('When', () => {
    it('should run function if predicate is correct, or return argument unchanged', () => {
        const inc = a => a + 1;
        const incIf4 = When(Is(4), inc);

        const five = incIf4(4);
        const eight = incIf4(8);

        expect(five).toBe(5);
        expect(eight).toBe(8);
    })
})

describe('Unless', () => {
    it('should run function if predicate is incorrect, or return argument unchanged', () => {
        const inc = a => a + 1;
        const incIfNot4 = Unless(Is(4), inc);

        const four = incIfNot4(4);
        const nine = incIfNot4(8);

        expect(four).toBe(4);
        expect(nine).toBe(9);
    })
})

describe('InCase', () => {
    it(`should run function af the first entry where predicate returns true`, () => {
        const five = 5;
        const three = 3;

        const fiveIs3or2or5 = InCase<number, boolean>([
            [Is(3), FALSE],
            [Is(2), FALSE],
            [Is(5), TRUE],
            [TRUE, FALSE],
        ], five);

        const fiveIs3or2or4 = InCase([
            [Is(3), TRUE],
            [Is(2), TRUE],
            [Is(4), TRUE],
            [TRUE, FALSE],
        ], five);

        const threeIs3or2or4 = InCase([
            [Is(3), TRUE],
            [Is(2), TRUE],
            [Is(4), TRUE],
            [TRUE, FALSE],
        ], three);

        expect(fiveIs3or2or5).toBe(true);
        expect(fiveIs3or2or4).toBe(false);
        expect(threeIs3or2or4).toBe(true);
    })
})

describe('Compose', () => {
    it('should compose multiple functions into one', () => {
        const inc = a => a + 1;
        const mul2 = a => a * 2;
        const min3 = a => a - 3;

        const add1mul2min3 = Compose([
            min3,
            mul2,
            inc,
        ]);

        const nineteen = add1mul2min3(10);

        expect(nineteen).toBe(19);
    })
})

describe('IsOfType', () => {
    it('should return type of a variable', () => {
        const arrayOfTrue = [
            IsOfType("array", []),
            IsOfType("null", null),
            IsOfType("boolean", true),
            IsOfType("number", 2),
            IsOfType("undefined", undefined),
            IsOfType("object", {}),
        ];

        const False = IsOfType("object", []);
        const True = arrayOfTrue.reduce((b, v) => v && b, true)

        expect(True).toBe(true);
        expect(False).toBe(false);
    })
})

describe('CanBeDescribedAs', () => {
    it('should return true in case all predicates return true', () => {
        const isInt = CanBeDescribedAs<number>([
            (int) => int % 1 === 0,
            int => typeof int === 'number'
        ])

        const True = isInt(-8) && isInt(8)
        const False = isInt(8.8);

        expect(True).toBe(true);
        expect(False).toBe(false);
    })
})

describe('IfElse', () => {
  it('Should return different values depending on condition', () => {
    const if5then3else10 = IfElse<number, number>(Is(5), Return(3), Return(10));

    const three = if5then3else10(5);
    const ten = if5then3else10(10);

    expect(three).toBe(3);
    expect(ten).toBe(10);
  })
})

describe('Const', () => {
    it('should return the first argument after call', () => {
        const four = Const(4, 5);
        const alsoFour = Const(4)(5);

        expect(four + alsoFour).toBe(8);
    })
})
