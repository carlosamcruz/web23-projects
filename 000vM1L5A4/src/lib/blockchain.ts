import Block from "./block";
import Validation from "./validation";
import BlockInfo from "./blockInfo";
import Transacion from "./transaction";
import TransacionType from "./transactionType";

/**
 * Blockchain class
 * 
 */
export default class Blockchain{
    blocks: Block[];
    nextIndex: number = 0;
    //Static - mesmo elemento para todos os objetos da classe (variável global)
    static readonly DIFFICULTY_FACTOR: number = 100;
    static readonly MAX_DIFFICULTY: number = 62;


    /**
     * Creates a new Blockchain
     */
    constructor(){
        this.blocks = [new Block(
            {
                index: this.nextIndex, 
                previousHash: "", 
                //data: "Genesis Block"
                transactions: [ new Transacion(
                    {
                        type: TransacionType.FEE,
                        data: (new Date).toString()
                    } as Transacion)]
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
        const lastBlock = this.getLastBlock();
        const validation = block.isValid(lastBlock.hash, lastBlock.index, this.getDifficulty());
        if(!validation.success) 
            return new Validation(false, `Invalid block #${lastBlock.index}: ${validation.message}`);

        this.blocks.push(block);
        this.nextIndex ++;
        return new Validation();
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
        for(let i = this.blocks.length - 1; i > 0; i--){
            const currentBlock = this.blocks[i];
            const previousBlock = this.blocks[i -1];
            const validation = currentBlock.isValid(previousBlock.hash, previousBlock.index, this.getDifficulty());
            if(!validation.success) 
                return new Validation(false, `Invalid block #${currentBlock.index}:  + ${validation.message}`) 
        }
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

        //const data = new Date.toString()
        //const transactions = (new Date).toString();
        const transactions = [new Transacion(
            {
                data: (new Date).toString()
            } as Transacion)];

        const difficulty = this.getDifficulty();
        const previousHash = this.getLastBlock().hash;
        const index = this.blocks.length;
        const feePerTx = this.getFeePerTx(); 

        const maxDifficulty = Blockchain.MAX_DIFFICULTY;

        return {transactions, difficulty, previousHash, index, feePerTx, maxDifficulty} as BlockInfo;
    }
}