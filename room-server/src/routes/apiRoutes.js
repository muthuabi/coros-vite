const express=require("express");
const router=express.Router();
const authRoutes=require("../routes/authRoutes");
const userRoutes=require("../routes/userRoutes");
const adminRoutes=require("../routes/adminRoutes");
router.use("/auth",authRoutes);
router.use("/user",userRoutes);
router.use("/admin",adminRoutes);
module.exports=router;