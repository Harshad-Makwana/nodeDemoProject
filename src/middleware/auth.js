const jwt = require("jsonwebtoken");
const User = require("../models/users");

const auth = async (req, res, next) => {
    try {
        if(req.cookies.jwt) {
            const token = req.cookies.jwt;
            const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
            const userDetails = await User.findOne({_id: verifyUser._id});
    
            req.token = token;
            req.user = userDetails;
        }
        else {
            res.redirect("/");
        }
        
        next();
    } catch (error) {
        res.status(401).send(error);
    }
};

module.exports = auth;