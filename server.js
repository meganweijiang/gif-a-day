const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const app = express()
const handlebars = require("handlebars")
const templateNew = "./templates/new.html"
const templateUpdate = "./templates/update.html"
const util = require("./utility/util")
const firebase = require("./utility/firebase")
const emailer = require("./utility/emailer")
const cache = require("./utility/cache")

const port = process.env.PORT || 5000

const unsubLink = process.env.UNSUB_LINK

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "client/build")))

require("dotenv").config()

// Get types of gifs
app.get("/api/types", (req, res) => {
  let keys = []

  firebase.database
    .ref("options")
    .once("value", snapshot => {
      snapshot.forEach(option => {
        if (option.val() == 1) {
          keys.push(option.key)
        }
      })
    })
    .then(() => {
      return res.status(200).send(keys)
    })
    .catch(err => {
      return res.status(500).send(err)
    })
})

// Get current cache
app.get("/api/cache", (req, res) => {
  cache
    .getCache()
    .then(currentCache => {
      return res.status(200).send(currentCache)
    })
    .catch(err => {
      return res.status(500).send(err)
    })
})

// Add new gif to cache
app.post("/api/cache", async (req, res) => {
  const gif = req.body.url
  cache
    .getCache()
    .then(currentCache => {
      const length = currentCache.length
      if (length > parseInt(process.env.CACHE_MAX)) {
        return cache.popCache()
      }
    })
    .then(() => {
      return cache.addToCache(gif)
    })
    .then(() => {
      return cache.getCache()
    })
    .then(newCache => {
      return res.status(200).send(newCache)
    })
    .catch(err => {
      return res.status(500).send(err)
    })
})

// Check if email exists in Firebase
app.get("/api/:email", (req, res) => {
  console.log("Checking if email exists")
  parsedEmail = req.params.email.toLowerCase()
  firebase.database
    .ref("emails")
    .orderByChild("email")
    .equalTo(parsedEmail)
    .once("value", snapshot => {
      if (snapshot.val() !== null) {
        console.log("Email exists!")
        return res.status(200).send(snapshot.val())
      }
      return res.status(404).send(false)
    })
    .catch(err => {
      return res.status(500).send(err)
    })
})

// Add new email address to database and send first email
app.post("/api/add", (req, res) => {
  const type = req.body.type
  const parsedEmail = req.body.email.toLowerCase()
  const encrypted = util.encrypt(parsedEmail)
  const unsub = `${unsubLink}/${encrypted}`

  firebase.database
    .ref("emails")
    .push({
      email: parsedEmail,
      active: 1,
      type
    })
    .then(async () => {
      const template = await util.readTemplate(templateNew)
      const gif = await util.getGif(type)
      const email = handlebars.compile(template)
      const replacements = {
        gif,
        unsubLink: unsub,
        type
      }
      const htmlToSend = email(replacements)
      return (mailOptions = {
        from: `GIF a Day <${process.env.EMAIL_ADDRESS}>`,
        to: parsedEmail,
        subject: "Welcome to GIF a Day!",
        html: htmlToSend
      })
    })
    .then(mailOptions => {
      return emailer.sendEmail(mailOptions, 1)
    })
    .then(() => {
      return res
        .status(200)
        .send({ message: "Successfully added to mailing list." })
    })
    .catch(err => {
      return res.status(500).send(err)
    })
})

// Update existing email preferences, make active, and send email
app.put("/api/update", (req, res) => {
  console.log(`Updating email preferences for ${req.body.key}`)

  try {
    const type = req.body.type

    firebase.database.ref(`emails/${req.body.key}`).update({ active: 1, type })

    firebase.database
      .ref(`emails/${req.body.key}/email`)
      .once("value", async snapshot => {
        const address = snapshot.val()
        const template = await util.readTemplate(templateUpdate)
        const gif = await util.getGif(type)
        const email = handlebars.compile(template)
        const encrypted = util.encrypt(address)
        const unsub = `${unsubLink}/${encrypted}`
        const replacements = {
          gif,
          unsubLink: unsub,
          type
        }
        const htmlToSend = email(replacements)
        mailOptions = {
          from: `GIF a Day <${process.env.EMAIL_ADDRESS}>`,
          to: address,
          subject: "Your GIF a Day preferences have been updated",
          html: htmlToSend
        }
        return emailer.sendEmail(mailOptions, 1)
      })
      .then(() => {
        return res
          .status(200)
          .send({ message: "Successfully updated email preferences." })
      })
      .catch(err => {
        return res.status(500).send(err)
      })
  } catch (err) {
    return res.status(500).send(err)
  }
})

// Unsubscribe
app.put("/api/unsubscribe", (req, res) => {
  console.log(`Unsubscribing ${req.body.key}`)
  firebase.database
    .ref(`emails/${req.body.key}/active`)
    .set(0)
    .then(() => {
      return res.status(200).send({ message: "Successfully unsubscribed." })
    })
    .catch(err => {
      return res.status(500).send(err)
    })
})

// Decrypt email value from URL
app.post("/api/decrypt", (req, res) => {
  console.log("Decrypting value")
  try {
    const str = util.decrypt(req.body.id)
    return res.send({ email: str })
  } catch (err) {
    return res.status(500).send(err)
  }
})

// check if prod environment
if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")))
  // Handle React routing, return all requests to React app
  app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"))
  })
}

app.listen(port, () => console.log(`Listening on port ${port}`))
