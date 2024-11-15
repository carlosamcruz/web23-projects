import Block from "./block";
import Validation from "./validation";
import BlockInfo from "./blockInfo";
import Transacion from "./transaction";
import TransacionType from "./transactionType";
import TransactionSearch from "./transactionSearch";
import TransactionOutput from "./transactionOutput";
import TransactionInput from "./transactionInput";

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
    constructor(miner: string){
        this.blocks = [];
        this.mempool = [];
        const genesis = this.createGenesisBlock(miner);
        this.blocks.push(genesis);
        this.nextIndex ++;
    }

    /**
     * Create a Genesis Block
     * @param miner
     * @returns 
     */
    createGenesisBlock(miner: string): Block{
        const amount = Blockchain.getRewardAmount(this.getDifficulty());

        const tx = Transacion.fromReward(
            new TransactionOutput({
                amount,
                toAddress: miner
            } as TransactionOutput));

        tx.hash = tx.getHash();
        tx.txOuputs[0].tx = tx.hash;

        const block = new Block();
        block.transactions = [tx];
        block.mine(this.getDifficulty(), miner);

        return block;
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


        const nextBlock = this.getNextBlock();
        if(!nextBlock)
            return new Validation(false, "There is no next block info.")

        const validation = block.isValid(nextBlock.previousHash, nextBlock.index - 1, nextBlock.difficulty, nextBlock.feePerTx);
        if(!validation.success) 
            return new Validation(false, `Invalid block #${nextBlock.index}: ${validation.message}`);


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
        if(transaction.txInputs && transaction.txInputs.length > 0){
            const from = transaction.txInputs[0].fromAddress; //Se usar outra carteira tem que refinar
            //! é usado quando se tem certeza que vai encontrar a informação, e ? quando não temos certeza
            const pendingTx = this.mempool
                .filter(tx => tx.txInputs && tx.txInputs.length > 0)
                .map(tx => tx.txInputs) // array de arrays
                .flat()
                .filter( txi => txi!.fromAddress === from);
            if(pendingTx && pendingTx.length)
                return new Validation(false, "This wallet has a pending TX.");

            //DONE: verificar a origem dos fundos (UTXO)
            const utxo = this.getUtxo(from);

            for(let i = 0; i < transaction.txInputs.length; i++){
                const txi = transaction.txInputs[i];

                if(utxo.findIndex(txo => txo.tx === txi.previousTx && txo.amount >= txi.amount) === -1)
                    return new Validation(false, 'Invalid tx: The TXO already spend or inexistent.')
            }

        }

        //Done: fazer versão final que valida as taxas
        const validation = transaction.isValid(this.getDifficulty(), this.getFeePerTx());

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
            const validation = currentBlock.isValid(previousBlock.hash, previousBlock.index, this.getDifficulty(), this.getFeePerTx());
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


    /**
     * Get Tx Inputs of a wallet
     * @param wallet
     * @returns 
     */
    getTxInputs(wallet: string): (TransactionInput | undefined)[] {

        return this.blocks
            .map(b => b.transactions)
            .flat()
            .filter( tx => tx.txInputs && tx.txInputs.length)
            .map(tx => tx.txInputs)
            .flat()
            .filter(txi => txi!.fromAddress === wallet);
    }

    /**
     * Get Tx Outputs of a Wallet
     * @param wallet 
     * @returns 
     */
    getTxOutputs(wallet: string): TransactionOutput[] {

        return this.blocks
            .map(b => b.transactions)
            .flat()
            .filter( tx => tx.txOuputs && tx.txOuputs.length)
            .map(tx => tx.txOuputs)
            .flat()
            .filter(txo => txo!.toAddress === wallet);
    }

    /**
     * Get Utxo Set of a Wallet
     * @param wallet 
     * @returns 
     */
    getUtxo(wallet: string): TransactionOutput[]{
        const txIns = this.getTxInputs(wallet);
        const txOuts = this.getTxOutputs(wallet);

        if( !txIns || !txIns.length )
            return txOuts;

        txIns.forEach(txi => {
            const index = txOuts.findIndex(txo => txo.tx === txi!.previousTx);
            //const index = txOuts.findIndex(txo => txo.amount === txi!.amount);
            txOuts.splice(index, 1);
        })

        return txOuts;
    }

    /**
     * Get the Balance of a Wallet
     * @param wallet 
     * @returns 
     */
    getBalance(wallet: string): number {

        const utxo = this.getUtxo(wallet);
        if(!utxo || !utxo.length)
            return 0;

        return utxo.reduce((a, b) => a + b.amount, 0);

    }

    static getRewardAmount(difficulty: number): number{
        return (64 - difficulty) * 10;

    }
}