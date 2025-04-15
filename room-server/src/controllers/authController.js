const User = require("../models/User");
const { sendEmail } = require("../controllers/emailController");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const registerUser = async (req, res) => {
  try {
    let { username, firstname, lastname, email, phone, password } = req.body;
    phone = phone?.trim() || null;

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ success: false, message: "Username Already Exists" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ success: false, message: "Email Already Registered" });

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone)
        return res.status(400).json({ success: false, message: "Phone Number Already Registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username?.trim(),
      firstname: firstname?.trim(),
      lastname: lastname?.trim(),
      email: email?.trim(),
      phone,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    res.status(201).json({ success: true, message: "User registered successfully", user: savedUser });

  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed", error });
  }
};

const loginUserAuth = async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username?.trim();

    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ success: false, message: "Invalid Password" });

    const JWT_TOKEN = generateToken(user._id);

    res.cookie("JWT", JWT_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only on HTTPS in prod
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ success: true, message: "Login Success", userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login Failed", error });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const emailUser = await User.findOne({ email });
    if (!emailUser) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    const mailOptions = {
      to: email,
      subject: "Password Reset",
      html: `<html><body><main style='display:flex;flex-direction:column;justify-content:center;'>
        <h1>Password Reset Request</h1><p><b>Hey User!</b><br/>As per your request, 
        your password has been reset and you can click here to set new password 
        <a href='https://google.com'>Way to Reset</a></p></body></main></html>`,
    };

    await sendEmail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Email not sent", error: err });
  }
};
const logoutUser = (req, res) => {
  res.clearCookie("JWT").status(200).json({ success: true, message: "Logged out" });
};

module.exports = {
  loginUserAuth,
  forgotPassword,
  registerUser,
  logoutUser
};
