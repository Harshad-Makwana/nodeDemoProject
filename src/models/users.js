const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const usersSchema = new mongoose.Schema({
    email: {
        type:String,
        require: true,
        unique: true
    },
    password: {
        type:String,
        require: true,
    },
    phone_number: {
        type:Number,
        require: true,
        unique: true
    },
    profile: {
        type:String,
        require: true,
    },
    name:{
        type:String,
        require: true,
    },
    dob:{
        type:Date,
        require: true,
    },
    tokens: [{
        token: {
            type:String,
            require: true,
        }
    }]
});

usersSchema.methods.generateAuthToken = async function() {
    try {
        const token = jwt.sign({_id: this._id.toString()}, process.env.SECRET_KEY);

        this.tokens = this.tokens.concat({token});

        await this.save();

        return token;
    } catch (error) {
        console.log(error);
    }
};

usersSchema.pre("save", async function(next){ 
    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }

    next();
});

const User = new mongoose.model("User", usersSchema);

module.exports = User;