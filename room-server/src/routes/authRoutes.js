const express=require("express");
const {loginUserAuth,forgotPassword}=require("../controllers/authController");
const router=express.Router();
router.post("/auth/login-user-auth",loginUserAuth);
router.get("/auth/login-user-auth",loginUserAuth);
router.post("/auth/forgot-password",forgotPassword);
router.get("/auth/forgot-password",forgotPassword);
module.exports=router;