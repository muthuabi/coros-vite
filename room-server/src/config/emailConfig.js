const nodemailer = require("nodemailer");
const denv=require("dotenv");
denv.config();
const EU=process.env.EMAIL_USER;
// console.log(EU);
// console.log(process.env.EMAIL_PASS);
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EU,
        pass: process.env.EMAIL_PASS, 
    },
});

module.exports = {transporter,EU};
