//import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {

    //const protoCoin = await hre.ethers.deployContract("ProtoCoin");

    const protoCoin = await hre.ethers.deployContract("ProtoCoinMint");
    await protoCoin.waitForDeployment();

    console.log(`Contract deployed at ${protoCoin.target}`);
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});