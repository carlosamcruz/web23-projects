import Web3, { ContractAbi } from "web3";
import { AbiItem } from "web3-utils";
import { Contract } from "web3-eth-contract";
import ABI from "./abi.json";
import { AbiType } from "./AbiType";
import { get } from "http";
import { contract } from "web3/lib/commonjs/eth.exports";

const ADAPTER_ADDRESS = `${process.env.REACT_APP_CONTRACT}`

function getWeb3() : Web3 {

    if(!window.ethereum) 
        throw new Error("No MetaMask found");

    return new Web3(window.ethereum);
}

function getContract(web3?: Web3) : Contract<ContractAbi> {
    if(!web3) web3 = getWeb3();

    //return new web3.eth.Contract(ABI as AbiItem[], ADAPTER_ADDRESS, {from: accounts[0]});

    //return (new web3.eth.Contract(ABI as AbiItem[], ADAPTER_ADDRESS, {from: localStorage.getItem("account") || undefined}));
    return (new web3.eth.Contract(ABI as AbiType, ADAPTER_ADDRESS, {from: localStorage.getItem("account") || undefined}));
}

type LoginResult = {
    account: string;
    isAdmin: boolean;
}

export async function doLogin() : Promise<LoginResult>{

    const web3 = getWeb3();

    const accounts = await web3.eth.requestAccounts();

    if( !accounts || !accounts.length)
        throw new Error("Wallet not found/allowed.");

    //const contract = new web3.eth.Contract(ABI as AbiItem[], ADAPTER_ADDRESS, {from: accounts[0]});
    const contract = getContract(web3);

    const ownerAddress = await contract.methods.owner().call();

    //console.log("ownerAddress", ownerAddress);
    //console.log("ownerAddress", String(ownerAddress).toLowerCase());

    localStorage.setItem("account", accounts[0]);
    localStorage.setItem("isAdmin", `${accounts[0] === String(ownerAddress).toLocaleLowerCase()}`);

    return {
        account: accounts[0],
        isAdmin: accounts[0] === String(ownerAddress).toLocaleLowerCase()
    } as LoginResult;
}

export function doLogout(){
    localStorage.removeItem("account");
    localStorage.removeItem("isAdmin");
}

export type Dashboard = {
    bid?: string;
    commission?: number;
    address?: string;
}

export async function getDashboard(): Promise <Dashboard>{
    const contract = getContract(); //inicializa um WEB3 do zero;
    const address = await contract.methods.getImplementationAddress().call();

    if(/^(0x00+)$/.test(String(address)))
        return {bid: Web3.utils.toWei("0.01", "ether"), commission: 10, address} as Dashboard;

    const bid = await contract.methods.getBid().call();
    const commission = await contract.methods.getComission().call();

    return {bid: String(bid), commission: Number(commission), address: String(address).toLocaleLowerCase()} as Dashboard;
}

export async function upgrade(newContract: string): Promise<string>{
    const contract = getContract();
    const tx = await contract.methods.upgrade(newContract).send();
    return tx.transactionHash;
}

export async function setCommission(newCommission: number): Promise<string>{
    const contract = getContract();
    const tx = await contract.methods.setComission(BigInt(newCommission)).send();
    return tx.transactionHash;
}

export async function setBid(newBid: string): Promise<string>{
    const contract = getContract();
    const tx = await contract.methods.setBid(newBid).send();
    return tx.transactionHash;
}

export type Players = {
    wallet: string;
    wins: bigint;
}

export type Leaderboard = {
    players?: Players[];
    result?: string;
}

export enum Options {
    NONAME = 0,
    ROCK = 1,
    PAPER = 2,
    SCISSORS = 3
} // 0, 1, 2, 3 - definir os números de forma explicita é opcional

export async function play(option: Options) : Promise <string>{
    const web3 = getWeb3();
    const contract = getContract(web3);
    const bid = await contract.methods.getBid().call();
    //const tx = await contract.methods.play(option).send({value: web3.utils.toWei("0.01", "ether")});
    const tx = await contract.methods.play(option).send({value: String(bid)});
    return tx.transactionHash;
}

export async function getResult() : Promise <string>{
    const contract = getContract();
    return await contract.methods.getResult().call();
}

export async function getLeaderboard(): Promise <Leaderboard>{
    const contract = getContract();
    const players = await contract.methods.getLeaderboard().call();
    const result = await contract.methods.getResult().call();

    return {players, result} as Leaderboard;
}

export async function getBestPlayers(): Promise <Leaderboard>{
    const contract = getContract();
    return await contract.methods.getLeaderboard().call();
}

export function listenEvent(callback: Function){

    const web3 = new Web3(`${process.env.REACT_APP_WEBSOCKET_SERVER}`);
    const contract = getContract(web3);

    contract.events.Played({fromBlock: "latest"})
        .on("data", (event: any) => callback(event.returnValues.result));

}