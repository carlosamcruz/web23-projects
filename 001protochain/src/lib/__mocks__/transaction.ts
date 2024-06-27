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

    isValid(): Validation{

        if(this.timestamp < 1 || !this.hash)
            return new Validation(false, "Invalid mock transaction.");

        return new Validation();

    }

}