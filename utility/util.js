const crypto = require('crypto');
const fs = require('fs');

// Read HTML template
readTemplate = (path) => {
  console.log('Reading template')
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

// Get GIF from GIPHY
getGif = (type) => {
  console.log(`Getting GIF for ${type}`);
  return new Promise((resolve, reject) => {
    fetch(`https://api.giphy.com/v1/gifs/random?tag=${type}&api_key=${process.env.GIPHY_API_KEY}`)
      .then(response => response.json())
      .then(body => {
        const url = body.data.images.downsized.url;
        resolve(url);
      })
      .catch(err => {
        reject(err);
      });
  })
}

// Encrypt a string
encrypt = (id) => {
  const key = crypto.createCipher('aes-128-cbc', process.env.CRYPTO_PW);
  const str = key.update(id, 'utf8', 'hex')
  str += key.update.final('hex');
  return str;
}


// Decrypt a string
decrypt = (id) => {
  const key = crypto.createDecipher('aes-128-cbc', process.env.CRYPTO_PW);
  const decrypted = key.update(id, 'hex', 'utf8')
  decrypted += key.update.final('utf8');
  return decrypted;
}

module.exports = {
  readTemplate,
  getGif,
  encrypt,
  decrypt
}