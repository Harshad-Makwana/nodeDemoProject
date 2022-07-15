require('dotenv').config();

const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
const hbs = require("hbs");
require("./db/conn");

const app = express();
const User = require("./models/users");

const port = process.env.PORT || 3001;
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);


app.get("/", (req,res) => {
    res.render("index");
});

app.get("/register", (req,res) => {
    res.render("register");
});

app.post("/register", async (req,res) => {
    try {
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;
        
        if(password === confirmpassword) {
            const registerUser = new User({
                email: req.body.email,
                password: password,
                phone_number: req.body.phone_number,
                image: req.body.image,
                full_name:req.body.full_name,
                dob: req.body.dob,
            });

            const token = await registerUser.generateAuthToken();            
            const UserResult = await registerUser.save();

            res.status(201).render("index");
        }
        else{
            res.send("Pass are not match");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/login", (req,res) => {
    res.render("login");
});

app.post("/login", async(req,res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const getUserDetails = await User.findOne({email});
        const isMatch = await bcrypt.compare(password, getUserDetails.password);

        const token = await getUserDetails.generateAuthToken();

        if(isMatch) {
            console.log(getUserDetails);
            res.render("index");
        }
        else {
            res.send("Invalid Password");
        }

        res.send("Login");

    } catch (error) {
        res.send("Invalid Email");
    }
});


app.get("/users", (req,res) => {
    res.render("users");
});


app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
});


