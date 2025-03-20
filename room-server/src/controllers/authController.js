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
  { email: "sathishboost3@gmail.com" }
];
const loginUserAuth = (req, res) => {
  const { username = "admin@coros.in", password = "admin.coros.in" } =
    req.body || {};
  const user = userArray.find((user) => user.username === username);
  if (user) {
    if (user.password === password) {
      res.status(200).json({ sucess: true, message: "Login Success" });
    } else {
      res
        .status(401)
        .json({
          success: false,
          message: "Invalid Password",
          errror: "Invalid Password",
        });
    }
  } else {
    res
      .status(404)
      .json({
        sucess: false,
        message: "User Not found",
        error: "User Not Found",
      });
  }
};
const forgotPassword = (req, res) => {
  const { email = "muthuabi292@gmail.com" } = req.body || {};
  const mailOptions = {
    to: email,
    subject: "Password Reset",
    html: `<html><body><main style='display:flex;flex-direction:column;justify-content:center;'><h1>Password Reset Request</h1><p><b>Hey User!</b><br/>As per your request, your password has been reset and you can click here to set new password <a href='https://google.com'>Way to Reset</a></p></body></main></html>`,
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
