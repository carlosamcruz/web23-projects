import { Request, Response, NextFunction } from "express";
import residentRepository from "../repositories/residentRepository";
import { ethers } from "ethers";
import jwt, { Jwt } from "jsonwebtoken";
import { Profile } from "src/models/resident";

const JWT_SECRET = `${process.env.JWT_SECRET}`;
const JWT_EXPIRES = parseInt(`${process.env.JWT_EXPIRES}`);


type LoginData = {
    wallet: string;
    secret: string;
    timestamp: number;
}

export async function doLogin(req: Request, res: Response, next: NextFunction){
    const data = req.body as LoginData;

    if(data.timestamp < (Date.now() - (30 * 1000)))
        return res.status(401).send('Timestamp too old!');
    
    const message = `Authenticating to Condominium. Timestamp ${data.timestamp}`;

    const signer = ethers.verifyMessage(message, data.secret);

    if(signer.toLocaleLowerCase() === data.wallet.toLocaleLowerCase()){

        const resident = await residentRepository.getResident(data.wallet);
        if(!resident)
            return res.status(401).send(`Resident not Found.`);

        const token = jwt.sign({...data, Profile: resident.profile}, JWT_SECRET, {
            expiresIn: JWT_EXPIRES
        });

        return res.json({token});
    }
    return res.status(401).send(`Wallet and secret do not match.`);
}

export default {
    doLogin
}