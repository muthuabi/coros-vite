const  {transporter,EU} = require("../config/emailConfig");

const sendEmail=(mailOptions)=>{
    mailOptions.from=EU;
    if(!mailOptions.subject || !mailOptions.to || (!mailOptions.html && !mailOptions.text) )
    {
        return new Promise((resolve,reject)=>{
            reject({error:new Error("Missing required fields")});
        });
    }
    return transporter.sendMail(mailOptions);
}

module.exports={sendEmail};