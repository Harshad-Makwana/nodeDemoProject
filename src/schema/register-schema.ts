import { check } from "express-validator";
import { User } from '../models/users';

const schema = [
    check('name', 'Name Field is length more than 3+').isLength({min: 4}),
    check('email', 'Email is not valied').isEmail().normalizeEmail().custom(async (value) => {
        return await User.findOne({email: value}).then((user: any) => {
            if (user) {
                return Promise.reject('E-mail already in exists');
            }
        });
    }),
    check('phone_number', 'Phone number is not valied').isLength({min: 10, max:10}).custom(async (value) => {
        return await User.findOne({phone_number: value}).then((user: any) => {
            if (user) {
                return Promise.reject('Phone number already in exists');
            }
            return true;
        });
    }),
    check('passwordConfirmation', 'Passsword length more than 5+').isLength({min: 6}).custom((value, { req }) => {
        if (value.length > 5 && value !== req.body.password) {
            return Promise.reject('Password confirmation does not match password');
        }
        return true;
    }),

];

export {schema as registerSchema };