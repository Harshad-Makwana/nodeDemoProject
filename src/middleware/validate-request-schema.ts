import { NextFunction } from 'express';
import { validationResult } from "express-validator";

export function validateRequestSchema(
    req: any, 
    res: any, 
    next:NextFunction
) {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        const errorsAlert = errors.array();
        return res.status(400).json({errors: errorsAlert});
    }

    next();
};