import {describe, test, expect, jest} from "@jest/globals"
import Blockchain from '../src/lib/blockchain'
import Block from "../src/lib/block";
import Transacion from "../src/lib/transaction";
import TransactionInput from "../src/lib/transactionInput";

jest.mock("../src/lib/block");
jest.mock("../src/lib/transaction");
jest.mock("../src/lib/transactionInput");

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
                    txInput: new TransactionInput()
                } as Transacion)]
            } as Block
        ));       
        //expect(blockchain.isValid().success).toBeTruthy;
        expect(blockchain.isValid().success).toEqual(true);

    })

    test('should NOT be valid', () => {

        const blockchain = new Blockchain();

        const tx = new Transacion({
            txInput: new TransactionInput()
        } as Transacion);

        blockchain.mempool.push(tx);


        blockchain.addBlock(new Block(
            {
                index: 1, 
                previousHash: blockchain.blocks[0].hash, 
                transactions: [tx]
            } as Block
        ))
        
        //blockchain.blocks[1].data = "a transfere 2 para b"
        blockchain.blocks[1].index = -1;
        //blockchain.blocks[0].hash = "abc"       

        //expect(blockchain.isValid().success).toBeFalsy;
        expect(blockchain.isValid().success).toEqual(false);

    })


    test('should add transaction', () => {

        const blockchain = new Blockchain();

        const tx = new Transacion({
            txInput: new TransactionInput(),
            hash: "xyz" //necessário por conta da mocação
        } as Transacion);

        const validation = blockchain.addTransaction(tx);

        //console.log(validation.message);

        expect(validation.success).toEqual(true);

    })

    test('should NOT add transaction (pending TX)', () => {

        const blockchain = new Blockchain();

        const tx = new Transacion({
            txInput: new TransactionInput(),
            hash: "xyz" //necessário por conta da mocação
        } as Transacion);

        blockchain.addTransaction(tx);



        const tx2 = new Transacion({
            txInput: new TransactionInput(),
            hash: "xyz2" //necessário por conta da mocação
        } as Transacion);

        const validation = blockchain.addTransaction(tx2);

        //console.log(validation.message);

        expect(validation.success).toEqual(false);

    })

    test('should NOT add transaction (invalid tx)', () => {

        const blockchain = new Blockchain();
        const txInput = new TransactionInput();
        txInput.amount = -10;

        const tx = new Transacion({
            txInput,
            //to: "carteiraTo",
            hash: "xyz" //necessário por conta da mocação
        } as Transacion);

        //txInput.amount = -10;

        const validation = blockchain.addTransaction(tx);

        //console.log(validation.message);

        expect(validation.success).toEqual(false);

    })


    test('should NOT add transaction (duplicated in blockhain)', () => {

        const blockchain = new Blockchain();

        const tx = new Transacion({
            txInput: new TransactionInput(),
            hash: "xyz"
        } as Transacion);

        blockchain.blocks.push(new Block({
            transactions: [tx]
        } as Block));


        const validation = blockchain.addTransaction(tx);

        //console.log(validation.message);

        expect(validation.success).toEqual(false);

    })

    /*
    test('should NOT add transaction (duplicated in mempool)', () => {

        const blockchain = new Blockchain();

        const tx = new Transacion({
            txInput: new TransactionInput(),
            hash: "xyz"
        } as Transacion);

        blockchain.mempool.push(tx);

        const validation = blockchain.addTransaction(tx);

        //console.log(validation.message);

        expect(validation.success).toEqual(false);

    })
    */

    test('should get transaction (mempool)', () => {

        const blockchain = new Blockchain();

        const tx = new Transacion({
            txInput: new TransactionInput(),
            hash: "abc"
        } as Transacion);

        blockchain.mempool.push(tx);

        const result = blockchain.getTransaction(tx.hash);

        expect(result.mempoolIndex).toEqual(0);

    })

    test('should get transaction (blockchain)', () => {

        const blockchain = new Blockchain();

        const tx = new Transacion({
            txInput: new TransactionInput(),
            hash: "xyz"
        } as Transacion);

        blockchain.blocks.push(new Block({
            transactions: [tx]
        } as Block));

        const result = blockchain.getTransaction(tx.hash);

        expect(result.blockIndex).toEqual(1);

    })

    test('should NOT get transaction', () => {

        const blockchain = new Blockchain();

        const tx = new Transacion({
            txInput: new TransactionInput(),
            hash: "xyz"
        } as Transacion);

        const result = blockchain.getTransaction(tx.hash);

        expect(result.blockIndex).toEqual(-1);
        expect(result.mempoolIndex).toEqual(-1);


    })


    test('should add block', () => {

        const blockchain = new Blockchain();

        const tx = new Transacion({
            txInput: new TransactionInput(),
        } as Transacion);

        blockchain.mempool.push(tx);


        const result = blockchain.addBlock(new Block(
            {
                index: 1, 
                previousHash: blockchain.blocks[0].hash, 
                transactions: [tx]
            } as Block
        ))
        
        //console.log(result.message);
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
                    txInput: new TransactionInput()
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
        
        blockchain.mempool.push(new Transacion());

        const info = blockchain.getNextBlock();
        //retorno não é booleano, mas funcina;
        expect(info? info.index: 0).toEqual(1);

    })


    test('should NOT get next block info', () => {

        const blockchain = new Blockchain();
        const info = blockchain.getNextBlock();
        
        //retorno não é booleano, mas funcina;
        expect(info).toBeNull();

    })

})