import * as ecc from 'tiny-secp256k1';
import ECPairFactory, { ECPairInterface } from 'ecpair';

const ECpair = ECPairFactory(ecc);

/**
 * Wallet Class
 */
export default class Wallet{

    privateKey: string;
    publicKey: string;

    constructor(wifOrPrivateKey? : string){
        let keys;

        if(wifOrPrivateKey){
            if(wifOrPrivateKey.length === 64)
                keys = ECpair.fromPrivateKey(Buffer.from(wifOrPrivateKey, "hex"))
            else
                keys = ECpair.fromWIF(wifOrPrivateKey)
        }
        else
            keys = ECpair.makeRandom();


        /* c8 ignore next */
        this.privateKey = keys.privateKey?.toString("hex") || "";
        //this.privateKey = keys.privateKey?.toString("hex");
        //this.publicKey = keys.publicKey.toString("hex") || "";
        this.publicKey = keys.publicKey.toString("hex");
    }

}