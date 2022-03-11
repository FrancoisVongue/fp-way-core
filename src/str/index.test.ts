import { IsOfType } from "../core";
import {str} from "./index";

describe('ConcatWith', () => {
    it('should concat two strings', () => {
        const hello = 'hello';
        const world = ' world';
        const plusWorld = str.ConcatWith(world);
        const hw = plusWorld(hello);
        
        expect(hw).toBe(hello + world);
    })
})

describe('Matches', () => {
    it('should check whether string matches regex', () => {
        const email = 'hello@mail.com'
        const notEmail = 'random string';
        const emailRegex = /.*@\w{1,6}\.\w{2,5}$/;
        const matchesEmail = str.Matches(emailRegex);
        
        const True = matchesEmail(email);
        const False = matchesEmail(notEmail);

        expect(True).toBe(true);
        expect(False).toBe(false);
    })
})

describe('OccurrencesOf', () => {
    it('should return every occurrence of the pattern', () => {
        const threeMoo = `"Moooo". Who said that? It was a cow, they moo all the time. "Moooooo"`;
        const mooRegex = /[Mm]o+/;
        const Moos = str.OccurrencesOf(mooRegex, threeMoo);
        
        expect(Moos.length).toBe(3);
    });
    it('should return an empty array in case of no matches', () => {
        const text = `some words are loud`;
        const reg = /what?/;
        const occurences = str.OccurrencesOf(reg, text);
        
        const isArray = IsOfType("array", occurences);
        const isEmpty = occurences?.length === 0;
        
        expect(isArray).toBe(true);
        expect(isEmpty).toBe(true);
    })
});
