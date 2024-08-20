//import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {

    /*
    const implementation = await hre.ethers.deployContract("Condominium");
    await implementation.waitForDeployment();
    const implementationAddress = await implementation.getAddress();
    console.log(`ImplementationAddress deployed at ${implementationAddress}`);

    const adapter = await hre.ethers.deployContract("CondominiumAdapter");
    await adapter.waitForDeployment();
    const adapterAddress = await adapter.getAddress();
    console.log(`AdapterAddress deployed at ${adapterAddress}`);

    await adapter.update(implementationAddress);
    console.log("Adapter was upgraded.");

    */

    const Condominium = await hre.ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();
  
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`Contract deployed to: ${contractAddress}`);
  
    const CondominiumAdapter = await hre.ethers.getContractFactory("CondominiumAdapter");
    const adapter = await CondominiumAdapter.deploy();
  
    await adapter.waitForDeployment();
    const adapterAddress = await adapter.getAddress();
    console.log(`CondominiumAdapter deployed to: ${adapterAddress}`);
  
    await adapter.update(contractAddress);
    console.log(`CondominiumAdapter upgraded to: ${contractAddress}`);
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});