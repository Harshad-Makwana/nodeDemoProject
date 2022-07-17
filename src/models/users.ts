import mongoose from "mongoose";
import { sign } from "jsonwebtoken";
import { hash } from "bcryptjs";

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
        const secretKey = process?.env?.SECRET_KEY;
        if(secretKey) {
            const token = sign({_id: this._id.toString()}, secretKey, { expiresIn: '1days'});
            this.tokens = this.tokens.concat({token});
            await this.save();
            return token;
        }

    } catch (error) {
        console.log(error);
    }
};

usersSchema.pre("save", async function(next){ 

    const password: any = this.password;
    
    if(password && this.isModified("password")) {
        this.password = await hash(password, 12);
    }

    next();
});

const User = mongoose.model("User", usersSchema);

export { User };
