import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import BlockInfo from "../lib/blockInfo";
import Block from "../lib/block";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;
const minerWallet = {
    privateKey: "123456",
    publicKey: `${process.env.MINER_WALLET}`
}
console.log("Logged as: ", minerWallet.publicKey);

let totalMined = 0;

async function mine(){
    console.log("Getting next block info...");
    const {data} = await axios.get(`${BLOCKCHAIN_SERVER}blocks/next`);

    if(!data){
        console.log("No tx found. Waiting ...")
        return setTimeout(()=>{
                    mine();
                }, 5000);
    }

    //const blockinfo = {data} as BlockInfo;
    const blockinfo = data as BlockInfo;


    const newBlock = Block.fromBlockInfo(blockinfo);

    //TODO: Adicionar tx de recompensa;

    console.log("Start mining block #" + blockinfo.index);

    newBlock.mine(blockinfo.difficulty, minerWallet.publicKey);

    console.log("Block mined! Sending to blockchain...");

    try{

        await axios.post(`${BLOCKCHAIN_SERVER}blocks/`, newBlock);
        console.log("Block sent and accepted!")
        totalMined++;
        console.log("Total mined blocks: ", totalMined)

    } 
    catch(err: any){
        console.error(err.response ? err.response.data : err.message)
    }

    setTimeout(()=>{
        mine();
    }, 1000);


    //console.log(data);
}

mine();