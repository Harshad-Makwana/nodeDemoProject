const mongoose = require("mongoose");

const  databaseName = process.env.DB_NAME;
const  databaseUserName = process.env.DB_USER_NAME;
const  databasePassword = process.env.DB_PASSWORD;

mongoose.connect(`mongodb+srv://${databaseUserName}:${databasePassword}@cluster0.9btr83m.mongodb.net/${databaseName}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex:true,
}).then(() => {
    console.log("connection successful")
}).catch((e) => {
    console.log("No connection", e);
});



// mongoose.connect("mongodb://localhost:27017/demoProject", {
//     useNewUrlParser:true,
//     useUnifiedTopology: true,
//     useCreateIndex:true,
// }).then(() => {
//     console.log("connection successful")
// }).catch((e) => {
//     console.log("No connection");
// });