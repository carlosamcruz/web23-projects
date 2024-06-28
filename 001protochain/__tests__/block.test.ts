import {describe, test, expect, beforeAll, jest} from "@jest/globals"
import Block from '../src/lib/block'
import BlockInfo from "../src/lib/blockInfo";
import Transacion from "../src/lib/transaction";
import TransacionType from "../src/lib/transactionType";
import TransactionInput from "../src/lib/transactionInput";
import TransactionOutput from "../src/lib/transactionOutput";
import Wallet from "../src/lib/wallet";

jest.mock("../src/lib/transaction");
jest.mock("../src/lib/transactionInput");
jest.mock("../src/lib/transactionOutput");

describe("Block tests", ()=> {

    const exampleDifficuty = 1; //Não pode ser zero pois new Array(difficulty + 1).join("0"); precisa de pelo menos 2 elementos;
    const exampleFee = 1;
    const exampleTx = "0c1b1766126992a69fe89ef01d454aa9169d0b6786ff95466a78371f8506f4a4";
    let alice: Wallet;
    let bob: Wallet;
    let genesis: Block;

    beforeAll(()=> {
        alice = new Wallet();
        bob = new Wallet();
        genesis = new Block(
            {
                transactions: [new Transacion({
                    txInputs: [new TransactionInput()]
                } as Transacion)]
            } as Block
        );
    })

    test('should not be valid (fallbacks)', () => {

        const block = new Block();

        block.transactions.push(
            new Transacion({
            txOuputs: [new TransactionOutput()],
            type: TransacionType.FEE
        } as Transacion));

        block.hash = block.getHash();

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty, exampleFee);

        expect(valid.success).toBeFalsy();
    })

    function getFullBlock(): Block{
        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey,
            previousTx: exampleTx
        } as TransactionInput);
        const txOuputs = new TransactionOutput({
            amount: 10,
            toAddress: bob.publicKey,
        } as TransactionOutput);
        const tx = new Transacion({
            txInputs: [txInput],
            txOuputs: [txOuputs]
        } as Transacion);
        const txFee = new Transacion({
            type: TransacionType.FEE,
            txOuputs: [new TransactionOutput({
                amount: 1,
                toAddress: alice.publicKey,
            } as TransactionOutput)]
        } as Transacion);

        const block = new Block({
            index: 1,
            transactions: [tx, txFee],
            previousHash: genesis.hash
        } as Block);

        block.mine(exampleDifficuty, alice.publicKey);

        return block;
    }

     
    test('should be valid', () => {

        const block = getFullBlock();
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty, exampleFee);
        //console.log(valid.message)
        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (different hash)', () => {

        const block = getFullBlock();
        
        block.hash = "abc";
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty, exampleFee);
        //console.log("should NOT be valid (hash)",valid.message)
        expect(valid.success).toBeFalsy();
    })



    test('should NOT be valid (no fee tx)', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: genesis.hash, 
                transactions: [new Transacion({
                    txInputs: [new TransactionInput()]
                } as Transacion)]
            } as Block
        );

        block.mine(exampleDifficuty, alice.publicKey)
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty, exampleFee);
        //console.log(valid.message)
        expect(valid.success).toBeFalsy();
    })


    test('should NOT be valid (2 FEE TXs)', () => {

        const block = getFullBlock();

        const tx = new Transacion({
            txOuputs: [new TransactionOutput()],
            type: TransacionType.FEE
        } as Transacion)

        tx.txInputs = undefined;

        block.transactions.push(tx);
        
        block.mine(exampleDifficuty, alice.publicKey)
        
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty, exampleDifficuty);
        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (invalid TX)', () => {

        const block = getFullBlock();
        block.transactions[0].timestamp = -1;
        
        block.hash = block.getHash();

        block.mine(exampleDifficuty, alice.publicKey)
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty, exampleFee);

        //console.log("should NOT be valid (invalid TX): ", valid.message)
        expect(valid.success).toBeFalsy();
    })


    test('should create from block info', () => {

        const block = Block.fromBlockInfo(
            {
                transactions: [],
                difficulty: exampleDifficuty,
                feePerTx: 1,
                index: 1,
                maxDifficulty: 62,
                previousHash: genesis.hash
            } as BlockInfo
        );

        const tx = new Transacion({
            txOuputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1
            } as TransactionOutput)],
            type: TransacionType.FEE
        } as Transacion)
        block.transactions.push(tx);

        block.hash = block.getHash();

        block.mine(exampleDifficuty, alice.publicKey)
        //const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);
        const valid = block.isValid(block.previousHash, block.index - 1, exampleDifficuty, exampleFee);
        //console.log("should create from block info", valid.message)
        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (previosHash)', () => {

        const block = getFullBlock();
        block.previousHash = "wrong";

        //block.mine(exampleDifficuty, alice.publicKey);
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty, exampleFee);

        //console.log(valid.message);

        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (timestamp)', () => {

        const block = getFullBlock();
        block.timestamp = -1;
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty, exampleFee);
        block.mine(exampleDifficuty, alice.publicKey);

        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (not mined)', () => {

        const block = getFullBlock();
        block.nonce = 0;
       
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty, exampleFee);
        //console.log("should NOT be valid (not mined)",valid.message)
        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (empty hash)', () => {

        const block = getFullBlock();
        block.hash = "";
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty, exampleFee);
        //console.log("should NOT be valid (hash)",valid.message)
        expect(valid.success).toBeFalsy();
    })


    test('should NOT be valid (Invalid fee txs: different from miner.)', () => {

        const txInput = new TransactionInput();
        txInput.amount = -1;
        const block = new Block(
            {
                index: 1, 
                previousHash: "abc", 
                transactions: [new Transacion({
                    txInputs: [txInput]
                } as Transacion)],
            } as Block
        );

        block.transactions.push(new Transacion({
            txOuputs: [new TransactionOutput()],
            type: TransacionType.FEE
        } as Transacion));

        block.hash = block.getHash();
        //block.mine(exampleDifficuty, exampleMiner);

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty, exampleFee);

        expect(valid.success).toBeFalsy();
    })
    
    test('should NOT be valid (index)', () => {
        
        const block = getFullBlock();

        block.index = -1;
        /*
        const block = new Block(
            {
                index: -1, 
                previousHash: "", 
                transactions: [new Transacion({
                    txInputs: [new TransactionInput()]
                } as Transacion)],
                miner: alice.publicKey
            } as Block
        );

        block.transactions.push(new Transacion({
            txOuputs: [new TransactionOutput()],
            type: TransacionType.FEE
        } as Transacion));

        block.hash = block.getHash();

        block.mine(exampleDifficuty, alice.publicKey);

        */

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty, exampleFee);

        //console.log("Index: ", valid.message)

        expect(valid.success).toBeFalsy();
    })

})