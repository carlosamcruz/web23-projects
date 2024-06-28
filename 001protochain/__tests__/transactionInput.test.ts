import {describe, test, expect, beforeAll} from "@jest/globals"
import TransactionInput from "../src/lib/transactionInput";
import TransactionOutput from "../src/lib/transactionOutput";
import Wallet from "../src/lib/wallet";

describe("Transaction Input tests", ()=> {

    let alice: Wallet, bob: Wallet;
    const exampleTx = "0c1b1766126992a69fe89ef01d454aa9169d0b6786ff95466a78371f8506f4a4";

    beforeAll(()=>{
        alice = new Wallet();
        bob = new Wallet();

    })

    test('should be valid', () => {

        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey,
            previousTx: "abc"
        } as TransactionInput);

        txInput.sign(alice.privateKey);

        const valid = txInput.isValid();
        //console.log(valid.message)
        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (defaults)', () => {

        const txInput = new TransactionInput();

        txInput.sign(alice.privateKey);

        const valid = txInput.isValid();
        //console.log(valid.message)
        expect(valid.success).toBeFalsy();
    })


    test('should NOT be valid (empty singature)', () => {

        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey,
            previousTx: "abc"
        } as TransactionInput)

        //txInput.sign(alice.privateKey);

        const valid = txInput.isValid();
        //console.log(valid.message)
        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (negative amount)', () => {

        const txInput = new TransactionInput({
            amount: -10,
            fromAddress: alice.publicKey,
            previousTx: "abc"
        } as TransactionInput)

        txInput.sign(alice.privateKey);

        const valid = txInput.isValid();
        //console.log(valid.message)
        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (invalid singature)', () => {

        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey,
            previousTx: "abc"
        } as TransactionInput)

        txInput.sign(bob.privateKey);

        //txInput.signature = "abc";

        const valid = txInput.isValid();
        //console.log(valid.message)
        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (invalid preVout)', () => {

        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey,
            //previousTx: "abc"
        } as TransactionInput)

        txInput.sign(bob.privateKey);

        //txInput.signature = "abc";

        const valid = txInput.isValid();
        //console.log(valid.message)
        expect(valid.success).toBeFalsy();
    })

    test('Should create from TXO', () => {
        const txi = TransactionInput.fromTxo({
            amount: 10,
            toAddress: alice.publicKey,
            tx: exampleTx
        } as TransactionOutput)
        txi.sign(alice.privateKey);

        txi.amount = 11;
        const result = txi.isValid();
        expect(result.success).toBeFalsy();
    })

})