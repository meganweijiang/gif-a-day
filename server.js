const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;
const handlebars = require('handlebars');
const templateNew = './templates/new.html';
const util =  require('./utility/util');
const firebase = require('./utility/firebase');
const emailer = require('./utility/emailer');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'client/build')));

require('dotenv').config();

// Check if email exists in Firebase
app.get('/api/exists/:email', (req, res) => {
  console.log('Checking if email exists');
  parsedEmail = req.params.email.toLowerCase();
  firebase.database.ref('emails').orderByChild('email').equalTo(parsedEmail).once("value", snapshot => {
    if (snapshot.val() !== null) {
      console.log('Email exists!');
      return res.send(snapshot.val());
    }
    console.log('Email does not exist');
    return res.send(false);
  })
  .catch(err => {
    return res.status(400).send(err);
  })
});

// Add new email
app.post('/api/add', (req, res) => {
  const type = req.body.type;
  const parsedEmail = req.body.email.toLowerCase();
  const encrypted = util.encrypt(parsedEmail);
  const unsubLink = `${process.env.UNSUB_LINK}/${encrypted}`;
  firebase.database.ref('emails').push({
    email: parsedEmail,
    active: 1,
    type: req.body.type
  })
  .then(() => {
    return util.getGif(type);
  })
  .then((gif) => {
    util.readTemplate(templateNew)
    .then((res) => {
      const email = handlebars.compile(res);
      const replacements = {
        gif,
        unsubLink,
        type
      }
      const htmlToSend = email(replacements);
      const mailOptions = {
        from: `GIF a Day <${process.env.EMAIL_ADDRESS}>`,
        to: parsedEmail,
        subject: 'Welcome to GIF a Day!',
        html: htmlToSend
      };
      emailer.transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      })
    })
  })
  .then(() => {
    return res.send(true)
  })
  .catch(err => {
    return res.status(400).send(err);
  });
});


// Update existing email preferences and make active
app.post('/api/update', (req, res) => {
  console.log(`Updating email preferences for ${req.body.key}`);
  firebase.database.ref(`emails/${req.body.key}/active`).set(1)
  .then(() => {
    firebase.database.ref(`emails/${req.body.key}/type`).set(req.body.type)
  })
  .then(() => {
    return res.send(true);
  })
  .catch(err => {
    return res.status(400).send(err);
  });
});

// Unsubscribe by setting active to 0 
app.post('/api/unsubscribe', (req, res) => { 
  console.log(`Unsubscribing ${req.body.key}`)
  firebase.database.ref(`emails/${req.body.key}/active`).set(0)
  .then(() => {
    return res.send(true)
  })
  .catch(err => {
    return res.status(400).send(err);
  });
});

// Decrypt id value from URL and automatically unsubscribe
app.post('/api/decrypt', (req, res) => {
  console.log("Decrypting value");
  try {
    const str = util.decrypt(req.body.id);
    return res.send({ email: str })
  } catch (err) {
    return res.status(400).send(err);
  }
});

// check if prod environment
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));