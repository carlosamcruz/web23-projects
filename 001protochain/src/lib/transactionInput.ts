import * as ecc from 'tiny-secp256k1';
import ECPairFactory, { ECPairInterface } from 'ecpair';
import sha256 from 'crypto-js/sha256';
import Validation from './validation';

const ECpair = ECPairFactory(ecc);

/**
 * TransactionInput Class
 */
export default class TransactionInput {
    fromAddress: string;
    amount: number;
    signature: string;

    /**
     * TransactionInput Class Constructor
     * @param txInout 
     */
    constructor(txInout?: TransactionInput)
    {
        this.fromAddress = txInout?.fromAddress || "";
        this.amount = txInout?.amount || 0;
        this.signature = txInout?.signature || "";
    }

    /**
     * Gerenates Input Signature;
     * @param privateKey 
     */
    sign(privateKey: string): void{

        this.signature = ECpair.fromPrivateKey(Buffer.from(privateKey, "hex"))
            .sign(Buffer.from(this.getHash(), "hex"))
            .toString("hex");
    }

    /**
     * Gereates Input Hash;
     * @returns 
     */
    getHash(): string{
        return sha256(this.fromAddress + this.amount).toString();
    }

    /**
     * Verifies transaction input validity;
     * @returns 
     */
    isValid(): Validation{

        if(!this.signature)
            return new Validation(false, "Signature is required.");

        if(this.amount < 1)
            return new Validation(false, "Ammount should be greater than zero.");


        const hash = Buffer.from(this.getHash(), "hex");
        const isValid = ECpair.fromPublicKey(Buffer.from(this.fromAddress, "hex"))
            .verify(hash, Buffer.from(this.signature, "hex"));

        return isValid? new Validation(): new Validation(false, "Invalid input Signature.");    

    }

}