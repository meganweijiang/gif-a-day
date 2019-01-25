const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
const firebase = require('firebase');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require('dotenv').config();

var config = {
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
    return res.send(true)
  })
  .catch(e => {
    throw new Error (e);
  });
});

app.post('/api/exists', (req, res) => {
  console.log(req.body.email);
  database.ref('emails').orderByChild('email').equalTo(req.body.email).once("value", snapshot => {
    if (snapshot.val() !== null) {
      return res.send(snapshot.val());
    }
    return res.send(false);
  })
  .catch(e => {
    throw new Error (e);
  })
});

app.post('/api/update', (req, res) => {
  database.ref(`emails/${req.body.key}/active`).set(1)
  .then(() => {
    return res.send(true)
  })
  .catch(e => {
    throw new Error (e);
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));