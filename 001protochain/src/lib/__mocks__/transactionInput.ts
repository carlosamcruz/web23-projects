import Validation from '../validation';

/**
 * Mocked TransactionInput Class
 */
export default class TransactionInput {
    fromAddress: string;
    amount: number;
    signature: string;
    previousTx: string;


    /**
     * TransactionInput Class Constructor
     * @param txInout 
     */
    constructor(txInout?: TransactionInput)
    {
        this.previousTx = txInout?.previousTx || "xyz";
        this.fromAddress = txInout?.fromAddress || "carteira1";
        this.amount = txInout?.amount || 10;
        this.signature = txInout?.signature || "abc";
    }

    /**
     * Gerenates Input Signature;
     * @param privateKey 
     */
    sign(privateKey: string): void{

        this.signature = "abc";
    }

    /**
     * Gereates Input Hash;
     * @returns 
     */
    getHash(): string{
        return "abc";
    }

    /**
     * Verifies transaction input validity;
     * @returns 
     */
    isValid(): Validation{

        if(!this.previousTx || !this.signature)
            return new Validation(false, "Signature and PrevOut are required.");

        if(this.amount < 1)
            return new Validation(false, "Ammount should be greater than zero.");

        return new Validation();    

    }

}