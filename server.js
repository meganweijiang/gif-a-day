const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;
const firebase = require('firebase');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const templateNew = './templates/new.html';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'client/build')));

require('dotenv').config();

readTemplate = (path) => {
  console.log('reading template')
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

app.post('/api/add', (req, res) => {
  database.ref('emails').push({
    email: req.body.email,
    active: 1
  })
    .then(() => {
      getGif()
      .then((gif) => {
        readTemplate(templateNew)
        .then((res) => {
          const email = handlebars.compile(res);
          const replacements = {
            gif: gif
          }
          const htmlToSend = email(replacements);
          const mailOptions = {
            from: 'Cat GIF a Day <donotreply@catgifaday.com>',
            to: req.body.email,
            subject: 'Welcome to Cat GIF a Day!',
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
    })
    .then(() => {
      return res.send(true)
    })
    .catch(err => {
      throw err;
    });
});

app.post('/api/exists', (req, res) => {
  database.ref('emails').orderByChild('email').equalTo(req.body.email).once("value", snapshot => {
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
  database.ref(`emails/${req.body.key}/active`).set(1)
    .then(() => {
      return res.send(true)
    })
    .catch(err => {
      throw err;
    });
});

app.get('/api/unsubscribe/:id', (req, res) => { 
  database.ref(`emails/${req.params.id}/active`).set(0)
    .then(() => {
      return res.send(true)
    })
    .catch(err => {
      throw err;
    });
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