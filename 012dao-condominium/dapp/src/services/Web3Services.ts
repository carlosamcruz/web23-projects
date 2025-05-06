import { ethers } from "ethers";

//import { Web3Provider } from "@ethersproject/providers";

import { BrowserProvider } from "ethers";

import ABI from './ABI.json';

//const ADAPTER_ADDRESS = `${process.env.VITE_ADAPTER_ADDRESS}`
const ADAPTER_ADDRESS = `${import.meta.env.VITE_ADAPTER_ADDRESS}`

export enum Profile{
    RESIDENT = 0,
    COUNSELOR = 1,
    MANAGER = 2
}

//function getProvider() : ethers.providers.Web3Provider {
function getProvider() : BrowserProvider {

    if(!window.ethereum) throw new Error ("No MetaMask found");

    return new BrowserProvider(window.ethereum);
}


function getContract(provider?: BrowserProvider): ethers.Contract {
    
    if(!provider) 
        provider = getProvider();

    return new ethers.Contract(ADAPTER_ADDRESS, ABI, provider);
}



export type LoginResult = {
    account: string,
    profile: Profile;
}

export async function doLogin(): Promise <LoginResult>{
    const provider = getProvider();

    const accounts = await provider.send("eth_requestAccounts", []);

    if(!accounts || !accounts.length)
        throw new Error("Wallet not found/allowed.");


    const contract = getContract(provider);
    
    const manager = ((await contract.getManager()) as string).toLocaleLowerCase();

    console.log("Manager: ", manager)

    const isManager = manager === accounts[0];

    
    if(isManager)
        localStorage.setItem("profile", `${Profile.MANAGER}`);
    else 
        localStorage.setItem("profile", `${Profile.RESIDENT}`);

    localStorage.setItem("account", accounts[0]);

    
    return {
        
        account: accounts[0],
        profile: parseInt(localStorage.getItem("profile") || "0")

    } as LoginResult;
    
}


export function doLogout(){
    localStorage.removeItem("account");
    localStorage.removeItem("profile");
}