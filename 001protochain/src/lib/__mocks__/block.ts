import Validation from "../validation";
import Transacion from "./transaction";

/**
 * Mocked Block class
 */
export default class Block{
    index: number;
    transactions: Transacion[];
    previousHash: string;
    timestamp: number;
    hash: string;
    miner: string;

    /**
     * Creates a mock new block
     * @param block the block data
     * M1, L3, A5: The constructor argument is made of the same type of the class; 
     */
    //constructor(index: number, previousHash: string, data: string){
    constructor(block?: Block){
        this.index = block?.index || 0;
        this.transactions = block?.transactions || [] as Transacion[];
        this.previousHash = block?.previousHash || "";
        this.timestamp = block?.timestamp || Date.now();
        this.miner = block?.miner || "abc";
        this.hash = block?.hash || this.getHash();
    }

    mine(difficulty: number, miner: string){
        this.miner = miner;
    }

    /**
     * 
     * @returns Produces the sha256 hash of the block
     */
    getHash(): string{
        return this.hash || "abc"
    }

    /**
     * Validates the mocked block
     * @param previousHash 
     * @param previousIndex 
     * @returns returns if the block is valid
     */
    isValid(previousHash: string, previousIndex: number, difficulty: number, feePerTx: number): Validation{

        if(!previousHash || previousIndex < 0 || this.index < 0 || !difficulty || !feePerTx) 
            return new Validation(false, "invalid mock block.");
        return new Validation()
    }

}