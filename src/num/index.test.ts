import {num} from "./index";
import {bool} from "../bool";
import IsInt = num.IsInt;
import {Is} from "../core";

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
