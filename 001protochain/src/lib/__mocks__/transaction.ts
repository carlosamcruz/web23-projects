import TransactionInput from "./transactionInput";
import TransacionType from "../transactionType";
import Validation from "../validation";
/**
 * Mocked Transaction Class
 */
export default class Transacion {

    type: TransacionType;
    timestamp: number;
    hash: string;
    to: string;
    //txInput: TransactionInput | undefined;
    txInput: TransactionInput;

    constructor(tx?: Transacion){
        this.type = tx?.type || TransacionType.REGULAR;
        this.timestamp = tx?.timestamp || Date.now();
        this.to = tx?.to || "carteiraTo";
        this.txInput = tx?.txInput? new TransactionInput(tx.txInput): new TransactionInput();
        this.hash = tx?.hash || this.getHash();
    }

    getHash() : string {
        return "abc";
    }

    isValid(): Validation{

        if(!this.to)
            return new Validation(false, "Invalid mock transaction.");

        if(!this.txInput.isValid().success)
            return new Validation(false, "Invalid mock transaction.");

        return new Validation();

    }

}