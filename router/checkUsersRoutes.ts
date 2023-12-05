import express, {Request,Response, NextFunction} from 'express';
import path from "path";
import { format } from 'date-fns';
import { logger } from '../logger';


const checkUsersRoutes = express.Router();
checkUsersRoutes.use(checkRequest);
checkUsersRoutes.use(RequestCounter);


async function checkRequest(req:Request, res:Response, next: NextFunction){
    let time = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    if (path.extname(req.path) === ".html"){
        logger.info(`[${time}] ${req.method} ${req.path}`) 
        // logger.info(`[session] ${JSON.stringify(req.session['user'])}`) 

    }
    next();
}


//counter
async function RequestCounter(req: Request, res: Response, next:any){
    let counter = req.session["counter"] || 0;
    counter++;
    req.session["counter"] = counter;
    // logger.info(`you are here: ${req.session["counter"] = counter}`);
    next();
}

export default checkUsersRoutes;