import sha256 from "crypto-js/sha256";
import Validation from "./validation";
import BlockInfo from "./blockInfo";
import Transacion from "./transaction";
import TransacionType from "./transactionType";

/**
 * Block class
 */
export default class Block{
    index: number;
    transactions: Transacion[];
    previousHash: string;
    timestamp: number;
    hash: string;
    nonce: number;
    miner: string;

    /**
     * Creates a new block
     * @param block the block data
     * M1, L3, A5: The constructor argument is made of the same type of the class; 
     */
    //constructor(index: number, previousHash: string, data: string){
    constructor(block?: Block){
        this.index = block?.index || 0;
        this.transactions = block?.transactions
            ? block.transactions.map(tx => new Transacion(tx))
            : [] as Transacion[];
        this.previousHash = block?.previousHash || "";
        this.timestamp = block?.timestamp || Date.now();
        this.nonce = block?.nonce || 0;
        this.miner = block?.miner || "";
        this.hash = block?.hash || this.getHash();
    }

    /**
     * 
     * @returns Produces the sha256 hash of the block
     */
    getHash(): string{

        const txs = this.transactions && this.transactions.length
            ? this.transactions.map(tx => tx.hash).reduce((a, b) => a + b)
            : "";
        return sha256(this.index + txs + this.timestamp + this.previousHash + this.nonce + this.miner).toString();
    }

    /**
     * Generates a new valid hash for this block with the specified difficulty.
     * @param difficulty The blockchain curren difficulty
     * @param miner The miner address
     */
    mine(difficulty: number, miner: string){
        this.miner = miner;
        //em uma blockchain real o número de zeros é em bits e não em nibbles
        const prefix = new Array(difficulty + 1).join("0");

        this.nonce--;

        do{
            this.nonce++;
            this.hash = this.getHash();
        }while(!this.hash.startsWith(prefix) && this.nonce < 10000000000)
        
        //console.log("Nonce: ", this.nonce)
        //console.log("Prefix: ", prefix)
        //console.log("Difficulty: ", difficulty)
    }

    /**
     * Validates the block
     * @param previousHash The previous block hash 
     * @param previousIndex The previous block index
     * @param difficulty The current blockchain difficulty
     * @returns 
     */
    isValid(previousHash: string, previousIndex: number, difficulty: number): Validation{

        if(this.transactions && this.transactions.length){

            const feeTx = this.transactions.filter(tx => tx.type === TransacionType.FEE);

            if( feeTx.length < 1)
                return new Validation(false, "No fee txs.");

            if( feeTx.length > 1)
                return new Validation(false, "Multiple fee txs.");

            if(!feeTx[0].txOuputs.some(txo => txo.toAddress === this.miner))
                return new Validation(false, "Invalid fee txs: different from miner.");

            //TODO: validação da quantidade de taxas

            const validation = this.transactions.map(tx => tx.isValid());
            const errors = validation.filter(v => !v.success).map(v => v.message)
            
            //if(this.transactions.filter(tx => !tx.isValid().success).length > 0)
            //if(validation.filter(v => !v.success).length > 0)
            if(errors.length > 0)
                return new Validation(false, "invalid tx(s) in this block: " + errors.reduce((a, b)=> a + b));
        }

        if(previousIndex != (this.index - 1)) return new Validation(false, "invalid index."); 
        //if(this.hash != this.getHash()) return new Validation(false, "invalid hash."); 
        if(this.timestamp < 1) return new Validation(false, "invalid timestamp.");
        if(this.previousHash != previousHash) return new Validation(false, "invalid previous hash.");
        if(this.nonce < 1 || !this.miner) return new Validation(false, "Not mined.");

        //em uma blockchain real o número de zeros é em bits e não em nibbles
        const prefix = new Array(difficulty + 1).join("0");
        if(this.hash !== this.getHash() || !this.hash.startsWith(prefix))
            return new Validation(false, "Invalid Hash.");

        return new Validation()
    }

    /**
     * Creates a new block object from BlockInfo;
     * @param blockInfo
     * @returns 
     */
    static fromBlockInfo(blockInfo: BlockInfo): Block{

        const block = new Block();
        block.index = blockInfo.index;
        block.previousHash = blockInfo.previousHash;
        block.transactions = blockInfo.transactions.map(tx => new Transacion(tx));

        return block;
    }



}