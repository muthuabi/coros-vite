const express=require("express");
const router=express.Router();
const {verifyToken}=require("../middleware/authMiddleware");
// router.get("/admin-profile",verifyToken,getAdminProfile);
// router.get("/all-users",verifyToken,getAllUsers);
// router.get("/user/:id",verifyToken,getUserById);
// router.post("/user/:id",verifyToken,updateUser);
module.exports=router;