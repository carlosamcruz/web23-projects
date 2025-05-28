import { Contract, ethers, BaseContract } from "ethers";

//import { Web3Provider } from "@ethersproject/providers";

import { BrowserProvider } from "ethers";

import ABI from './ABI.json';

import { AbiType } from "./AbiType";

//const ADAPTER_ADDRESS = `${process.env.VITE_ADAPTER_ADDRESS}`
const ADAPTER_ADDRESS = `${import.meta.env.VITE_ADAPTER_ADDRESS}`

export enum Profile{
    RESIDENT = 0,
    COUNSELOR = 1,
    MANAGER = 2
}

//const abi = (ABI as AbiType) as ethers.InterfaceAbi;

const abi = ABI as ethers.InterfaceAbi;


function getProfile() : Profile{

    const profile = localStorage.getItem("profile") || "0";

    return parseInt(profile);

}

//function getProvider() : ethers.providers.Web3Provider {
function getProvider() : BrowserProvider {

    if(!window.ethereum) throw new Error ("No MetaMask found");

    return new BrowserProvider(window.ethereum);
}


function getContract(provider?: BrowserProvider): ethers.Contract {
    
    if(!provider) 
        provider = getProvider();

    //return new ethers.Contract(ADAPTER_ADDRESS, ABI as AbiType, provider);
    return new ethers.Contract(ADAPTER_ADDRESS, abi, provider);
}

async function getContractSigner(provider?: BrowserProvider): Promise <ethers.Contract> {
    
    if(!provider) 
        provider = getProvider();

    const signer = await provider.getSigner(localStorage.getItem("account") || undefined);

    //const contract = new ethers.Contract(ADAPTER_ADDRESS, abi as ethers.InterfaceAbi, provider);

    //Com o ethers não se usa mais o connect signer, mas como feito abaixo:
    const contract = new ethers.Contract(ADAPTER_ADDRESS, abi, signer);

    //return new ethers.Contract(ADAPTER_ADDRESS, ABI as AbiType, provider);
    //return contract.connect(signer) as ethers.Contract;
    return contract;
}


export type LoginResult = {
    account: string,
    profile: Profile;
}

export type Resident = {
    wallet: string;
    isCounselor: boolean;
    isManager: boolean;
    residence: number;
    nextPayment: ethers.BigNumberish;
}

export type ResidentPage = {
    residents: Resident[];
    total: number;
}

export function isManager() : boolean{
    return parseInt(localStorage.getItem("profile") || "0") === Profile.MANAGER;
}
export function isResident() : boolean{
    return parseInt(localStorage.getItem("profile") || "0") === Profile.RESIDENT;
}

export async function doLogin(): Promise <LoginResult>{
    const provider = getProvider();

    const accounts = await provider.send("eth_requestAccounts", []);

    if(!accounts || !accounts.length)
        throw new Error("Wallet not found/allowed.");


    const contract = getContract(provider);

    const resident = (await contract.getResident(accounts[0])) as Resident;

    
    //const manager = ((await contract.getManager()) as string).toLocaleLowerCase();

    //console.log("Manager: ", manager)

    //const isManager = manager === accounts[0];

    let isManager = resident.isManager;

    if(!isManager && resident.residence > 0){
        if(resident.isCounselor)
            localStorage.setItem("profile", `${Profile.COUNSELOR}`);
        else
            localStorage.setItem("profile", `${Profile.RESIDENT}`);
    }
    else if((!isManager && !resident.residence)){
        const manager = ((await contract.getManager()) as string).toLocaleLowerCase();
        
        isManager = manager === accounts[0];
    }

    if(isManager)
        localStorage.setItem("profile", `${Profile.MANAGER}`);
    else if(localStorage.getItem("profile") === null)
        throw new Error("Unauthorized");


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

export async function getAddress() : Promise<string>{

    const contract = getContract();

    return (await contract.getAddressImplementation() as string);
}

export async function getResidents(page: number = 1, pageSize: number = 10) : Promise<ResidentPage>{

    console.log("page get: ", page);
    console.log("pageSize get: ", pageSize);

    const contract = getContract();
    
    const result = await contract.getResidents(page, pageSize) as ResidentPage;

    //console.log("Result: " + result);
    //console.log("Result: ", result);
    //console.log("Result: "+ result);
    //console.log("Res0: " + (result.residents[0].residence > 0));

    
    const residents = Array.from(result.residents)
    //result.residents
    .filter(r => r.residence > 0) as Resident[];

    //console.log("Residents Before sort:", residents);

    residents.sort((a, b) => {
        if (a.residence > b.residence) return 1;
        if (a.residence < b.residence) return -1;
        return 0;
    });
    

    //console.log("Residents:" + residents);
    //console.log("Residents:", residents);


    return {
        residents,
        total: Number(result.total)

    } as ResidentPage;
}

export async function getResident(wallet: string) : Promise<Resident>{

    const contract = getContract();
    
    const result = await contract.getResident(wallet) as Resident;

    //transformação do Proxy entregue pelo ethers v6 em um objeto real com os campos nomeados
    const parsedResident: Resident = {
        wallet: result.wallet,
        residence: result.residence,
        isCounselor: result.isCounselor,
        isManager: result.isManager,
        nextPayment: result.nextPayment,
    };

    return parsedResident;
}


export async function upgrade(address: string) : Promise<ethers.Transaction>{

    if(getProfile() !== Profile.MANAGER)
        throw new Error("You do not have permission.");
        
    const contract = await getContractSigner();

    const tx = await contract.update(address);

    return (tx);
}

export async function addResident(wallet: string, residenceId: number) : Promise<ethers.Transaction>{

    if(getProfile() === Profile.RESIDENT)
        throw new Error("You do not have permission.");
        
    const contract = await getContractSigner();

    const tx = await contract.addResident(wallet, residenceId);

    return (tx);
}

export async function removeResident(wallet: string) : Promise<ethers.Transaction>{

    if(getProfile() !== Profile.MANAGER)
        throw new Error("You do not have permission.");
        
    const contract = await getContractSigner();

    return (await contract.removeResident(wallet));
}

export async function setCounselor(wallet: string, isEntering: boolean) : Promise<ethers.Transaction>{

    if(getProfile() !== Profile.MANAGER)
        throw new Error("You do not have permission.");
        
    const contract = await getContractSigner();

    return (await contract.setCounselor(wallet, isEntering));
}