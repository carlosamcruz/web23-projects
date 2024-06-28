import Block from "./block";
import Validation from "../validation";
import BlockInfo from "../blockInfo";
import Transacion from "./transaction";
import TransactionSearch from "../transactionSearch";
import TransactionInput from "./transactionInput";
import TransactionOutput from "./transactionOutput";

/**
 * Mocked Blockchain class
 * 
 */
export default class Blockchain{
    blocks: Block[];
    mempool: Transacion[];
    nextIndex: number = 0;

    static readonly DIFFICULTY_FACTOR: number = 5;
    static readonly MAX_DIFFICULTY: number = 62;


    /**
     * Creates a new mocked Blockchain
     */
    constructor(miner: string){

        this.blocks = []
        this.mempool = [new Transacion()];

        this.blocks.push(new Block(
            {
                index: 0,
                hash: "abc", 
                previousHash: "", 
                miner,
                timestamp: Date.now()
            } as Block
        ));
        this.nextIndex ++;
    }

    /**
     * Gets the last block of this Blockchain
     * @returns returns the last block 
     */
    getLastBlock(): Block{
        return this.blocks[this.blocks.length - 1]
    }

    /**
     * Get current blockchain difficulty
     * @returns 
     */
    getDifficulty(): number{
        return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR)  
    }


    /**
     * Add a block to the blockchain
     * @param block 
     * @returns 
     */
    addBlock(block: Block): Validation{

        if(block.index < 0) return new Validation(false, "Invalid mock block")

        this.blocks.push(block);
        this.nextIndex ++;
        return new Validation();
    }

    /**
     * Add transaction
     * @param transaction 
     * @returns 
     */
    addTransaction(transaction: Transacion): Validation{

        const validation = transaction.isValid(1, 10);
        if(!validation.success)
            return new Validation(false, validation.message);
        this.mempool.push(transaction);
        return new Validation();
    }

    /**
     * Get Transaction
     * @param hash 
     * @returns 
     */
    getTransaction(hash: string): TransactionSearch{

        if(hash === "-1")
            return {mempoolIndex: -1, blockIndex: -1} as TransactionSearch;

        return {
            mempoolIndex: 0,
            transaction: new Transacion()
        } as TransactionSearch;
    }

    /**
     * Get a block from its hash
     * @param hash block hash to search
     * @returns 
     */
    getBlock(hash: string): Block | undefined{

        if(!hash || hash === "-1") return undefined;
        return this.blocks.find(b => b.hash === hash);
    }

    /**
     * Verifies if this blockhain is valid
     * @returns 
     */
    isValid(): Validation{
        return new Validation();
    }

    /**
     * Fee per TX;
     * @returns 
     */
    getFeePerTx(): number{

        return 1;

    }

    /**
     * Get Next Block Info
     * @returns
     */
    getNextBlock(): BlockInfo{
        return {
            transactions: this.mempool.slice(0, 2),
            difficulty: 2, 
            previousHash: this.getLastBlock().hash, 
            index: this.blocks.length, 
            feePerTx: this.getFeePerTx(), 
            maxDifficulty: 62
        } as BlockInfo;
    }   

    /**
     * Get Tx Inputs of a wallet
     * @param wallet
     * @returns 
     */
    getTxInputs(wallet: string): (TransactionInput | undefined)[] {

        return [new TransactionInput({
            amount: 10,
            fromAddress: wallet,
            previousTx: "abc",
            signature: "abc"
        } as TransactionInput)];
    }

    /**
     * Get Tx Outputs of a Wallet
     * @param wallet 
     * @returns 
     */
    getTxOutputs(wallet: string): TransactionOutput[] {

        return [new TransactionOutput({
            amount: 10,
            toAddress: wallet,
            tx: "abc"
        } as TransactionOutput)];
    }

    /**
     * Get Utxo Set of a Wallet
     * @param wallet 
     * @returns 
     */
    getUtxo(wallet: string): TransactionOutput[]{
        
        return this.getTxOutputs(wallet);
    }

    /**
     * Get the Balance of a Wallet
     * @param wallet 
     * @returns 
     */
    getBalance(wallet: string): number {

        return 10;

    }

}