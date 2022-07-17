import mongoose from "mongoose";

// const  databaseName = process.env.DB_NAME;
// const  databaseUserName = process.env.DB_USER_NAME;
// const  databasePassword = process.env.DB_PASSWORD;
const mongoUrl: string | undefined = process.env.MONGO_URL;

if(mongoUrl) {
    mongoose.connect(mongoUrl,
        {
            // useCreateIndex:true,
            // useNewUrlParser: true,
            // useUnifiedTopology: true
            
    }).then(() => {
        console.log("connection successful")
    }).catch((e: any) => {
        console.log("No connection", e);
    });    
}