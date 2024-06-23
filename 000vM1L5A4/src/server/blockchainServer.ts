import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import Blockchain from "../lib/blockchain";
import Block from "../lib/block";

/* c8 ignore next */
const PORT: number = parseInt(`${process.env.BLOCKCHAIN_PORT || 3000}`);
const app = express();

//Nunca poderá ser testado com jest, mas pode ser ingorado:
/* c8 ignore start */
if(process.argv.includes("--run"))
    app.use(morgan('tiny'));
/* c8 ignore end */

app.use(express.json())

const blokchain = new Blockchain();

app.get('/status', (req: Request, res: Response, next: NextFunction) => {

    res.json({
        numberOfBlocks: blokchain.blocks.length,
        isValid: blokchain.isValid(),
        lastBlock: blokchain.getLastBlock()
    })

})
//mais especifico
app.get('/blocks/next', (req: Request, res: Response, next: NextFunction) => {
    res.json(blokchain.getNextBlock());
})

//menos especifico
app.get('/blocks/:indexOrHash', (req: Request, res: Response, next: NextFunction) => {

    let block;
    //Verify if it is number of string
    if(/^[0-9]+$/.test(req.params.indexOrHash))
        block = blokchain.blocks[parseInt(req.params.indexOrHash)];
    else
        block = blokchain.getBlock(req.params.indexOrHash);

    if(!block)
        return res.sendStatus(404);
    else
        return res.json(block);

})

/**
 * Aula 5: adding blocks, Fallback e Casting 
 */
app.post('/blocks', (req: Request, res: Response, next: NextFunction) => {


    if(req.body.hash === undefined) return(res.sendStatus(422));

    //To use casting to its own class type in the constructor 
    //it is necessary that that the argument be of the same type of the class 
    const block = new Block(req.body as Block);

    const validation = blokchain.addBlock(block);

    if(validation.success) 
        res.status(201).json(block);

    else
        res.status(400).json(validation);    
})

//Nunca poderá ser testado com jest, mas pode ser ingorado:
/* c8 ignore start */
if(process.argv.includes("--run"))
    app.listen(PORT, ()=>{ console.log(`Blockchain server is running at ${PORT}`) });
/* c8 ignore end */

export {
    app
}
