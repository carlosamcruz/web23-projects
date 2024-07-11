import express, { Request, Response, NextFunction }  from "express";
import morgan from "morgan";


import dotenv from "dotenv";
dotenv.config();

import { mintAndTransfer } from "./Web3Provider"; // precisa vir depois do dotenv.config()

import cors from "cors";

const PORT: number = parseInt(`${process.env.PORT || 3001}`);

const app = express();

app.use(morgan("tiny"));
//app.use(cors()); //habilita o uso para qualquer backend
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));

app.post("/mint/:wallet", async (req: Request, res: Response, next: NextFunction) => {
    try{

        const tx = await mintAndTransfer(req.params.wallet);
        res.json(tx);

    }
    catch(err: any){
        console.log(err);
        res.status(500).json(err.message);
    }
});

app.listen(PORT, () => console.log("Server is listening at PORT: " + PORT));