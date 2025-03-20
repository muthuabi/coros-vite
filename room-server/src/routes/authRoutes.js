const express=require("express");
const {loginUserAuth}=require("../controllers/authController");
const router=express.Router();
router.post("/auth/login-user-auth",loginUserAuth);
module.exports=router;