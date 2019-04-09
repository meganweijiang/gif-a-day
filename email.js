const handlebars = require('handlebars');
const templateDaily = './templates/daily.html';
const util = require('./utility/util');
const emailer = require('./utility/emailer');
const firebase = require('./utility/firebase');

require('dotenv').config();

const keys = [];
const gifs = {};

getGifs = async (keys) => {
  for (let item of keys) {
    let gif = await util.getGif(item);
    gifs[item] = gif;
  }
  return;
};

sendEmails = async () => {  
  firebase.database.ref('options').once("value", snapshot => {
    snapshot.forEach((option) => {
      keys.push(option.key);
    });
  })
  .then(() => {
    return getGifs(keys);
  })
  .then(() => {
    return util.readTemplate(templateDaily);
  })
  .then((res) => {
    return firebase.database.ref('emails').orderByChild('active').equalTo(1).once("value", snapshot => {
      snapshot.forEach((email) => {
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
          from: `GIF a Day <${process.env.EMAIL_ADDRESS}>`,
          to: emailAddress,
          subject: `Here's your daily ${type} GIF`,
          html: htmlToSend
        };
        
        emailer.sendEmail(mailOptions, 1);
      }); 
    });
  })
  .then(() => {
    return firebase.firebase.database().goOffline();
  })      
  .catch((err) => {
    console.log(err);
    const mailOptions = {
      from: `GIF a Day <${process.env.EMAIL_ADDRESS}>`,
      to: process.env.SUPPORT_EMAIL_ADDRESS,
      subject: 'An error occurred with gif-a-day.',
      text: `The following error occurred when sending emails: ${err}.`
    };

    firebase.firebase.database().goOffline();
    return emailer.sendEmail(mailOptions, 1);
  });
};

sendEmails();

