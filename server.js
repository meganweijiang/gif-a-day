const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const templateNew = './templates/new.html';
const util =  require('./utility/util');
const firebase = require('./utility/firebase');
const emailer = require('./utility/emailer');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'client/build')));

require('dotenv').config();

app.post('/api/add', (req, res) => {
  const unsubLink = process.env.UNSUB_LINK;
  const type = req.body.type;
  firebase.database.ref('emails').push({
    email: req.body.email,
    active: 1,
    type: req.body.type
  })
    .then(() => {
      util.getGif(type)
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
            from: 'GIF a Day <donotreply@catgifaday.com>',
            to: req.body.email,
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
    })
    .then(() => {
      return res.send(true)
    })
    .catch(err => {
      throw err;
    });
});

app.post('/api/exists', (req, res) => {
  firebase.database.ref('emails').orderByChild('email').equalTo(req.body.email).once("value", snapshot => {
    if (snapshot.val() !== null) {
      return res.send(snapshot.val());
    }
    return res.send(false);
  })
    .catch(err => {
      throw err;
    })
});

app.post('/api/update', (req, res) => {
  firebase.database.ref(`emails/${req.body.key}/active`).set(1)
    .then(() => {
      firebase.database.ref(`emails/${req.body.key}/type`).set(req.body.type)
        .then(() => {
          return res.send(true);
        })
    })
    .catch(err => {
      throw err;
    });
});

app.get('/api/unsubscribe/:id', (req, res) => { 
  firebase.database.ref(`emails/${req.params.id}/active`).set(0)
    .then(() => {
      return res.send(true)
    })
    .catch(err => {
      throw err;
    });
});

app.post('/api/decrypt', (req, res) => {
  try {
    util.decrypt(req.body.id);
    firebase.database.ref(`emails/${mystr}/active`).set(0)
      .then(() => {
        return res.send(true)
      })
      .catch(err => {
        throw err;
      });
  } catch (err) {
    throw err;
  }
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));