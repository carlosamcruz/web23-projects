import {describe, test, expect, jest, beforeAll } from "@jest/globals"
import Transacion from "../src/lib/transaction";
import TransacionType from "../src/lib/transactionType";
import TransactionInput from "../src/lib/transactionInput";
import TransactionOutput from "../src/lib/transactionOutput";
import Wallet from "../src/lib/wallet";

jest.mock("../src/lib/transactionInput");
jest.mock("../src/lib/transactionOutput");

describe("Trasaction tests", ()=> {

    const exampleDifficuty: number = 1;
    const exampleFee: number = 1;
    const exampleTx = "0c1b1766126992a69fe89ef01d454aa9169d0b6786ff95466a78371f8506f4a4";
    let alice: Wallet;
    let bob: Wallet;


    beforeAll(() => {
        alice = new Wallet();
        bob = new Wallet();

    })



    test('should be valid (REGULAR default)', () => {

        const tx = new Transacion({
            txInputs: [new TransactionInput()],
            txOuputs: [new TransactionOutput()]

        } as Transacion)

        const valid = tx.isValid(exampleDifficuty, exampleFee);

        //console.log(valid.message)

        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (txo hash != tx hash)', () => {

        const tx = new Transacion({
            txInputs: [new TransactionInput()],
            txOuputs: [new TransactionOutput()]

        } as Transacion)

        tx.txOuputs[0].tx = "abcabcabcabc"
        
        const valid = tx.isValid(exampleDifficuty, exampleFee);

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

        const valid = tx.isValid(exampleDifficuty, exampleFee);

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

        const valid = tx.isValid(exampleDifficuty, exampleFee);

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

        const valid = tx.isValid(exampleDifficuty, exampleFee);

        //console.log(valid.message)

        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (invalid HASH)', () => {

        const tx = new Transacion({
            txInputs: [new TransactionInput()],
            txOuputs: [new TransactionOutput()]

        } as Transacion)

        tx.hash = "abcd"

        const valid = tx.isValid(exampleDifficuty, exampleFee);

        //console.log(valid.message)

        expect(valid.success).toEqual(false);
    })

    test('Should NOT be valid (invalid to)', () => {

        const tx = new Transacion();
        const valid = tx.isValid(exampleDifficuty, exampleFee);
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

        const valid = tx.isValid(exampleDifficuty, exampleFee);
        //console.log(valid.message)

        //expect(valid.success).toEqual(true);
        expect(valid.success).toEqual(false); //errado
    })

    test('Should get fee', () => {

        const txIn = new TransactionInput({
            amount: 11,
            fromAddress: alice.publicKey,
            previousTx: exampleTx

        } as TransactionInput);

        txIn.sign(alice.privateKey);

        const txOuts = new TransactionOutput({
            amount: 10,
            toAddress: bob.publicKey,
        } as TransactionOutput);

        const tx = new Transacion({
            txInputs: [txIn],
            txOuputs: [txOuts]
        } as Transacion);

        const result = tx.getFee();

        expect(result).toBeGreaterThan(0);

    })

    test('Should get zero fee', () => {

        const tx = new Transacion();

        tx.txInputs = undefined;

        const result = tx.getFee();

        expect(result).toBe(0);

    })

    test('Should create from reward', () => {
        const tx = Transacion.fromReward({
            amount: 10,
            toAddress: alice.publicKey,
            tx: exampleTx
        } as TransactionOutput)

        const result = tx.isValid(exampleDifficuty, exampleFee);
        expect(result.success).toBeTruthy();
    })

    test('Should NOT be valid (fee excess)', () => {
        const txOut = new TransactionOutput({
            amount: Number.MAX_VALUE,
            toAddress: bob.publicKey
        } as TransactionOutput)

        const tx = new Transacion({
            type: TransacionType.FEE,
            txOuputs: [txOut]
        } as Transacion)
        

        const result = tx.isValid(exampleDifficuty, exampleFee);
        expect(result.success).toBeFalsy();
    })




})