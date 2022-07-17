import { Response, NextFunction} from 'express';
import { verify } from 'jsonwebtoken';

import { User } from '../models/users';

const auth = async (req: any, res:Response, next:NextFunction) => {
    try {
        const bearerHeader = req?.headers['authorization'] || req?.cookies?.jwt;

        if(typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            const secretKey = process?.env?.SECRET_KEY;

            if(bearerToken && secretKey) {                   
                const verifyUser: any = verify(bearerToken, secretKey);
                const userDetails = await User.findOne({_id: verifyUser._id});
                req.token = bearerToken;
                req.id = verifyUser._id;
                req.user = userDetails;
            }
    
            next();
        } else {
            res.sendStatus(403);
        }  
    } catch (error) {
        res.status(401).send(error);
    }
};

export { auth }
