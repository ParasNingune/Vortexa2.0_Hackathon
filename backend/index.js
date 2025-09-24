import express from "express" ;
import cookieParser from "cookie-parser" ;
import cors from "cors" ;
import dotenv from "dotenv";
import connectDB from "./utils/db.js";

dotenv.config({});

const app = express() ;

const corsOption = {
    origin : 'http://localhost:5173',
    credentials:true 
}

app.use(cors(corsOption));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const PORT = process.env.PORT || 3000 ;

app.listen(PORT , ()=>{
    //connectDB();
    console.log(`Server running at port ${PORT}`);
})


// mongodb+srv://siddhantpote20_db_user:IEUqbEtK8rYk1FJc@cluster0.altn7xx.mongodb.net/ 



