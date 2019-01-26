const handlebars = require('handlebars');
const templateDaily = '../templates/daily.html';
const util =  require('../utility/util');
// const firebase = require('../utility/firebase');
// const emailer = require('../utility/emailer');
const firebase = require('firebase');
const nodemailer = require('nodemailer');

require('dotenv').config({ path: '../.env' });

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASS
  }
});

const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID
};
firebase.initializeApp(config);

const database = firebase.database();

sendEmails = () => {
  const unsubLink = process.env.UNSUB_LINK;
  util.getGif()
    .then((gif) => {
      util.readTemplate(templateDaily)
        .then((res) => {
          const email = handlebars.compile(res);
          const replacements = {
            gif,
            unsubLink
          }
          const htmlToSend = email(replacements);
          database.ref('emails').orderByChild('active').equalTo(1).once("value", snapshot => {
            snapshot.forEach(email => {
              let emailAddress = email.val().email;
              const mailOptions = {
                from: 'Cat GIF a Day <donotreply@catgifaday.com>',
                to: emailAddress,
                subject: "Here's your daily cat GIF",
                html: htmlToSend
              };
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              })
            }) 
          }) 
            .then(() => {
              firebase.database().goOffline();
            })      
        })
    })
    .catch((err) => {
      throw err;
    })
}

sendEmails()

