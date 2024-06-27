import {describe, test, expect, jest } from "@jest/globals"
import Transacion from "../src/lib/transaction";
import TransacionType from "../src/lib/transactionType";
import TransactionInput from "../src/lib/transactionInput";
import TransactionOutput from "../src/lib/transactionOutput";

jest.mock("../src/lib/transactionInput");
jest.mock("../src/lib/transactionOutput");

describe("Trasaction tests", ()=> {


    test('should be valid (REGULAR default)', () => {

        const tx = new Transacion({
            txInputs: [new TransactionInput()],
            txOuputs: [new TransactionOutput()]

        } as Transacion)

        const valid = tx.isValid();

        //console.log(valid.message)

        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (txo hash != tx hash)', () => {

        const tx = new Transacion({
            txInputs: [new TransactionInput()],
            txOuputs: [new TransactionOutput()]

        } as Transacion)

        tx.txOuputs[0].tx = "abcabcabcabc"
        
        const valid = tx.isValid();

        //console.log(valid.message)

        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (input < output)', () => {

        const tx = new Transacion({
            txInputs: [new TransactionInput({
                amount: 1
            } as TransactionInput)],
            txOuputs: [new TransactionOutput({
                amount: 2
            } as TransactionOutput)]

        } as Transacion)

        const valid = tx.isValid();

        //console.log(valid.message)

        expect(valid.success).toBeFalsy();
    })


    test('should NOT be valid (invalid HASH)', () => {

        const tx = new Transacion({
            txInputs: [new TransactionInput()],
            txOuputs: [new TransactionOutput()],
            type: TransacionType.REGULAR,
            timestamp: Date.now(),
            hash: "abc"

        } as Transacion)

        const valid = tx.isValid();

        //console.log(valid.message)

        expect(valid.success).toBeFalsy();
    })

    test('should be valid (FEE)', () => {

        const tx = new Transacion({
            //txInput: new TransactionInput(),
            txOuputs: [new TransactionOutput()],
            type: TransacionType.FEE

        } as Transacion)

        tx.txInputs = undefined;
        tx.hash = tx.getHash();

        const valid = tx.isValid();

        //console.log(valid.message)

        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (invalid HASH)', () => {

        const tx = new Transacion({
            txInputs: [new TransactionInput()],
            txOuputs: [new TransactionOutput()]

        } as Transacion)

        tx.hash = "abcd"

        const valid = tx.isValid();

        //console.log(valid.message)

        expect(valid.success).toEqual(false);
    })

    test('Should NOT be valid (invalid to)', () => {

        const tx = new Transacion();
        const valid = tx.isValid();
        //console.log(valid.message)

        //expect(valid.success).toEqual(true);
        expect(valid.success).toEqual(false); //errado
    })

    test('Should NOT be valid (invalid txInput)', () => {

        const tx = new Transacion({
            txOuputs: [new TransactionOutput()],
            txInputs: [new TransactionInput({
                amount: -10,
                fromAddress: "carteiraFrom",
                signature: "abc"
            } as TransactionInput)]
        } as Transacion);

        const valid = tx.isValid();
        //console.log(valid.message)

        //expect(valid.success).toEqual(true);
        expect(valid.success).toEqual(false); //errado
    })

})