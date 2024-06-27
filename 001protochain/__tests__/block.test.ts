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
    let alice: Wallet;
    let genesis: Block;

    beforeAll(()=> {
        alice = new Wallet();
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
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);

        expect(valid.success).toBeFalsy();
    })

     
    test('should be valid', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: genesis.hash, 
                transactions: [] as Transacion []
            } as Block
        );

        block.transactions.push(new Transacion({
            txOuputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1

            } as TransactionOutput)],
            type: TransacionType.FEE
        } as Transacion));

        block.hash = block.getHash();

        block.mine(exampleDifficuty, alice.publicKey)
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);
        //console.log(valid.message)
        expect(valid.success).toBeTruthy();
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
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);
        //console.log(valid.message)
        expect(valid.success).toBeFalsy();
    })


    test('should NOT be valid (2 FEE TXs)', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: genesis.hash, 
                transactions: [new Transacion({
                    txInputs: [new TransactionInput()],
                    type: TransacionType.FEE
                } as Transacion),
                new Transacion({
                    txInputs: [new TransactionInput()],
                    type: TransacionType.FEE
                } as Transacion)
            ]
            } as Block
        );

        block.mine(exampleDifficuty, alice.publicKey)
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);
        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (invalid TX)', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: genesis.hash, 
                transactions: [new Transacion()]
            } as Block
        );

        //block.transactions[0].txInput.amount = -10;
        block.transactions[0].txOuputs[0].toAddress = "";

        block.transactions.push(new Transacion({
            timestamp: -1,
            txOuputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1

            } as TransactionOutput)],
            type: TransacionType.FEE
        } as Transacion));

        block.hash = block.getHash();

        block.mine(exampleDifficuty, alice.publicKey)
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);

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

        block.transactions.push(new Transacion({
            txOuputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1
            } as TransactionOutput)],
            type: TransacionType.FEE
        } as Transacion));

        block.hash = block.getHash();

        block.mine(exampleDifficuty, alice.publicKey)
        //const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);
        const valid = block.isValid(block.previousHash, block.index - 1, exampleDifficuty);
        //console.log("should create from block info", valid.message)
        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (previosHash)', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: "", 
                transactions: [new Transacion({
                    txInputs: [new TransactionInput()]
                } as Transacion)],
                miner: alice.publicKey
            } as Block
        );
        block.transactions.push(new Transacion({
            txOuputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1
            } as TransactionOutput)],
            type: TransacionType.FEE
        } as Transacion));

        block.hash = block.getHash();
        block.mine(exampleDifficuty, alice.publicKey);
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);

        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (timestamp)', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: "abc", 
                transactions: [new Transacion({
                    txInputs: [new TransactionInput()]
                } as Transacion)],
                miner: alice.publicKey
            } as Block
        );
        block.timestamp = -1;

        block.transactions.push(new Transacion({
            txOuputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1
            } as TransactionOutput)],
            type: TransacionType.FEE
        } as Transacion));

        block.hash = block.getHash();
        block.mine(exampleDifficuty, alice.publicKey);
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);

        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (not mined)', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: genesis.hash, 
                transactions: [new Transacion({
                    txInputs: [new TransactionInput()]
                } as Transacion)],
                miner: alice.publicKey
            } as Block
        );

        block.transactions.push(new Transacion({
            txOuputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1
            } as TransactionOutput)],
            type: TransacionType.FEE
        } as Transacion));

        block.hash = block.getHash();
       
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);
        //console.log("should NOT be valid (not mined)",valid.message)
        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (empty hash)', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: genesis.hash, 
                transactions: [new Transacion({
                    txInputs: [new TransactionInput()]
                } as Transacion)],
                miner: alice.publicKey
            } as Block
        );

        block.transactions.push(new Transacion({
            txOuputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1
            } as TransactionOutput)],
            type: TransacionType.FEE
        } as Transacion));

        block.hash = block.getHash();


        block.mine(exampleDifficuty, alice.publicKey);
        
        block.hash = "";
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);
        //console.log("should NOT be valid (hash)",valid.message)
        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (txInput)', () => {

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
        block.mine(exampleDifficuty, alice.publicKey);

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);

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

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);

        expect(valid.success).toBeFalsy();
    })
    
    test('should NOT be valid (index)', () => {
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

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);

        //console.log("Index: ", valid.message)

        expect(valid.success).toBeFalsy();
    })

})