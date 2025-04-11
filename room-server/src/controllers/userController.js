
const User=require('../models/User');
const userExists = async (req, res) => {
    const {username,email}=req.body;
    if(username)
    {
        const existingUser = await User.findOne({username});
        if(existingUser)
        {
            return res.status(200).json({success:true,message:"Username Already Exists"});
        }
    }
    if(email)
    {
        const existingEmail = await User.findOne({email});
        if(existingEmail)
        {
          return res.status(200).json({success:true,message:"Email Already Exists"});
        }
    }
    return res.status(404).json({success:false,message:"User does not exist"});
}   
module.exports={
    userExists
}