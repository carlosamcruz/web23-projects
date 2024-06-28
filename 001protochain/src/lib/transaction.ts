import sha256 from "crypto-js/sha256";
import TransacionType from "./transactionType";
import Validation from "./validation";
import TransactionInput from "./transactionInput";
import TransactionOutput from "./transactionOutput";
import Blockchain from "./blockchain";
/**
 * Class Transaction
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

        this.txInputs = tx?.txInputs
        ? tx.txInputs.map(txi => new TransactionInput(txi))
        : undefined;

        this.txOuputs = tx?.txOuputs
        ? tx.txOuputs.map(txo => new TransactionOutput(txo))
        : [];

        this.hash = tx?.hash || this.getHash();

        this.txOuputs.forEach((txo, index, arr) => arr[index].tx = this.hash)
    }

    getHash() : string {

        const from = this.txInputs && this.txInputs.length
            ? this.txInputs.map(txi => txi.signature).join("") //super zoado
            : ""; 

        const to = this.txOuputs && this.txOuputs.length
            ? this.txOuputs.map(txo => txo.getHash()).join("") //super zoado
            : "";             
        
        return sha256(this.type + from + to + this.timestamp).toString(); //super zoado
    }

    getFee(): number{
        let inputSum: number = 0, outputSum: number = 0;

        if(this.txInputs && this.txInputs.length > 0){

            inputSum = this.txInputs.map(txi => txi.amount).reduce((a, b) => a+b);
            
            if(this.txOuputs && this.txOuputs.length > 0)
                outputSum = this.txOuputs.map(txo => txo.amount).reduce((a, b) => a+b);

            return inputSum - outputSum;
        }

        return 0;
    }

    isValid(difficulty: number, totalFee: number): Validation{

        if(this.hash !== this.getHash())
            return new Validation(false, "Invalid hash.");
        if(!this.txOuputs || !this.txOuputs.length || this.txOuputs.map(txo => txo.isValid()).some(v => !v.success))
            return new Validation(false, "Invalid TXO.");

        if(this.txInputs && this.txInputs.length > 0){
            const validations = this.txInputs.map(txi => txi.isValid()).filter(v => !v.success);
            
            //if(validations || validations.length)
            //if(validations.length || validations)
            if(validations && validations.length){

                const message = validations.map(v => v.message).join(" ");
                return new Validation(false, `Invalid tx: ${message}`);
            }

            const inputSum = this.txInputs.map(txi => txi.amount).reduce((a, b) => a+b, 0);
            const outputSum = this.txOuputs.map(txo => txo.amount).reduce((a, b) => a+b, 0);

            if( inputSum < outputSum)
                return new Validation(false, `Invalid tx: total input amount larger than total output amount.`);
        }

        if(this.txOuputs.some(txo => txo.tx !== this.hash))
            return new Validation(false, `Invalid tx: due to invalid zoacao.`);

        //DONE: validar as taxas e recompensas quando tx.type === FEE

        if(this.type === TransacionType.FEE){
            const txo = this.txOuputs[0];
            if(txo.amount > Blockchain.getRewardAmount(difficulty) + totalFee)
                return new Validation(false, "Invalid tx reward.");
        }
        return new Validation();
    }

    static fromReward(txo: TransactionOutput): Transacion{
        const tx = new Transacion({
            type: TransacionType.FEE,
            txOuputs: [txo]
        } as Transacion);

        tx.hash = tx.getHash();
        tx.txOuputs[0].tx = tx.hash;
        return tx;
    }
}