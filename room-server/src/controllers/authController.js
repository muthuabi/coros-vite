const User = require("../models/User");
const express = require("express");
const { sendEmail } = require("../controllers/emailController");
const userArray = [
  { username: "admin@coros.in", password: "admin.coros.in" },
  { username: "subadmin@coros.in", password: "subadmin.coros.in" },
  { username: "viewer@coros.in", password: "viewer.coros.in" },
];
const emailArray = [
  {
    email: "muthuabi292@gmail.com",
  },
  { email: "muthuabi027@gmail.com" },
  { email: "sathishboost3@gmail.com" },
  { email: "murs4002@gmail.com" },
  {
    email: "murugan001ab@gmail.com"
  },
  {
    email:"gowtham01102@gmail.com"
  }
];
const loginUserAuth = async (req, res) => {
  const { username = "admin@coros.in", password = "admin.coros.in" } = req.body || {};

  try {
    const user = await User.findOne({ email: username });
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
const forgotPassword = (req, res) => {
  const { email = "muthuabi292@gmail.com" } = req.body || {};
  const mailOptions = {
    to: email,
    subject: "Password Reset",
    html: `<html><body><main style='display:flex;flex-direction:column;justify-content:center;'>
    <h1>Password Reset Request</h1><p><b>Hey User!</b><br/>As per your request, 
    your password has been reset and you can click here to set new password 
    <a href='https://google.com'>Way to Reset</a></p></body></main></html>`,
  };
  const emailUser = emailArray.find((emailUser) => emailUser.email === email.trim());
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
};
module.exports = {
  loginUserAuth,
  forgotPassword,
};
