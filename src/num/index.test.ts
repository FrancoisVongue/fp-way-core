import {num} from "./index";
import {bool} from "../bool";
import IsInt = num.IsInt;
import {Is} from "../core";

describe('ParseInt', () => {
    it('should parse a string to an integer', () => {
        expect(num.ParseInt("123")).toBe(123);
        expect(num.ParseInt("-456")).toBe(-456);
        expect(num.ParseInt("0")).toBe(0);
    });
});

describe('ParseFloat', () => {
    it('should parse a string to a float', () => {
        expect(num.ParseFloat("123.45")).toBe(123.45);
        expect(num.ParseFloat("-67.89")).toBe(-67.89);
        expect(num.ParseFloat("0.0")).toBe(0);
    });
});

describe('IsNum', () => {
    it('should return true if the value is a number', () => {
        expect(num.IsNum(123)).toBe(true);
        expect(num.IsNum(-45.6)).toBe(true);
        expect(num.IsNum(0)).toBe(true);
        expect(num.IsNum("123")).toBe(false);
    });
});

describe('IsQuotientOf', () => {
    it('should return true if the first number is a quotient of the second', () => {
        const isQuotientOf5 = num.IsQuotientOf(5);
        expect(isQuotientOf5(10)).toBe(true);
        expect(isQuotientOf5(15)).toBe(true);
        expect(isQuotientOf5(7)).toBe(false);
    });
});

describe('IsInt', () => {
    it('should return true if number is Int', () => {
        const ints = [1, 2, 3, 0, 12, -4];
        const floats = [1.2, 1.4, -1.3];
        
        const result = ints.map(IsInt).every(Is(true));
        const result2 = floats.map(IsInt).every(Is(false));
        
        expect(result).toBe(true);
        expect(result2).toBe(true);
    })
})

describe('IsNaN', () => {
    it('should return true if the value is NaN', () => {
        expect(num.IsNaN(NaN)).toBe(true);
        expect(num.IsNaN(123)).toBe(false);
        expect(num.IsNaN("abc")).toBe(false);
    });
});

describe('Eq', () => {
    it('should return true if the numbers are equal', () => {
        const eq5 = num.Eq(5);
        expect(eq5(5)).toBe(true);
        expect(eq5(6)).toBe(false);
    });
});

describe('Gt', () => {
    it('should return true if the second number is greater than the first', () => {
        const gt5 = num.Gt(5);
        expect(gt5(6)).toBe(true);
        expect(gt5(5)).toBe(false);
        expect(gt5(4)).toBe(false);
    });
});

describe('Gte', () => {
    it('should return true if the second number is greater than or equal to the first', () => {
        const gte5 = num.Gte(5);
        expect(gte5(6)).toBe(true);
        expect(gte5(5)).toBe(true);
        expect(gte5(4)).toBe(false);
    });
});

describe('Lt', () => {
    it('should return true if the second number is less than the first', () => {
        const lt5 = num.Lt(5);
        expect(lt5(4)).toBe(true);
        expect(lt5(5)).toBe(false);
        expect(lt5(6)).toBe(false);
    });
});

describe('Lte', () => {
    it('should return true if the second number is less than or equal to the first', () => {
        const lte5 = num.Lte(5);
        expect(lte5(4)).toBe(true);
        expect(lte5(5)).toBe(true);
        expect(lte5(6)).toBe(false);
    });
});

describe('IsPos', () => {
    it('should return true if the number is positive', () => {
        expect(num.IsPos(1)).toBe(true);
        expect(num.IsPos(0)).toBe(false);
        expect(num.IsPos(-1)).toBe(false);
    });
});

describe('IsNeg', () => {
    it('should return true if the number is negative', () => {
        expect(num.IsNeg(-1)).toBe(true);
        expect(num.IsNeg(0)).toBe(false);
        expect(num.IsNeg(1)).toBe(false);
    });
});

describe('IsZero', () => {
    it('should return true if the number is zero', () => {
        expect(num.IsZero(0)).toBe(true);
        expect(num.IsZero(1)).toBe(false);
        expect(num.IsZero(-1)).toBe(false);
    });
});

