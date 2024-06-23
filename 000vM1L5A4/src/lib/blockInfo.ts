import Transacion from "./transaction";

/**
 * The Block Info Interface
 */
export default interface BlockInfo{
    index: number;
    previousHash: string;
    difficulty: number;
    maxDifficulty: number;
    feePerTx: number;
    transactions: Transacion[];
}