const express=require("express");
const app=express();
const denv=require("dotenv");
denv.config();
const PORT=process.env.PORT || 5000;

app.listen(PORT,(svr)=>{
    console.log(`Server is running on port ${PORT}`);
});