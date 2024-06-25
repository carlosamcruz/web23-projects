import Block from "./block";
import Validation from "./validation";
import BlockInfo from "./blockInfo";
import Transacion from "./transaction";
import TransacionType from "./transactionType";
import TransactionSearch from "./transactionSearch";
import TransactionInput from "./__mocks__/transactionInput";

/**
 * Blockchain class
 * 
 */
export default class Blockchain{
    mempool: Transacion[];
    blocks: Block[];
    nextIndex: number = 0;
    //Static - mesmo elemento para todos os objetos da classe (variável global)
    static readonly DIFFICULTY_FACTOR: number = 100;
    static readonly MAX_DIFFICULTY: number = 62;
    static readonly TX_PER_BLOCK: number = 2;


    /**
     * Creates a new Blockchain
     */
    constructor(){
        this.mempool = [];
        this.blocks = [new Block(
            {
                index: this.nextIndex, 
                previousHash: "", 
                //data: "Genesis Block"
                transactions: [ new Transacion(
                    {
                        type: TransacionType.FEE,
                        //data: (new Date).toString()
                        txInput: new TransactionInput()
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
        return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR) + 1;  
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


        const txs = block.transactions.filter(tx => tx.type !== TransacionType.FEE).map(tx => tx.hash);
        const newMempool = this.mempool.filter(tx => !txs.includes(tx.hash));
        if(newMempool.length + txs.length !== this.mempool.length)
            return new Validation(false, 'Invalid tx in block (mempool)');

        this.mempool = newMempool;

        this.blocks.push(block);
        this.nextIndex ++;
        return new Validation(true, block.hash);
    }

    /**
     * Add transaction in the mempool
     * @param transaction 
     * @returns 
     */
    addTransaction(transaction: Transacion): Validation{
        if(transaction.txInput){
            const from = transaction.txInput.fromAddress;
            //! é usado quando se tem certeza que vai encontrar a informação, e ? quando não temos certeza
            const pendingTx = this.mempool.map(tx => tx.txInput).filter( txi => txi!.fromAddress === from);
            if(pendingTx && pendingTx.length)
                return new Validation(false, "This wallet has a pending TX.");

            //TODO: verificar a origem dos fundos
        }
        const validation = transaction.isValid();

        if(!validation.success)
            return new Validation(false, "Invalid tx: " + validation.message);

        //console.log(this.blocks[0].transactions)
        //console.log(this.blocks[1].transactions)
        if(this.blocks.some(b => b.transactions.some(tx => tx.hash === transaction.hash)))
            return new Validation(false, "Duplicated tx in the blockchain.");

        /*
        if(this.mempool.some(tx => tx.hash === transaction.hash))
            return new Validation(false, "Duplicated tx in the mempool.");
        */

        
        this.mempool.push(transaction);
        return new Validation(true, transaction.hash);
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
     * Get transaction from mempool or block
     * @param hash 
     * @returns 
     */
    getTransaction(hash: string): TransactionSearch{

        const mempoolIndex = this.mempool.findIndex(tx => tx.hash === hash);

        if(mempoolIndex !== -1)
            return {
                mempoolIndex,
                transaction: this.mempool[mempoolIndex]
            } as TransactionSearch;

        const blockIndex = this.blocks.findIndex( b => b.transactions.some(tx => tx.hash === hash));

        if(blockIndex !== -1)
            return {
                blockIndex,
                transaction: this.blocks[blockIndex].transactions.find(tx => tx.hash === hash)
            } as TransactionSearch;

        return { mempoolIndex: -1, blockIndex: -1 } as TransactionSearch;
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
    getNextBlock(): BlockInfo | null{

        if(!this.mempool || !this.mempool.length)
            return null;

        //const data = new Date.toString()
        //const transactions = (new Date).toString();
        const transactions = this.mempool.slice(0, Blockchain.TX_PER_BLOCK);

        const difficulty = this.getDifficulty();
        const previousHash = this.getLastBlock().hash;
        const index = this.blocks.length;
        const feePerTx = this.getFeePerTx(); 

        const maxDifficulty = Blockchain.MAX_DIFFICULTY;

        return {transactions, difficulty, previousHash, index, feePerTx, maxDifficulty} as BlockInfo;
    }
}