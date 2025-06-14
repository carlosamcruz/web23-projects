//import { Express } from "express";
import express, {Request, Response, NextFunction} from "express";
import morgan from "morgan";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import errorMiddleware from "./middlewares/errorMiddleware";
import residentRouter from "./routers/residentRouter"
import authController from "./controllers/authController";

const app = express();
app.use(morgan("tiny"));
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));

app.use(express.json());

app.post('/login/', (req: Request, res: Response, next: NextFunction) =>
    {
        void authController.doLogin(req, res, next)
    }
);
    
app.use('/residents/', residentRouter);

app.use('/', (req: Request, res: Response, next: NextFunction) => {
    res.send(`Health Check`);
    //next();
});


/*
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});
*/
app.use(errorMiddleware);

export default app;