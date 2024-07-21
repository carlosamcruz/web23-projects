//import { ethers } from "hardhat";
import hre from "hardhat";
import ABI from "./abi.json";
import ABI2 from "./abijkp.json";
import { AbiType } from "./AbiType";
import { AbiTypeJKP } from "./AbiTypeJKP";

async function main() {

    //O signer vem das configurações da network em hardhat.config.ts
    const signer = await hre.ethers.provider.getSigner()
 
    const adapter = new hre.ethers.Contract("0x49a630E03905d7Efd8eA4bcCBF160B541E059Eec", ABI, signer);

    const implementation = new hre.ethers.Contract("0xb465002B90ec92da5b4E657C48e4581D6f958395", ABI2, signer);

    const tx = await adapter.setComission(25);
    //const tx = await implementation.setComission(25);

    //await adapter.upgrade("0xFDabF11002A842777870e6c141C62474d80FC4e8");

    console.log("New Comission: ", tx.transactionHash);
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});