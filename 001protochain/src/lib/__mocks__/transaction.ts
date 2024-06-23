import TransacionType from "../transactionType";
import Validation from "../validation";
/**
 * Mocked Transaction Class
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
        return "abc";
    }

    isValid(): Validation{

        if(!this.data)
            return new Validation(false, "Invalid mock transaction.");

        return new Validation();

    }

}