describe('InRangeInc', () => {
    it('should return true number is in specified range inclusive', () => {
        const betweenOneAndTenInc = num.InRangeInc(1, 10);
        const arrayOfTrue = [
            betweenOneAndTenInc(5),
            betweenOneAndTenInc(1),
            betweenOneAndTenInc(10),
        ];
        
        const False = betweenOneAndTenInc(11);
        const True = arrayOfTrue.reduce(bool.And);

        expect(True).toBe(true);
        expect(False).toBe(false);
    })
})

describe('InRangeEx', () => {
    it('should return true if the number is in the specified range exclusive', () => {
        const inRangeEx = num.InRangeEx(1, 10);
        expect(inRangeEx(5)).toBe(true);
        expect(inRangeEx(1)).toBe(false);
        expect(inRangeEx(10)).toBe(false);
    });
});

describe('Negate', () => {
    it('should return the negated value of the number', () => {
        expect(num.Negate(5)).toBe(-5);
        expect(num.Negate(-5)).toBe(5);
        expect(num.Negate(0)).toBe(-0);
    });
});

describe('Inc', () => {
    it('should return the incremented value of the number', () => {
        expect(num.Inc(5)).toBe(6);
        expect(num.Inc(-5)).toBe(-4);
        expect(num.Inc(0)).toBe(1);
    });
});

describe('Dec', () => {
    it('should return the decremented value of the number', () => {
        expect(num.Dec(5)).toBe(4);
        expect(num.Dec(-5)).toBe(-6);
        expect(num.Dec(0)).toBe(-1);
    });
});

describe('AtMost', () => {
    it('should return the maximum value if the number is greater than the maximum, otherwise return the number', () => {
        const atMost5 = num.AtMost(5);
        expect(atMost5(6)).toBe(5);
        expect(atMost5(5)).toBe(5);
        expect(atMost5(4)).toBe(4);
    });
});

describe('AtLeast', () => {
    it('should return the minimum value if the number is less than the minimum, otherwise return the number', () => {
        const atLeast5 = num.AtLeast(5);
        expect(atLeast5(4)).toBe(5);
        expect(atLeast5(5)).toBe(5);
        expect(atLeast5(6)).toBe(6);
    });
});

describe('Max', () => {
    it('should return the maximum value in the array', () => {
        expect(num.Max([1, 2, 3, 4, 5])).toBe(5);
        expect(num.Max([-1, -2, -3, -4, -5])).toBe(-1);
        expect(num.Max([1, 2, 3, 4, -5])).toBe(4);
    });
});

describe('Min', () => {
    it('should return the minimum value in the array', () => {
        expect(num.Min([1, 2, 3, 4, 5])).toBe(1);
        expect(num.Min([-1, -2, -3, -4, -5])).toBe(-5);
        expect(num.Min([1, 2, 3, 4, -5])).toBe(-5);
    });
});

describe('Clamp', () => {
    it('should return the number if it is within the range, otherwise return the min or max value', () => {
        const clamp1To10 = num.Clamp(1, 10);
        expect(clamp1To10(5)).toBe(5);
        expect(clamp1To10(0)).toBe(1);
        expect(clamp1To10(11)).toBe(10);
    });
});

describe('Floor', () => {
    it('should return the floor of the number', () => {
        expect(num.Floor(5.5)).toBe(5);
        expect(num.Floor(-5.5)).toBe(-6);
        expect(num.Floor(0)).toBe(0);
    });
});

describe('Ceil', () => {
    it('should return the ceil of the number', () => {
        expect(num.Ceil(5.5)).toBe(6);
        expect(num.Ceil(-5.5)).toBe(-5);
        expect(num.Ceil(0)).toBe(0);
    });
});

describe('RoundToInt', () => {
    it('should return the number rounded to the nearest integer', () => {
        expect(num.RoundToInt(5.5)).toBe(6);
        expect(num.RoundToInt(5.4)).toBe(5);
        expect(num.RoundToInt(-5.5)).toBe(-5);
        expect(num.RoundToInt(-5.4)).toBe(-5);
        expect(num.RoundToInt(0)).toBe(0);
    });
});

