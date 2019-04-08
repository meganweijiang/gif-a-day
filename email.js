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
};

sendEmails = async () => {  
  await firebase.database.ref('options').once("value", snapshot => {
    snapshot.forEach(option => {
      keys.push(option.key);
    });
  });

  await getGifs(keys);

  util.readTemplate(templateDaily)
  .then((res) => {
    firebase.database.ref('emails').orderByChild('active').equalTo(1).once("value", snapshot => {
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
    }) 
    .then(() => {
      firebase.firebase.database().goOffline();
    })      
    .catch((err) => {
      console.log(err);
    });
  });
};

sendEmails();

