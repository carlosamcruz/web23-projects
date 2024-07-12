import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction }  from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from 'helmet';

import { mintAndTransfer } from "./Web3Provider"; // precisa vir depois do dotenv.config()
import { net } from "web3";

const app = express();

app.use(helmet());

app.use(morgan("tiny"));
//app.use(cors()); //habilita o uso para qualquer backend
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));

const nextMint = new Map<string, number>();

app.post("/mint/:wallet", async (req: Request, res: Response, next: NextFunction) => {

    const wallet = req.params.wallet;

    if(nextMint.has(wallet) && nextMint.get(wallet)! > Date.now())
        return res.status(400).json("Try again in: " + Math.floor((nextMint.get(wallet)! - Date.now())*0.001) + " seconds")

    try{

        const tx = await mintAndTransfer(wallet);
        res.json(tx);

    }
    catch(err: any){
        console.log(err);
        res.status(500).json(err.message);
    }

    nextMint.set(wallet, (Date.now() + (1000 * 60 * 60 * 24)));
});

const PORT: number = parseInt(`${process.env.PORT || 3001}`);
app.listen(PORT, () => console.log("Server is listening at PORT: " + PORT));