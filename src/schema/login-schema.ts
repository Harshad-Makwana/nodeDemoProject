import { check } from "express-validator";

const schema = [
    check('email', 'Email is not valied').isEmail().normalizeEmail(),
    check('password', 'Passsword kength more than 5+').isLength({min: 6}),    
];

export {schema as loginSchema };