const handlebars = require('handlebars');
const templateDaily = './templates/daily.html';
const util = require('./utility/util');
const emailer = require('./utility/emailer');
const firebase = require('./utility/firebase');

require('dotenv').config();

getGifs = async (keys) => {
  let gifs = {};
  for (let item of keys) {
    let gif = await util.getGif(item);
    gifs[item] = gif;
  }
  return gifs;
};

sendEmails = async () => {  
  let keys = [];
  firebase.database.ref('options').once("value", snapshot => {
    snapshot.forEach((option) => {
      keys.push(option.key);
    });
  })
  .then(() => {
    return getGifs(keys);
  })
  .then(async (gifs) => {
    const template = await util.readTemplate(templateDaily);
    const snapshot = await firebase.getActiveUsers();
    return snapshot.forEach((email) => {
      const emailAddress = email.val().email;
      const type = email.val().type;
      const encrypted = util.encrypt(emailAddress);
      const unsubLink = `${process.env.UNSUB_LINK}/${encrypted}`;
      const gif = gifs[type];
      const emailTemp = handlebars.compile(template);
      const replacements = {
        gif,
        unsubLink,
        type
      };
      const htmlToSend = emailTemp(replacements);
      const mailOptions = {
        from: `GIF a Day <${process.env.EMAIL_ADDRESS}>`,
        to: emailAddress,
        subject: `Here's your daily ${type} GIF`,
        html: htmlToSend
      };
      
      emailer.sendEmail(mailOptions, 1);
    }); 
  })
  .then(() => {
    console.log("Daily emails have been sent.");
    return firebase.firebase.database().goOffline();
  })      
  .catch((err) => {
    console.log(`An error occurred while sending daily emails: ${err}`);
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

