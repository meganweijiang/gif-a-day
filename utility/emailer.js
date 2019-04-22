// Nodemailer setup;

const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASS
  }
});

sendEmail = (config, attempt) => {
  return new Promise((resolve, reject) => {
    if (attempt > process.env.MAX_ATTEMPTS) {
      reject('Failed to send email. Too many retries.');
    }
    transporter.sendMail(config, function(error, info){
      if (error) {
        resolve(sendEmail(config, attempt + 1));
      } else {
        console.log(`Email sent to ${config.to}.`);
        resolve(`Email sent to ${config.to}.`);
      }
    });
  });
};

module.exports = {
  nodemailer,
  transporter,
  sendEmail
};