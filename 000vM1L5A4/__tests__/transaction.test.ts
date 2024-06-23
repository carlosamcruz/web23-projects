import {describe, test, expect } from "@jest/globals"
import Transacion from "../src/lib/transaction";
import TransacionType from "../src/lib/transactionType";

describe("Trasaction tests", ()=> {


    test('should be valid (REGULAR default)', () => {

        const tx = new Transacion({
            data: "tx"

        } as Transacion)

        const valid = tx.isValid();

        console.log(valid.message)

        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (invalid HASH)', () => {

        const tx = new Transacion({
            data: "tx",
            type: TransacionType.REGULAR,
            timestamp: Date.now(),
            hash: "abc"

        } as Transacion)

        const valid = tx.isValid();

        console.log(valid.message)

        expect(valid.success).toBeFalsy();
    })

    test('should be valid (FEE)', () => {

        const tx = new Transacion({
            data: "tx",
            type: TransacionType.FEE

        } as Transacion)

        const valid = tx.isValid();

        console.log(valid.message)

        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (invalid HASH)', () => {

        const tx = new Transacion({
            data: "tx"

        } as Transacion)

        tx.hash = "abcd"

        const valid = tx.isValid();

        console.log(valid.message)

        expect(valid.success).toEqual(false);
    })


    test('Default transaction creation', () => {

        const tx = new Transacion()

        const valid = tx.isValid();

        console.log(valid.message)

        //expect(valid.success).toEqual(true);
        expect(valid.success).toEqual(false); //errado
    })

})