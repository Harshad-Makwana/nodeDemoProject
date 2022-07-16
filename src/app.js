require('dotenv').config();

const {check, validationResult } = require("express-validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
const hbs = require("hbs");
const multer = require("multer");

require("./db/conn");

const app = express();

const auth = require("./middleware/auth");
const User = require("./models/users");

const port = process.env.PORT || 3001;
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, "public/images")
    },
    filename: (req, file, cb) => {
      return  cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path); 

function getCookiesSetting(expiresTime = 6000000) {
    return { 
        expires: new Date(Date.now() + expiresTime),
        httpOnly:true,
        // secure:true
    };
};


app.get("/", (req,res) => {
    if(req?.cookies?.jwt) {
        res.redirect("/home");
    }
    res.render("index");
});

app.get("/register", (req,res) => {
    if(req.cookies.jwt) {
        res.redirect("/home");
    }
    res.render("register");
});

app.get("/home", auth, async(req,res) => {
    try {
        let isLogin = false;
        if(req.cookies.jwt) {
            isLogin = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY);
        }
        res.render("home", {isLogin});
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post("/register", 
upload.single('profile'),
[
    check('name', 'Name Field is lenght more than 3+').isLength({min: 4}),
    check('email', 'Email is not valied').isEmail().normalizeEmail().custom(async (value) => {
        return await User.findOne({email: value}).then(user => {
            if (user) {
                return Promise.reject('E-mail already in exists');
            }
        });
    }),
    check('phone_number', 'Phone number is not valied').isLength({min: 10, max:10}).custom(async (value) => {
        return await User.findOne({phone_number: value}).then(user => {
            if (user) {
                return Promise.reject('Phone number already in exists');
            }
            return true;
        });
    }),
    check('passwordConfirmation', 'Passsword lenght more than 5+').isLength({min: 6}).custom((value, { req }) => {
        if (value.lenght > 5 && value !== req.body.password) {
            return Promise.reject('Password confirmation does not match password');
        }
        return true;
    }),
],

async (req,res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            const errorsAlert = errors.array();
    
            console.log("errorsAlert:", errorsAlert);
            res.render("register", {errorsAlert});
            // return res.status(422).jsonp(errors.array());
        }
        else {

            console.log("req.body", req.body);

            const registerUser = new User({
                email: req.body.email,
                password: req.body.password,
                phone_number: req.body.phone_number,
                profile:  req.file.filename,
                name:req.body.name,
                dob: req.body.dob,
            });

            const token = await registerUser.generateAuthToken();            
            const UserResult = await registerUser.save();

            res.cookie("jwt", token, getCookiesSetting());
            res.status(201).redirect("/home");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/logout", auth, async(req,res) => {
    try {
        res.clearCookie("jwt");
        await req.user.save();

        // req.user.tokens = req.user.tokens.filter((obj) => {
        //     return obj.token !== req.token;
        // });

        req.user.tokens = [];

        res.redirect("/login");
    } catch (error) {
        res.status(500).send("error", error);
    }
});

app.get("/login", (req,res) => {
    if(req.cookies.jwt) {
        res.redirect("/home");
    }
    res.render("login");
});

app.post("/login",
[
    check('email', 'Email is not valied').isEmail().normalizeEmail(),
    check('password', 'Passsword lenght more than 5+').isLength({min: 6}),
],
async(req,res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            const errorsAlert = errors.array();
    
            console.log("errorsAlert:", errorsAlert);
            res.render("login", {errorsAlert});
            // return res.status(422).jsonp(errors.array());
        }
        else {
            const email = req.body.email;
            const password = req.body.password;
            const getUserDetails = await User.findOne({email});
            const isMatch = await bcrypt.compare(password, getUserDetails.password);

            if(!isMatch) {
                const errorsAlert = [{
                    value: '',
                    msg: 'Email and Password are Invalid',
                    param: 'password',
                    location: 'body'
                }];
                res.render("login",  {errorsAlert});
            } else {
                const token = await getUserDetails.generateAuthToken();
                res.cookie("jwt", token, getCookiesSetting());
                res.redirect("/home");
            }        
        }
    } catch (error) {
        res.send("Invalid Email:", error);
    }
});


app.get("/profile", auth, async (req,res) => {
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    let userDetails = await User.findOne({_id: verifyUser._id});
    let isLogin = false;
    if(req.cookies.jwt) {
        isLogin = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY);
    }

    const dob=  new Date(userDetails.dob).toLocaleDateString();
    res.render("profile", {userDetails, isLogin, dob});
});

app.post("/user/data", auth, async (req,res) => {
    
    const allUser = await User.find().select({ password: 0, tokens: 0 });

    console.log("allUser", allUser);

    return res.status(200).jsonp(allUser);
});


app.get("/users", auth, async (req,res) => {
    let isLogin = false;
    if(req.cookies.jwt) {
        isLogin = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY);
    }
    res.render("users", {isLogin});
});


app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
});


