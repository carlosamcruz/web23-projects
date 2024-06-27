import Validation from "./validation";
import sha256 from "crypto-js/sha256"

/**
 * Transaction Ouput Class
 */
export default class TransactionOutput{
    toAddress: string;
    amount: number;
    tx?: string;

    constructor(txOuput?: TransactionOutput){
        this.toAddress = txOuput?.toAddress || "";
        this.amount = txOuput?.amount || 0;
        this.tx = txOuput?.tx || "";
    }

    isValid(): Validation{

        if(this.amount < 1)
            return new Validation(false, "Negative amount.");

        return new Validation();
    }

    getHash(): string{
        
        return sha256(this.toAddress + this.amount).toString();
    }
}