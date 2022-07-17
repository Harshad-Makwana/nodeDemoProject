import { Router, Response} from 'express';
import { sign, verify } from 'jsonwebtoken';
import { compare } from 'bcryptjs';
import { json } from 'body-parser';
import multer from 'multer';
import path from 'path';

import { validateRequestSchema } from '../middleware/validate-request-schema';
import { registerSchema } from '../schema/register-schema';
import { loginSchema } from '../schema/login-schema';
import { User } from '../models/users';
import { auth } from '../middleware/auth';

const rootRouter = Router();

const storage = multer.diskStorage({
    destination: (req: any,file: any,cb: (arg0: null, arg1: string) => void) => {
        cb(null, "public/images")
    },
    filename: (req: any, file: { originalname: any; }, cb: (arg0: null, arg1: any) => any) => {
      return  cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

function getCookiesSetting(expiresTime = 6000000) {
    return { 
        expires: new Date(Date.now() + expiresTime),
        httpOnly:true,
        // secure:true
    };
};



rootRouter.get("/logout", auth, async(req: any,res: Response) => {
    try {  
        // req.user.tokens = req.user.tokens.filter((obj) => {
        //     return obj.token !== req.token;
        // });

        res.clearCookie("jwt");
        req.user.tokens = [];        
        await req.user.save();
        res.redirect("/login");
    } catch (error) {
        res.status(400).send(error);
    }
});


rootRouter.post("/register", 
    upload.single('profile'),
    registerSchema,
    validateRequestSchema,
    async (req: any, res: Response) => {
        try {
            const registerUser: any = new User({
                email: req.body.email,
                password: req.body.password,
                phone_number: req.body.phone_number,
                profile: req.file.filename,
                name:req.body.name,
                dob: req.body.dob,
            });  

            const token = await registerUser.generateAuthToken();     
            await registerUser.save();
            res.cookie("jwt", 'bearer ' + token, getCookiesSetting());
            return res.status(200).jsonp({token});
        } catch (error) {
            res.status(400).send(error);
        }
    }
);

rootRouter.post("/login",
    json(),
    loginSchema,
    validateRequestSchema,
    async(req: { body: { email: any; password: any; }; },res: any) => {
        try {
            const email = req.body.email;
            const password = req.body.password;
            const getUserDetails: any = await User.findOne({email});

            let matchFlage = false;

            if(getUserDetails) {
                const isMatch = await compare(password, getUserDetails.password);    
                if(isMatch) {
                    matchFlage = true;
                    const token = await getUserDetails.generateAuthToken();
                    res.cookie("jwt", 'bearer ' + token, getCookiesSetting());
                    return res.status(200).jsonp({token});
                }
            }

            if(!matchFlage) {
                const errorsAlert = [{
                    value: '',
                    msg: 'Email and Password are Invalid',
                    param: 'password',
                    location: 'body'
                }];
                return res.status(400).jsonp({errors: errorsAlert});            
            }
        } catch (error) {
            res.send("Invalid Email:", error);
        }
    }
);

rootRouter.post("/users-list", auth, async (req,res) => {
    const allUser = await User.find().select({ password: 0, tokens: 0 });
    return res.status(200).jsonp(allUser);
});


rootRouter.get("/", (req: any,res) => {
    if(req?.cookies?.jwt) {
        res.redirect("/home");
    }else {
        res.render("index");
    }
});


rootRouter.get("/login", (req,res) => {
    if(req?.cookies?.jwt) {
        res.redirect("/home");
    }
    res.render("login");
});

rootRouter.get("/register", (req,res) => {
    if(req.cookies.jwt) {
        res.redirect("/home");
    }
    res.render("register");
});

rootRouter.get("/home", auth, (req,res) => {
    const isLogin = true;
    res.render("home", {isLogin});
});

rootRouter.get("/user-profile", auth, async (req: any,res) => {
    const isLogin = true;
    const userDetails = await User.findOne({_id: req?.id});
    const dob = new Date(userDetails?.dob ? userDetails?.dob : '').toLocaleDateString();
    res.render("user-profile", {userDetails, isLogin, dob});
});

rootRouter.get("/users-list", auth, async (req: any,res) => {
    const isLogin = true;
    const token = req?.token;
    res.render("users-list", {isLogin, token});
});


export {rootRouter as router};
