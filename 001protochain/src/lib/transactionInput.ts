import * as ecc from 'tiny-secp256k1';
import ECPairFactory, { ECPairInterface } from 'ecpair';
import sha256 from 'crypto-js/sha256';
import Validation from './validation';
import TransactionOutput from './__mocks__/transactionOutput';

const ECpair = ECPairFactory(ecc);

/**
 * TransactionInput Class
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
        this.previousTx = txInout?.previousTx || "";
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
        return sha256(this.previousTx + this.fromAddress + this.amount).toString();
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


        const hash = Buffer.from(this.getHash(), "hex");
        const isValid = ECpair.fromPublicKey(Buffer.from(this.fromAddress, "hex"))
            .verify(hash, Buffer.from(this.signature, "hex"));

        return isValid? new Validation(): new Validation(false, "Invalid input Signature.");    

    }

    /**
     * Constroi input Fake
     * @param txo 
     * @returns 
     */
    static fromTxo(txo: TransactionOutput): TransactionInput{
        return new TransactionInput({
            amount: txo.amount,
            fromAddress: txo.toAddress,
            previousTx: txo.tx
        } as TransactionInput)
    }

}