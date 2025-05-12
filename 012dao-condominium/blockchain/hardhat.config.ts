/*
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";


const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

export default config;

*/


/*
import "solidity-coverage";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "local",
  networks: {
    local:{
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
      accounts:{
        mnemonic: "test test test test test test test test test test test junk"
      }
    }
  }

};

export default config;
*/


import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";

import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  //solidity: "0.8.24",

  solidity:{
    version: "0.8.24",
    settings:{
      optimizer:{
        enabled: true,
        runs: 1000
      }
    }
  },
  defaultNetwork: "local",
  networks: {

    hardhat: {
      //allowBlocksWithSameTimestamp: true, // Enable same timestamp for blocks
      blockGasLimit: 1099511627775,//1099511627775//30000000, // Increase block gas limit for coverage test
      allowUnlimitedContractSize: true,

      //gas: 20000000,           // optional: default gas for txs
      //gasPrice: 1000000000,   // optional: default gas price (in wei, here = 1 gwei)
      //initialBaseFeePerGas: 0,   // avoids EIP-1559 base fee on local network
    },

    local:{
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
      accounts:{
        mnemonic: "test test test test test test test test test test test junk"
      }
    },

    
    sepolia: {
      url: process.env.INFURA_URL,
      chainId: Number(process.env.CHAIN_ID),
      accounts: [String(process.env.PVK_ACCOUNT1)]      
    },
    //https://academy.binance.com/pt/articles/connecting-metamask-to-binance-smart-chain
    bsctest: {
      url: process.env.BSCTEST_URL,
      chainId: Number(process.env.BSC_CHAIN_ID),
      accounts: [String(process.env.PVK_ACCOUNT1)]      
    }

    
  },
  etherscan: {
    //apiKey: process.env.API_KEY
    apiKey: process.env.API_KEY_BSC
  },
  sourcify: {
    enabled: false
  }

};

export default config;
