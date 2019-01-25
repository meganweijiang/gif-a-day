const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const firebase = require('firebase');
const fs = require('fs');
const templateDaily = '../templates/daily.html';

require('dotenv').config({ path: '../.env' });

readTemplate = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, {encoding: 'utf-8'}, (err, html) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(html);
      }
    });
  }) 
}

getGif = () => {
  return new Promise((resolve, reject) => {
    fetch(`https://api.giphy.com/v1/gifs/random?tag=cat&api_key=${process.env.GIPHY_API_KEY}`)
    .then(response => response.json())
    .then(body => {
      const url = body.data.images.original.url;
      resolve(url);
    })
    .catch(err => {
      reject(err);
    });
  })
}

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
  getGif()
    .then((gif) => {
      readTemplate(templateDaily)
        .then((res) => {
          const email = handlebars.compile(res);
          const replacements = {
            gif: gif
          }
          const htmlToSend = email(replacements);
          database.ref('emails').once("value", snapshot => {
            snapshot.forEach(email => {
              let emailAddress = email.val().email;
              let active = email.val().active;
              if (active === 1) {
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
              }
            }) 
          })       
        })
    })
    .then(() => {
      firebase.database().goOffline();
    })
    .catch((err) => {
      throw err;
    })
}

sendEmails()

