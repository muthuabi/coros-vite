const express=require("express");
const router=express.Router();
const {userExists}=require("../controllers/userController");
router.post("/user-exists",userExists); 
module.exports=router;