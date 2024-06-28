import TransactionInput from "./transactionInput";
import TransacionType from "../transactionType";
import Validation from "../validation";
import TransactionOutput from "./transactionOutput";
/**
 * Mocked Transaction Class
 */
export default class Transacion {

    type: TransacionType;
    timestamp: number;
    hash: string;

    txInputs: TransactionInput[] | undefined;
    txOuputs: TransactionOutput[];


    constructor(tx?: Transacion){
        this.type = tx?.type || TransacionType.REGULAR;
        this.timestamp = tx?.timestamp || Date.now();

        this.txInputs = tx?.txInputs || [new TransactionInput()];
        this.txOuputs = tx?.txOuputs || [new TransactionOutput()];

        this.hash = tx?.hash || this.getHash();

        //this.txOuputs.forEach((txo, index, arr) => arr[index].tx = this.hash)    
    }

    getHash() : string {
        return "abc";
    }

    isValid(difficulty: number, totalFee: number): Validation{

        if(this.timestamp < 1 || !this.hash || difficulty < 1 || totalFee < 0)
            return new Validation(false, "Invalid mock transaction.");

        return new Validation();

    }

    static fromReward(txo: TransactionOutput): Transacion{
        const tx = new Transacion({
            type: TransacionType.FEE,
            txOuputs: [txo]
        } as Transacion);

        tx.txInputs = undefined;
        tx.hash = tx.getHash();
        tx.txOuputs[0].tx = tx.hash;
        return tx;
    }

}