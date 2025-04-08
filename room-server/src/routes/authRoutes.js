const express=require("express");
const {loginUserAuth,forgotPassword,registerUser}=require("../controllers/authController");
const router=express.Router();
router.post("/login-user-auth",loginUserAuth);
router.post("/forgot-password",forgotPassword);
router.post("/register-user",registerUser);
module.exports=router;