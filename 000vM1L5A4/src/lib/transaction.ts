import sha256 from "crypto-js/sha256";
import TransacionType from "./transactionType";
import Validation from "./validation";
/**
 * Class Transaction
 */
export default class Transacion {

    type: TransacionType;
    timestamp: number;
    hash: string;
    data: string;

    constructor(tx?: Transacion){
        this.type = tx?.type || TransacionType.REGULAR;
        this.timestamp = tx?.timestamp || Date.now();
        this.data = tx?.data || "";
        this.hash = tx?.hash || this.getHash();
    }

    getHash() : string {
        return sha256(this.type + this.data + this.timestamp).toString();
    }

    isValid(): Validation{

        if(this.hash !== this.getHash())
            return new Validation(false, "Invalid hash.");
        if(!this.data)
            return new Validation(false, "Invalid data.");

        return new Validation();

    }

}