const nodemailer = require('nodemailer');


function sendNotification(message,ip){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS
        }
      });
    
      let mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: 'Heroku Alert',
        text: `${message} --> this request originated from ${ip}`
      };
    
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.error(error.message);
        }
        console.log('Email sent: %s', info.messageId);
      });
}

module.exports=sendNotification