describe('RoundTo', () => {
    it('should return the number rounded to the specified number of decimals', () => {
        const roundTo2 = num.RoundTo(2);
        expect(roundTo2(5.555)).toBe(5.56);
        expect(roundTo2(5.554)).toBe(5.55);
        expect(roundTo2(-5.555)).toBe(-5.55);
    });
});

describe('RandomInt', () => {
    it('should return a random integer between the specified min and max values', () => {
        for (let i = 0; i < 10; i++) {
            const result = num.RandomInt(1, 10);
            expect(result).toBeGreaterThanOrEqual(1);
            expect(result).toBeLessThanOrEqual(10);
        }
    });
});

describe('Sum', () => {
    it('should return the sum of the numbers in the array', () => {
        expect(num.Sum([1, 2, 3, 4, 5])).toBe(15);
        expect(num.Sum([-1, -2, -3, -4, -5])).toBe(-15);
        expect(num.Sum([1, 2, 3, 4, -5])).toBe(5);
    });
});

describe('Mean', () => {
    it('should return the mean of the numbers in the array', () => {
        expect(num.Mean([1, 2, 3, 4, 5])).toBe(3);
        expect(num.Mean([-1, -2, -3, -4, -5])).toBe(-3);
        expect(num.Mean([1, 2, 3, 4, -5])).toBe(1);
    });
});

describe('Product', () => {
    it('should return the product of the numbers in the array', () => {
        expect(num.Product([1, 2, 3, 4, 5])).toBe(120);
        expect(num.Product([-1, -2, -3, -4, -5])).toBe(-120);
        expect(num.Product([1, 2, 3, 4, -5])).toBe(-120);
    });
});

describe('Add', () => {
    it('should return the sum of two numbers', () => {
        const add5 = num.Add(5);
        expect(add5(6)).toBe(11);
        expect(add5(-6)).toBe(-1);
        expect(add5(0)).toBe(5);
    });
});

describe('Subtr', () => {
    it('should return the difference of two numbers', () => {
        const subtr5 = num.Subtr(5);
        expect(subtr5(6)).toBe(1);
        expect(subtr5(-6)).toBe(-11);
        expect(subtr5(0)).toBe(-5);
    });
});

describe('Diff', () => {
    it('should return the absolute difference of two numbers', () => {
        const diff5 = num.Diff(5);
        expect(diff5(6)).toBe(1);
        expect(diff5(4)).toBe(1);
        expect(diff5(5)).toBe(0);
    });
});

describe('MulBy', () => {
    it('should return the product of two numbers', () => {
        const mulBy5 = num.MulBy(5);
        expect(mulBy5(6)).toBe(30);
        expect(mulBy5(-6)).toBe(-30);
        expect(mulBy5(0)).toBe(0);
    });
});

describe('DivBy', () => {
    it('should return the quotient of two numbers', () => {
        const divBy5 = num.DivBy(5);
        expect(divBy5(10)).toBe(2);
        expect(divBy5(-10)).toBe(-2);
        expect(divBy5(0)).toBe(0);
    });
});

describe('Mod', () => {
    it('should return the modulus of two numbers', () => {
        const mod5 = num.Mod(5);
        expect(mod5(10)).toBe(0);
        expect(mod5(11)).toBe(1);
        expect(mod5(0)).toBe(0);
    });
});

describe('ToExtent', () => {
    it('should return the number raised to the specified extent', () => {
        const toExtent2 = num.ToExtent(2);
        expect(toExtent2(3)).toBe(9);
        expect(toExtent2(-3)).toBe(9);
        expect(toExtent2(0)).toBe(0);
    });
});

describe('ToInt', () => {
    it('should return number without remainder', () => {
        const posResult = num.ToInt(3.14);
        const negResult = num.ToInt(-3.14);
        const zeroResult = num.ToInt(0);

        expect(posResult).toBe(3);
        expect(negResult).toBe(-3);
        expect(zeroResult).toBe(0);
    })
})

describe('Abs', () => {
    it('should return the absolute value of the number', () => {
        expect(num.Abs(-5)).toBe(5);
        expect(num.Abs(5)).toBe(5);
        expect(num.Abs(0)).toBe(0);
    });
});
