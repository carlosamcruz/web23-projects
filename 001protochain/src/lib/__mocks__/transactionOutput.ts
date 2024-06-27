import Validation from "../validation";

/**
 * Mocked Transaction Ouput Class
 */
export default class TransactionOutput{
    toAddress: string;
    amount: number;
    tx?: string;

    constructor(txOuput?: TransactionOutput){
        this.toAddress = txOuput?.toAddress || "abc";
        this.amount = txOuput?.amount || 10;
        this.tx = txOuput?.tx || "xyz";
    }

    isValid(): Validation{

        if(this.amount < 1)
            return new Validation(false, "Negative amount.");

        return new Validation();
    }

    getHash(): string{
        
        return "abc";
    }
}