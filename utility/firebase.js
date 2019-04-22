// Firebase setup

const firebase = require('firebase');

require('dotenv').config();

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

getActiveUsers = () => {
  return new Promise((resolve, reject) => {
    database.ref('emails').orderByChild('active').equalTo(1).once("value", snapshot => {
      resolve(snapshot); 
    })
    .catch((err) => {
      reject(err);
    });
  });
};

module.exports = { 
  firebase, 
  database,
  getActiveUsers 
};