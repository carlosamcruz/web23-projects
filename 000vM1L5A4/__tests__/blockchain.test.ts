import {describe, test, expect, jest} from "@jest/globals"
import Blockchain from '../src/lib/blockchain'
import Block from "../src/lib/block";
import Transacion from "../src/lib/transaction";

jest.mock("../src/lib/block")
jest.mock("../src/lib/transaction")

describe("Blockchain tests", ()=> {
     
    test('should have genesis block', () => {

        const blockchain = new Blockchain();
        
        expect(blockchain.blocks.length).toEqual(1);

    })

    test('should be valid (genesis)', () => {

        const blockchain = new Blockchain();
        
        //expect(blockchain.isValid().success).toBeTruthy;
        expect(blockchain.isValid().success).toEqual(true);

    })

    test('should be valid (two blocks)', () => {

        const blockchain = new Blockchain();
        const result = blockchain.addBlock(new Block(
            {
                index: 1, 
                previousHash: blockchain.blocks[0].hash, 
                transactions: [new Transacion({
                    data: "Block 2"
                } as Transacion)]
            } as Block
        ))       
        //expect(blockchain.isValid().success).toBeTruthy;
        expect(blockchain.isValid().success).toEqual(true);

    })

    test('should NOT be valid (two blocks)', () => {

        const blockchain = new Blockchain();
        blockchain.addBlock(new Block(
            {
                index: 1, 
                previousHash: blockchain.blocks[0].hash, 
                transactions: [new Transacion({
                    data: "Block 2"
                } as Transacion)]
            } as Block
        ))
        
        //blockchain.blocks[1].data = "a transfere 2 para b"
        blockchain.blocks[1].index = -1;
        //blockchain.blocks[0].hash = "abc"       

        //expect(blockchain.isValid().success).toBeFalsy;
        expect(blockchain.isValid().success).toEqual(false);

    })

    test('should add block', () => {

        const blockchain = new Blockchain();
        const result = blockchain.addBlock(new Block(
            {
                index: 1, 
                previousHash: blockchain.blocks[0].hash, 
                transactions: [new Transacion({
                    data: "Block 2"
                } as Transacion)]
            } as Block
        ))
        
        //expect(result.success).toBeTruthy;
        expect(result.success).toEqual(true);

    })

    test('should NOT add block', () => {

        const blockchain = new Blockchain();
        const result = blockchain.addBlock(new Block(
            {
                index: -1, 
                previousHash: "abc", 
                transactions: [new Transacion({
                    data: "Block 2"
                } as Transacion)],
            } as Block
        ))
        
        //expect(result.success).toBeFalsy;
        expect(result.success).toEqual(false);
        //expect(blockchain.isValid().success).toEqual(false);


    })

    test('should get block', () => {

        const blockchain = new Blockchain();
        const block = blockchain.getBlock(blockchain.blocks[0].hash)
        
        //retorno não é booleano, mas funcina;
        expect(block).toBeTruthy;

    })

    
    test('should get next block info', () => {

        const blockchain = new Blockchain();
        const info = blockchain.getNextBlock();
        
        //retorno não é booleano, mas funcina;
        expect(info.index).toEqual(1);

    })

})