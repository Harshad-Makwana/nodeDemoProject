import 'dotenv/config';

import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import hbs from 'hbs';

import './src/db/conn';
import { router } from "./src/routes/index";

const app = express();
const port = process.env.PORT || 3001;
const static_path = path.join(__dirname, "./public");
const template_path = path.join(__dirname, "./templates/views");
const partials_path = path.join(__dirname, "./templates/partials");

app.use(express.json());
app.use(cookieParser());
app.set("view engine", "hbs");
app.set("views", template_path);
app.use(express.static(static_path));
app.use(express.urlencoded({extended:false}));

hbs.registerPartials(partials_path); 

app.use('/', router);

app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
});


