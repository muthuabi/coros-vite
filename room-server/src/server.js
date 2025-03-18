const express=require("express");
const app=express();
const denv=require("dotenv");
const cors=require("cors");
denv.config();
const PORT=process.env.PORT || 5000;
const userArray=[
    {username:"admin@coros.in",password:"admin.coros.in"},
    {username:"subadmin@coros.in",password:"subadmin.coros.in"},
    {username:"viewer@coros.in",password:"viewer.coros.in"},
];
app.use(express.json());
app.use(cors());
app.get("/",(req,res)=>{
    res.send("Hello World");
});
app.post("/login-user-auth",(req,res)=>{
    const {username,password}=req.body;
    const user=userArray.find((user)=>user.username===username);
    if(user){
        if(user.password===password){
            res.status(200).json({message:"Login Success"});
        }else{
            res.status(401).json({message:"Invalid Password"});
        }
    }else{
        res.status(404).json({message:"User Not Found"});
    }
});
app.listen(PORT,(svr)=>{
    console.log(`Server is running on port ${PORT}`);
});