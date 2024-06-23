import Block from "./block";
import Validation from "../validation";
import BlockInfo from "../blockInfo";
import Transacion from "./transaction";
import TransacionType from "../transactionType";
import TransactionSearch from "../transactionSearch";

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
    constructor(){
        this.mempool = [];
        this.blocks = [new Block(
            {
                index: 0,
                hash: "abc", 
                previousHash: "", 
                transactions: [new Transacion({
                    data: "Genesis Block",
                    type: TransacionType.FEE
                } as Transacion)],
                timestamp: Date.now()
            } as Block
        )];
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

        const validation = transaction.isValid();
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
        return {
            mempoolIndex: 0,
            transaction: {
                hash
            }
        } as TransactionSearch;
    }

    /**
     * Get a block from its hash
     * @param hash block hash to search
     * @returns 
     */
    getBlock(hash: string): Block | undefined{
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
            transactions: [new Transacion({
                data: (new Date).toString()
            } as Transacion)],
            difficulty: 1, 
            previousHash: this.getLastBlock().hash, 
            index: 1, 
            feePerTx: this.getFeePerTx(), 
            maxDifficulty: 62
        } as BlockInfo;
    }   
}