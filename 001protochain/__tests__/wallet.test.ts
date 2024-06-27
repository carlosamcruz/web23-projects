import {describe, test, expect, beforeAll} from "@jest/globals"
import Wallet from "../src/lib/wallet";

describe("Wallet tests", ()=> {

    const exampleWIF = "L51XLARaH8Ghtz4dnaiDUBXLX6UjfjCynb4CdpRvfiuAMnSaSWAc"; //e86dfdbf8739f9498fb8bf4c2aaaa089d95fa7d281c722813efef67b7b84e1e5
    const pubKeyWIf = "02d2c507701df6595ea5b82becbc77bcd6c4ef8833a8420f78232b915136891cb6";
    const pvk2 = "ccfa31de044ce2ef052b846541a455fe7e83306dd056b24518e34387deff2ae6";
    const wif2 = "L46AEY4PVnTMXZZn6BwPCnpgREDnttUTN8WJYaqDm8eRJLkBE3mk";
    const pkwif2 = "02a07794d3249e41c0f9790d5fb296b898cd51b13b7a2a21ec91e29e424c54485b"
    let alice: Wallet;

    beforeAll(() => {
        alice = new Wallet();
    })


    test('should generate wallet', () => {

        const wallet = new Wallet();
        expect(wallet.privateKey).toBeTruthy();
        expect(wallet.publicKey).toBeTruthy();
    })

    test('should recover wallet (PvtKey)', () => {

        const wallet = new Wallet(alice.privateKey);

        //console.log("PubKey (PVTKEY): ", wallet.publicKey)
        //console.log("PubKey Alice (PVTKEY): ", alice.publicKey)
        
        expect(wallet.publicKey).toEqual(alice.publicKey);
    })

    test('should recover wallet (PvtKey double)', () => {

        const wallet = new Wallet(pvk2);

        //console.log("PubKey (PVTKEY): ", wallet.publicKey)
        //console.log("PubKey Alice (PVTKEY): ", alice.publicKey)
        
        expect(wallet.publicKey).toEqual(pkwif2);
    })


    //WIF from this PVT KEY: e86dfdbf8739f9498fb8bf4c2aaaa089d95fa7d281c722813efef67b7b84e1e5
    test('should recover wallet (Wif)', () => {

        const wallet = new Wallet(exampleWIF);

        //console.log("PubKey: ", wallet.publicKey)
        expect(wallet.publicKey).toEqual(pubKeyWIf);
    })

    test('should recover wallet (Wif double)', () => {

        const wallet = new Wallet(wif2);

        //console.log("PubKey: ", wallet.publicKey)
        expect(wallet.publicKey).toEqual(pkwif2);
    })

})