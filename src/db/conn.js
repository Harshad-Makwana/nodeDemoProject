const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://root:Root%40123@cluster0.9btr83m.mongodb.net/Test2?retryWrites=true&w=majority',
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