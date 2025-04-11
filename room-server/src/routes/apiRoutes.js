const express=require("express");
const router=express.Router();
const authRoutes=require("../routes/authRoutes");
const userRoutes=require("../routes/userRoutes");
router.use("/auth",authRoutes);
router.use("/user",userRoutes);
module.exports=router;