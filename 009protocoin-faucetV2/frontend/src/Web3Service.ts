import Web3 from "web3";
//import Web3, { AbiItem } from "web3";
//import ABI from "./abi.json";

//const CONTRACT_ADDRESS = `${process.env.REACT_APP_CONTRACT_ADDRSS}`
import axios from "axios";

export async function mint(){

    if(!window.ethereum) throw new Error("No MetaMask found.");

    const web3 = new Web3(window.ethereum);

    const accounts = await web3.eth.requestAccounts();

    if(!accounts || !accounts.length) throw new Error("access denied.");

    /*
    const contract = new web3.eth.Contract(ABI as AbiItem[], CONTRACT_ADDRESS, { from: accounts[0] });
    const tx = await contract.methods.mint().send();
    console.log(tx.transactionHash);
    return tx.transactionHash;
    */


    /*
    for(let i = 0; i < accounts.length; i++)
        console.log("Acc[", i,"] = ", accounts[i]);

    */

    
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/mint/${accounts[0]}`);

    return response.data;

}