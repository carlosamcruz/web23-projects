import {describe, test, expect, beforeAll} from "@jest/globals"
import TransactionOutput from "../src/lib/transactionOutput";
import Wallet from "../src/lib/wallet";

describe("Transaction Output tests", ()=> {

    let alice: Wallet, bob: Wallet;

    beforeAll(()=>{
        alice = new Wallet();
        bob = new Wallet();

    })

    test('should be valid', () => {

        const txOuputs = new TransactionOutput({
            amount: 10,
            toAddress: alice.publicKey,
            tx: "abc"

        } as TransactionOutput);

        const valid = txOuputs.isValid();
        //console.log(valid.message)
        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (default)', () => {

        const txOuputs = new TransactionOutput();

        //txOuputs.amount = 1;

        const valid = txOuputs.isValid();
        //console.log(valid.message)
        expect(valid.success).toBeFalsy();
    })


    test('should NOT be valid', () => {

        const txOuputs = new TransactionOutput({
            amount: -10,
            toAddress: alice.publicKey,
            tx: "abc"

        } as TransactionOutput);

        const valid = txOuputs.isValid();
        //console.log(valid.message)
        expect(valid.success).toBeFalsy();
    })

    test('should get hash', () => {

        const txOuputs = new TransactionOutput({
            amount: 10,
            toAddress: alice.publicKey,
            tx: "abc"

        } as TransactionOutput);

        const hash = txOuputs.getHash();
        //console.log(valid.message)
        expect(hash).toBeTruthy();
    })

})