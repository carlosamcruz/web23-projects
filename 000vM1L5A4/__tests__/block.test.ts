import {describe, test, expect, beforeAll, jest} from "@jest/globals"
import Block from '../src/lib/block'
import BlockInfo from "../src/lib/blockInfo";
import Transacion from "../src/lib/transaction";
import TransacionType from "../src/lib/transactionType";

jest.mock("../src/lib/transaction")

describe("Block tests", ()=> {

    const exampleDifficuty = 1; //Não pode ser zero pois new Array(difficulty + 1).join("0"); precisa de pelo menos 2 elementos;
    const exampleMiner = "Luiz"
    let genesis: Block;

    beforeAll(()=> {
        genesis = new Block(
            {
                transactions: [new Transacion({
                    data: "Genesis Block"
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
                transactions: [new Transacion({
                    data: "block 2"
                } as Transacion)]
            } as Block
        );

        block.mine(exampleDifficuty, exampleMiner)
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);
        console.log(valid.message)
        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (2 FEE TXs)', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: genesis.hash, 
                transactions: [new Transacion({
                    data: "fee 1",
                    type: TransacionType.FEE
                } as Transacion),
                new Transacion({
                    data: "fee 2",
                    type: TransacionType.FEE
                } as Transacion)
            ]
            } as Block
        );

        block.mine(exampleDifficuty, exampleMiner)
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

        block.mine(exampleDifficuty, exampleMiner)
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);
        expect(valid.success).toBeFalsy();
    })


    test('should create from block info', () => {

        const block = Block.fromBlockInfo(
            {
                transactions: [new Transacion({
                    data: "Block 2"
                } as Transacion)],
                difficulty: exampleDifficuty,
                feePerTx: 1,
                index: 1,
                maxDifficulty: 62,
                previousHash: genesis.hash
            } as BlockInfo
        );

        block.mine(exampleDifficuty, exampleMiner)
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);
        console.log(valid.message)
        expect(valid.success).toBeTruthy();
    })

    test('should NOT be valid (previosHash)', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: "", 
                transactions: [new Transacion({
                    data: "Block 2"
                } as Transacion)],
            } as Block
        );
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);

        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (timestamp)', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: "abc", 
                transactions: [new Transacion({
                    data: "Block 2"
                } as Transacion)],
            } as Block
        );
        block.timestamp = -1;
        block.hash = block.getHash()
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);

        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (not mined)', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: genesis.hash, 
                transactions: [new Transacion({
                    data: "Block 2"
                } as Transacion)],
            } as Block
        );
       
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
                    data: "Block 2"
                } as Transacion)],
            } as Block
        );

        block.mine(exampleDifficuty, exampleMiner);
        
        block.hash = "";
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);
        //console.log("should NOT be valid (hash)",valid.message)
        expect(valid.success).toBeFalsy();
    })

    test('should NOT be valid (data)', () => {

        const block = new Block(
            {
                index: 1, 
                previousHash: "abc", 
                transactions: [new Transacion({
                    data: ""
                } as Transacion)],
            } as Block
        );
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);

        expect(valid.success).toBeFalsy();
    })
    
    test('should NOT be valid (index)', () => {
        const block = new Block(
            {
                index: -1, 
                previousHash: "", 
                transactions: [new Transacion({
                    data: "Block 2"
                } as Transacion)]
            } as Block
        );
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficuty);

        expect(valid.success).toBeFalsy();
    })

})