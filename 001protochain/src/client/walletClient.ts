import dotenv from "dotenv";
import Wallet from "../lib/wallet";
import readline from "readline";
import axios from "axios";
import Transacion from "../lib/transaction";
import TransactionInput from "../lib/transactionInput";
import TransacionType from "../lib/transactionType";
import TransactionOutput from "../lib/transactionOutput";


dotenv.config();

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

let myWalletPub = "";
let myWalletPriv = "";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function menu(){
    setTimeout(()=> {
        console.clear();

        if(myWalletPub)
            console.log(`You are logged as ${myWalletPub}`);
        else
            console.log("You are not logged.");

        console.log("1 - Create Wallet");
        console.log("2 - Recover Wallet");
        console.log("3 - Balance");
        console.log("4 - Send TX");
        console.log("5 - Search TX");

        
        rl.question("Choose your option: ", (answer) => {
            switch(answer){
                case "1": createWallet();
                break;
                case "2": recoverWallet();
                break;
                case "3": getBalance();
                break;
                case "4": sendTX();
                break;
                case "5": searchTX();
                break;
                default: {
                    console.log("Wrong Option!");
                    menu();
                }

            }

        });
        
    }, 1000);
}

function preMenu(){
    rl.question("press any key to continue ...", () => {
        menu();
    })
}

function createWallet(){
    console.clear();
    const wallet = new Wallet();
    console.log("Your new wallet:");
    console.log(wallet);

    myWalletPub = wallet.publicKey;
    myWalletPriv = wallet.privateKey;

    preMenu();
}

function recoverWallet(){
    console.clear();

    rl.question("What is you private key or WIF: ", (wifOrPrivateKey) =>{
        const wallet = new Wallet(wifOrPrivateKey);
        console.log("Your recovered wallet:");
        console.log(wallet);
        myWalletPub = wallet.publicKey;
        myWalletPriv = wallet.privateKey;
        preMenu();
    });
}

function getBalance(){
    console.clear();
    if(!myWalletPub){
        console.log("You don´t have a wallet yet.");
        return preMenu();
    }

    //TODO: Get Balance via API;
    preMenu();
}

function sendTX(){
    console.clear();
    if(!myWalletPub){
        console.log("You don´t have a wallet yet.");
        return preMenu();
    }

    console.log(`You wallet is: ${myWalletPub}`);
    rl.question(`To Wallet: `, (toWallet) => {
        if(toWallet.length < 66){
            console.log("Invalid Wallet.");
            return preMenu();
        }

        rl.question(`Amount: `, async (amountStr) => {

            const amount = parseInt(amountStr);
            if( amount < 1){
                console.log("Invalid Amount.");
                return preMenu();
            }
            
            const walletResponse = await axios.get(`${BLOCKCHAIN_SERVER}wallets/${myWalletPub}`)
            const balance = walletResponse.data.balance as number;
            const fee = walletResponse.data.fee as number;
            const utxo = walletResponse.data.utxo as TransactionOutput[];

            //TODO: Balance Validation;

            if(balance < amount + fee){
                console.log("No enough UTXOs.");
                return preMenu();
            }

            const tx = new Transacion();
            tx.timestamp = Date.now();
            tx.txOuputs = [new TransactionOutput({
                toAddress: toWallet,
                amount,
            } as TransactionOutput)];
            tx.type = TransacionType.REGULAR;
            tx.txInputs = [new TransactionInput({
                fromAddress: myWalletPub,
                amount: amount,
                previousTx: utxo[0].tx
            } as TransactionInput)];

            tx.txInputs[0].sign(myWalletPriv);
            tx.hash = tx.getHash();
            tx.txOuputs[0].tx = tx.hash;

            try{

                const txResponse = await axios.post(`${BLOCKCHAIN_SERVER}transactions/`, tx);
                console.log("Transaction accepted. Waiting the miners!");
                console.log(txResponse.data.hash);

            }
            catch(err: any){
                console.error(err.response ? err.response.data : err.message);
            }
            return preMenu();
        })
    })
    preMenu();
}

function searchTX(){
    console.clear();
    rl.question("Your tx hash: ", async (hash) => {
        const response = await axios.get(`${BLOCKCHAIN_SERVER}transactions/${hash}`);
        console.log(response.data);
        preMenu();
    })
    
}

menu();