const express=require("express");
const userArray=[
    {username:"admin@coros.in",password:"admin.coros.in"},
    {username:"subadmin@coros.in",password:"subadmin.coros.in"},
    {username:"viewer@coros.in",password:"viewer.coros.in"},
];
const loginUserAuth=(req,res)=>{
    const {username,password}=req.body;
    const user=userArray.find((user)=>user.username===username);
    if(user){
        if(user.password===password){
            res.status(200).json({sucess:true,message:"Login Success"});
        }else{
            res.status(401).json({success:false,message:"Invalid Password",errror:"Invalid Password"});
        }
    }else{
        res.status(404).json({sucess:false,message:"User Not Found",error:"User Not Found"});
    }
}
const forgotPassword=(req,res)=>{
    const {email}=req.body;
}
module.exports={
    loginUserAuth,forgotPassword
};