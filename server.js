const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const handlebars = require('handlebars');
const templateNew = './templates/new.html';
const util =  require('./utility/util');
const firebase = require('./utility/firebase');
const emailer = require('./utility/emailer');
const cache = require('./utility/cache');

const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'client/build')));

require('dotenv').config();

// Delete cache
app.delete('/api/cache', (req, res) => {
  cache.deleteCache()
  .then(() => {
    return res.status(200).send('Cache has been deleted.');
  })
})

// Get current cache
app.get('/api/cache', (req, res) => {
  cache.getCache()
  .then((currentCache) => {
    console.log(currentCache);
    return res.status(200).send(currentCache);
  })
  .catch(err => {
    return res.status(500).send(err);
  });
});

// Add new gif to cache
app.post('/api/cache', async (req, res) => {
  const gif = req.body.url;
  cache.getCache()
  .then((currentCache) => {
    const length = currentCache.length;
    if (length <= parseInt(process.env.CACHE_MAX)) {
      return cache.addToCache(gif);
    }
    cache.popCache()
    .then(() => {
      return cache.addToCache(gif);
    });
  })
  .then(() => {
    return cache.getCache();
  })
  .then((newCache) => {
    return res.status(200).send(newCache);
  })
  .catch(err => {
    return res.status(500).send(err);
  });
});

// Check if email exists in Firebase
app.get('/api/:email', (req, res) => {
  console.log('Checking if email exists');
  parsedEmail = req.params.email.toLowerCase();
  firebase.database.ref('emails').orderByChild('email').equalTo(parsedEmail).once("value", snapshot => {
    if (snapshot.val() !== null) {
      console.log('Email exists!');
      return res.status(200).send(snapshot.val());
    }
    return res.status(400).send({ message: 'Email address not found' });
  })
  .catch(err => {
    return res.status(500).send(err);
  })
});

// Add new email address to database and send first email
app.post('/api/add', (req, res) => {
  const type = req.body.type;
  const parsedEmail = req.body.email.toLowerCase();
  const encrypted = util.encrypt(parsedEmail);
  const unsubLink = `${process.env.UNSUB_LINK}/${encrypted}`;
  firebase.database.ref('emails').push({
    email: parsedEmail,
    active: 1,
    type
  })
  .then(() => {
    return util.getGif(type);
  })
  .then((gif) => {
    return util.readTemplate(templateNew)
    .then((res) => {
      const email = handlebars.compile(res);
      const replacements = {
        gif,
        unsubLink,
        type
      }
      const htmlToSend = email(replacements);
      return mailOptions = {
        from: `GIF a Day <${process.env.EMAIL_ADDRESS}>`,
        to: parsedEmail,
        subject: 'Welcome to GIF a Day!',
        html: htmlToSend
      };
    })
    .then((mailOptions) => {
      return emailer.transporter.sendMail(mailOptions);
    })
    .then((info) => {
      return console.log(info.response);
    });
  })
  .then(() => {
    return res.status(200).send({ message: 'Successfully added to mailing list.' });
  })
  .catch(err => {
    return res.status(500).send(err);
  });
});


// Update existing email preferences and make active
app.post('/api/update', (req, res) => {
  console.log(`Updating email preferences for ${req.body.key}`);
  firebase.database.ref(`emails/${req.body.key}`).update({ active: 1, type: req.body.type })
  .then(() => {
    return res.status(200).send({ message: 'Successfully updated email preferences.' });
  })
  .catch(err => {
    return res.status(500).send(err);
  });
});

// Unsubscribe by setting active to 0 
app.post('/api/unsubscribe', (req, res) => { 
  console.log(`Unsubscribing ${req.body.key}`);
  firebase.database.ref(`emails/${req.body.key}/active`).set(0)
  .then(() => {
    return res.status(200).send({ message: 'Successfully unsubscribed.' });
  })
  .catch(err => {
    return res.status(500).send(err);
  });
});

// Decrypt id value from URL and automatically unsubscribe
app.post('/api/decrypt', (req, res) => {
  console.log("Decrypting value");
  try {
    const str = util.decrypt(req.body.id);
    return res.send({ email: str });
  } catch (err) {
    return res.status(500).send(err);
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