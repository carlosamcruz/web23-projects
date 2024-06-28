import {describe, test, expect, jest, beforeAll} from "@jest/globals"
import Blockchain from '../src/lib/blockchain'
import Block from "../src/lib/block";
import Transacion from "../src/lib/transaction";
import TransactionInput from "../src/lib/transactionInput";
import TransactionOuptut from "../src/lib/transactionOutput";

import Wallet from "../src/lib/wallet"

jest.mock("../src/lib/block");
jest.mock("../src/lib/transaction");
jest.mock("../src/lib/transactionInput");
jest.mock("../src/lib/transactionOutput");

describe("Blockchain tests", ()=> {

    let alice: Wallet;
    let bob: Wallet;

    beforeAll(() => {
        alice = new Wallet();
        bob = new Wallet();
    })
     
    test('should have genesis block', () => {

        const blockchain = new Blockchain(alice.publicKey);
        
        expect(blockchain.blocks.length).toEqual(1);

    })

    test('should be valid (genesis)', () => {

        const blockchain = new Blockchain(alice.publicKey);
        
        //expect(blockchain.isValid().success).toBeTruthy;
        expect(blockchain.isValid().success).toEqual(true);

    })

    test('should be valid (two blocks)', () => {

        const blockchain = new Blockchain(alice.publicKey);
        const result = blockchain.addBlock(new Block(
            {
                index: 1, 
                previousHash: blockchain.blocks[0].hash, 
                transactions: [new Transacion({
                    txInputs: [new TransactionInput()]
                } as Transacion)]
            } as Block
        ));       
        //expect(blockchain.isValid().success).toBeTruthy;
        expect(blockchain.isValid().success).toEqual(true);

    })

    test('should NOT be valid', () => {

        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transacion({
            txInputs: [new TransactionInput()]
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

        const blockchain = new Blockchain(alice.publicKey);
        const txo = blockchain.blocks[0].transactions[0];

        const tx = new Transacion();
        tx.hash = "tx";
        tx.txInputs = [new TransactionInput({
            amount: 10,
            previousTx: txo.hash,
            fromAddress: alice.publicKey,
            signature: "abc"
        } as TransactionInput)]

        tx.txOuputs = [new TransactionOuptut({
            amount: 2,
            toAddress: "abc"
        } as TransactionOuptut)]

        const validation = blockchain.addTransaction(tx);

        //console.log(validation.message);

        expect(validation.success).toEqual(true);

    })

    test('Should NOT add transaction (invalid UTXO)', () => {
        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transacion();
        tx.hash = 'tx';
        tx.txInputs = [new TransactionInput({
            amount: 10,
            previousTx: 'wrong',
            fromAddress: alice.publicKey,
            signature: 'abc'
        } as TransactionInput)]

        tx.txOuputs = [new TransactionOuptut({
            amount: 10,
            toAddress: 'abc'
        } as TransactionOuptut)]

        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toBeFalsy();
    })


    test('Should NOT add transaction (pending tx)', () => {
        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transacion();
        tx.hash = 'tx';
        tx.txInputs = [new TransactionInput({
            amount: 10,
            previousTx: 'xyz',
            fromAddress: alice.publicKey,
            signature: 'abc'
        } as TransactionInput)]

        tx.txOuputs = [new TransactionOuptut({
            amount: 10,
            toAddress: 'abc'
        } as TransactionOuptut)]

        blockchain.mempool.push(tx);

        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toBeFalsy();
    })


    test('Should NOT add transaction (invalid tx)', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const txo = blockchain.blocks[0].transactions[0];

        const tx = new Transacion();
        tx.hash = 'tx';
        tx.timestamp = -1;
        tx.txInputs = [new TransactionInput({
            amount: 10,
            previousTx: txo.hash,
            fromAddress: alice.publicKey,
            signature: 'abc'
        } as TransactionInput)]

        tx.txOuputs = [new TransactionOuptut({
            amount: 10,
            toAddress: 'abc'
        } as TransactionOuptut)]

        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toEqual(false);
    })
 

    test('Should NOT add transaction (duplicated in blockchain)', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const tx = blockchain.blocks[0].transactions[0];
        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toEqual(false);
    })

    
    test('should get transaction (mempool)', () => {

        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transacion({
            txInputs: [new TransactionInput()],
            hash: "abc"
        } as Transacion);

        blockchain.mempool.push(tx);

        const result = blockchain.getTransaction(tx.hash);

        expect(result.mempoolIndex).toEqual(0);

    })

    test('should get transaction (blockchain)', () => {

        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transacion({
            txInputs: [new TransactionInput()],
            hash: "xyz"
        } as Transacion);

        blockchain.blocks.push(new Block({
            transactions: [tx]
        } as Block));

        const result = blockchain.getTransaction(tx.hash);

        expect(result.blockIndex).toEqual(1);

    })

    test('should NOT get transaction', () => {

        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transacion({
            txInputs: [new TransactionInput()],
            hash: "xyz"
        } as Transacion);

        const result = blockchain.getTransaction(tx.hash);

        expect(result.blockIndex).toEqual(-1);
        expect(result.mempoolIndex).toEqual(-1);


    })


    test('should add block', () => {

        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transacion({
            txInputs: [new TransactionInput()],
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

    test('should NOT add block (invalid mempool)', () => {

        const blockchain = new Blockchain(alice.publicKey);
        blockchain.mempool.push(new Transacion());
        blockchain.mempool.push(new Transacion());

        const tx = new Transacion({
            txInputs: [new TransactionInput()],
        } as Transacion);

        //blockchain.mempool.push(tx);
        const result = blockchain.addBlock(new Block(
            {
                index: 1, 
                previousHash: blockchain.blocks[0].hash, 
                transactions: [tx]
            } as Block
        ))
        
        //console.log(result.message);
        //expect(result.success).toBeTruthy;
        expect(result.success).toBeFalsy();

    })


    test('should NOT add block', () => {

        const blockchain = new Blockchain(alice.publicKey);
        blockchain.mempool.push(new Transacion());
        const result = blockchain.addBlock(new Block(
            {
                index: -1, 
                previousHash: "abc", 
                transactions: [new Transacion({
                    txInputs: [new TransactionInput()]
                } as Transacion)],
            } as Block
        ))
        
        //console.log("Should not add block: ", result.message)
        //expect(result.success).toBeFalsy;
        expect(result.success).toEqual(false);
        //expect(blockchain.isValid().success).toEqual(false);


    })

    test('should get block', () => {

        const blockchain = new Blockchain(alice.publicKey);
        const block = blockchain.getBlock(blockchain.blocks[0].hash)
        
        //retorno não é booleano, mas funcina;
        expect(block).toBeTruthy;

    })

    
    test('should get next block info', () => {

        const blockchain = new Blockchain(alice.publicKey);
        
        blockchain.mempool.push(new Transacion());

        const info = blockchain.getNextBlock();
        //retorno não é booleano, mas funcina;
        expect(info? info.index: 0).toEqual(1);

    })


    test('should NOT get next block info', () => {

        const blockchain = new Blockchain(alice.publicKey);
        const info = blockchain.getNextBlock();
        
        //retorno não é booleano, mas funcina;
        expect(info).toBeNull();

    })

    test('Should get balance', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const balance = blockchain.getBalance(alice.publicKey);
        expect(balance).toBeGreaterThan(0);
    })

    test('Should get zero balance', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const balance = blockchain.getBalance(bob.publicKey);
        expect(balance).toEqual(0);
    })

    test('Should get UTXO', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const txo = blockchain.blocks[0].transactions[0];

        const tx = new Transacion();
        tx.hash = 'tx';
        tx.txInputs = [new TransactionInput({
            amount: 10,
            previousTx: txo.hash,
            fromAddress: alice.publicKey,
            signature: 'abc'
        } as TransactionInput)]

        tx.txOuputs = [
            new TransactionOuptut({
                amount: 5,
                toAddress: 'abc'
            } as TransactionOuptut),
            new TransactionOuptut({
                amount: 4,
                toAddress: alice.publicKey
            } as TransactionOuptut)
        ]

        blockchain.blocks.push(new Block({
            index: 1,
            transactions: [tx]
        } as Block))

        const utxo = blockchain.getUtxo(alice.publicKey)
        expect(utxo.length).toBeGreaterThan(0);
    })


})