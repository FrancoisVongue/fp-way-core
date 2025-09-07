import {bool} from "./index";

describe('bool', () => {
    it('IsBool should return true for boolean values', () => {
        expect(bool.IsBool(true)).toBe(true);
        expect(bool.IsBool(false)).toBe(true);
    });

    it('IsBool should return false for non-boolean values', () => {
        expect(bool.IsBool(1 as any)).toBe(false);
        expect(bool.IsBool('true' as any)).toBe(false);
        expect(bool.IsBool(null as any)).toBe(false);
        expect(bool.IsBool(undefined as any)).toBe(false);
    });

    it('And should return true only if both inputs are true', () => {
        expect(bool.And(true, true)).toBe(true);
        expect(bool.And(true, false)).toBe(false);
        expect(bool.And(false, true)).toBe(false);
        expect(bool.And(false, false)).toBe(false);
    });

    it('Or should return true if either input is true', () => {
        expect(bool.Or(true, true)).toBe(true);
        expect(bool.Or(true, false)).toBe(true);
        expect(bool.Or(false, true)).toBe(true);
        expect(bool.Or(false, false)).toBe(false);
    });

    it('Not should return the opposite of the input', () => {
        expect(bool.Not(true)).toBe(false);
        expect(bool.Not(false)).toBe(true);
    });

    it('Xor should return true if inputs are different', () => {
        expect(bool.Xor(true, true)).toBe(false);
        expect(bool.Xor(true, false)).toBe(true);
        expect(bool.Xor(false, true)).toBe(true);
        expect(bool.Xor(false, false)).toBe(false);
    });

    it('Nand should return the opposite of And', () => {
        expect(bool.Nand(true, true)).toBe(false);
        expect(bool.Nand(true, false)).toBe(true);
        expect(bool.Nand(false, true)).toBe(true);
        expect(bool.Nand(false, false)).toBe(true);
    });

    it('Nor should return the opposite of Or', () => {
        expect(bool.Nor(true, true)).toBe(false);
        expect(bool.Nor(true, false)).toBe(false);
        expect(bool.Nor(false, true)).toBe(false);
        expect(bool.Nor(false, false)).toBe(true);
    });

    it('Xnor should return true if inputs are the same', () => {
        expect(bool.Xnor(true, true)).toBe(true);
        expect(bool.Xnor(true, false)).toBe(false);
        expect(bool.Xnor(false, true)).toBe(false);
        expect(bool.Xnor(false, false)).toBe(true);
    });

    describe('Or', () => {
        it('should return true if either of args is true', () => {
            const True = bool.Or(false, true);
            const False = bool.Or(false, false);

            expect(True).toBe(true);
            expect(False).toBe(false);
        })
    })
});