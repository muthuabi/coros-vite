const User = require("../models/User");
const { sendEmail } = require("../controllers/emailController");
const registerUser = async (req, res) => {
  try {
    let {username, firstname, lastname, email, phone, password } = req.body;
    phone=phone?.trim()||null;
    const existingUser = await User.findOne({username});
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username Already Exists" });
    }
    const existingEmail = await User.findOne({email});
    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email Already Registered" });
    }
    if(phone)
    {
      const existingPhone=await User.findOne({phone});
      if(existingPhone)
      {
        return res.status(400).json({success:false,message:"Phone Number Already Registered"});
      }
    }
    const newUser = new User({
      username:username?.trim(),
      firstname:firstname?.trim(),
      lastname:lastname?.trim(),
      email:email?.trim(),
      phone,
      password,
    });
    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: savedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Registration failed", error });
  }
};
const loginUserAuth = async (req, res) => {
  try {
    let { username , password } = req.body;
    username=username?.trim();
    const user = await User.findOne({$or:[{ username: username },{email:username}]});
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    res.status(200).json({ success: true, message: "Login Success" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login Failed", error });
  }
};
const forgotPassword = async(req, res) => {
  try{
  const {email} = req.body;
  const mailOptions = {
    to: email,
    subject: "Password Reset",
    html: `<html><body><main style='display:flex;flex-direction:column;justify-content:center;'>
    <h1>Password Reset Request</h1><p><b>Hey User!</b><br/>As per your request, 
    your password has been reset and you can click here to set new password 
    <a href='https://google.com'>Way to Reset</a></p></body></main></html>`,
  };
  const emailUser = await User.findOne({email});
  if (!emailUser) {
    res
      .status(404)
      .json({
        success: false,
        message: "Email not found",
        error: "Email not found"
      });
    return;
  }
  sendEmail(mailOptions)
    .then((info) => {
      res
        .status(200)
        .json({ success: true, message: "Email sent", data: info });
    })
    .catch((error) => {
      res.status(500).json({ sucess: false, message: "Email not sent", error });
    });
  }
  catch(err)
  {
    res.status(500).json({success:false,message:"Email not sent",error:err});
  }
};

module.exports = {
  loginUserAuth,
  forgotPassword,
  registerUser,
};
