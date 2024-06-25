import sha256 from "crypto-js/sha256";
import TransacionType from "./transactionType";
import Validation from "./validation";
import TransactionInput from "./transactionInput";
/**
 * Class Transaction
 */
export default class Transacion {

    type: TransacionType;
    timestamp: number;
    hash: string;
    txInput: TransactionInput | undefined;
    to: string;

    constructor(tx?: Transacion){
        this.type = tx?.type || TransacionType.REGULAR;
        this.timestamp = tx?.timestamp || Date.now();
        this.to = tx?.to || "";
        //this.txInput = new TransactionInput(tx?.txInput) || new TransactionInput();
        //this.txInput = tx?.txInput? new TransactionInput(tx.txInput): new TransactionInput();
        this.txInput = tx?.txInput? new TransactionInput(tx.txInput): undefined;
        this.hash = tx?.hash || this.getHash();
    }

    getHash() : string {

        const from = this.txInput ? this.txInput.getHash(): ""; 
        return sha256(this.type + from + this.to + this.timestamp).toString();
    }

    isValid(): Validation{

        if(this.hash !== this.getHash())
            return new Validation(false, "Invalid hash.");
        if(!this.to)
            return new Validation(false, "Invalid to.");

        if(this.txInput){
            const validation = this.txInput.isValid();
            if(!validation.success)
                return new Validation(false, `Invalid tx: ${validation.message}`);
        }

        return new Validation();

    }

}