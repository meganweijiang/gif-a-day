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

callGiphyApi = (type) => {
  return new Promise((resolve, reject) => {
    fetch(`https://api.giphy.com/v1/gifs/random?tag=${type}&api_key=${process.env.GIPHY_API_KEY}`)
    .then(data => {
      return data.json();
    })
    .then(body => {
      resolve(body.data.images.downsized.url);
    })
    .catch(err => {
      reject(err);
    })
  })
}

// Get GIF from GIPHY
getGif = async (type) => {
  let url = '';
  let attempts = 1;
  console.log(`Getting GIF for ${type}`);
  let cache = await fetch(process.env.CACHE_ENDPOINT);
  cache = await cache.json();
  return new Promise((resolve, reject) => {
    callGiphyApi(type)
    .then(response => {
      url = response;
      if (cache.includes(url)) {
        url = '';
      }
      if (!!url) {
        return url;
      }
      while (!!url == false && attempts <= 5) {
        console.log('Retrying to get GIF');
        attempts += 1;
        callGiphyApi(type)
        .then(response => {
          url = response;
          if (url) {
            return url;
          }
        });
      }
      reject('Failed to get GIF');
    })
    .then(url => {
      fetch(process.env.CACHE_ENDPOINT, {
        method: 'POST', // or 'PUT'
        body: JSON.stringify({ url }), // data can be `string` or {object}!
        headers:{
          'Content-Type': 'application/json'
        }
      })
      .then(cache => {
        return cache.json();
      })
      .then(cache => {
        console.log("LRU cache is now: ", cache);
      })
      return url;
    })
    .then(url => {
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
  return key.update(id, 'utf8', 'hex') + key.final('hex');
}

// Decrypt a string
decrypt = (id) => {
  const key = crypto.createDecipher('aes-128-cbc', process.env.CRYPTO_PW);
  return key.update(id, 'hex', 'utf8') + key.final('utf8');
}

module.exports = {
  readTemplate,
  getGif,
  encrypt,
  decrypt
}