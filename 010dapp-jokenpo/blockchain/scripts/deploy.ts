//import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {

    const implementation = await hre.ethers.deployContract("JoKenPo");
    await implementation.waitForDeployment();
    const implementationAddress = await implementation.getAddress();
    console.log(`ImplementationAddress deployed at ${implementationAddress}`);

    const adapter = await hre.ethers.deployContract("JKPAdapter");
    await adapter.waitForDeployment();
    const adapterAddress = await adapter.getAddress();
    console.log(`AdapterAddress deployed at ${adapterAddress}`);

    await adapter.upgrade(implementationAddress);
    console.log("Adapter was upgraded.");
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});