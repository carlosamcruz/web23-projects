import {describe, test, expect, beforeAll} from "@jest/globals"
import TransactionInput from "../src/lib/transactionInput";
import Wallet from "../src/lib/wallet";

describe("Transaction Input tests", ()=> {

    let alice: Wallet, bob: Wallet;

    beforeAll(()=>{
        alice = new Wallet();
        bob = new Wallet();

    })

    test('should be valid', () => {

        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey,

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

        } as TransactionInput)

        txInput.sign(bob.privateKey);

        //txInput.signature = "abc";

        const valid = txInput.isValid();
        //console.log(valid.message)
        expect(valid.success).toBeFalsy();
    })

})