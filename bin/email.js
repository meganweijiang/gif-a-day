const handlebars = require('handlebars');
const templateDaily = '../templates/daily.html';
const util =  require('../utility/util');
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

const keys = [];
const gifs = {};

getGifs = async (keys) => {
  for (let item of keys) {
    let gif = await util.getGif(item);
    gifs[item] = gif;
  }
}
sendEmails = async () => {  
  await database.ref('options').once("value", snapshot => {
    snapshot.forEach(option => {
      keys.push(option.key);
    })
  });
  await getGifs(keys);
  util.readTemplate(templateDaily)
  .then((res) => {
    database.ref('emails').orderByChild('active').equalTo(1).once("value", snapshot => {
      snapshot.forEach(email => {
        const emailAddress = email.val().email;
        const type = email.val().type;
        const encrypted = util.encrypt(emailAddress);
        const unsubLink = `${process.env.UNSUB_LINK}/${encrypted}`;
        const gif = gifs[type];

        const emailTemp = handlebars.compile(res);
        const replacements = {
          gif,
          unsubLink,
          type
        }
        const htmlToSend = emailTemp(replacements);

        const mailOptions = {
          from: 'GIF a Day <donotreply@catgifaday.com>',
          to: emailAddress,
          subject: `Here's your daily ${type} GIF`,
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
  .catch((err) => {
    throw err;
  })
})
}

sendEmails()

