import {bool} from "./index";

describe('Or', () => {
    it('should return true if either of args is true', () => {
        const True = bool.Or(false, true);
        const False = bool.Or(false, false);

        expect(True).toBe(true);
        expect(False).toBe(false);
    })
})
