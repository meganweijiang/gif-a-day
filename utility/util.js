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
  }); 
};

callGiphyApi = (type, attempt) => {
  return new Promise((resolve, reject) => {
    let gif = '';
    if (attempt > process.env.MAX_ATTEMPTS) {
      reject('Too many retries. Failed to get GIF.');
    }
    console.log(`Attempt ${attempt} to get GIF.`);
    fetch(`https://api.giphy.com/v1/gifs/random?tag=${type}&api_key=${process.env.GIPHY_API_KEY}`)
    .then((data) => {
      return data.json();
    })
    .then((body) => {
      gif = body.data.images.downsized.url;
      return;
    })
    .then(() => {
      return fetch(process.env.CACHE_ENDPOINT);
    })
    .then((res) => {
      return res.json();
    }) 
    .then((currentCache) => {
      if (currentCache.includes(gif)) {
        resolve(callGiphyApi(type, attempt + 1));
      }
      resolve(gif);
    })
    .catch((err) => {
      reject(err);
    });
  });
};

// Get GIF from GIPHY
getGif = async (type) => {
  console.log(`Getting GIF for ${type}`);
  return new Promise((resolve, reject) => {
    callGiphyApi(type, 1)
    .then((url) => {
      fetch(process.env.CACHE_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ url }),
        headers:{
          'Content-Type': 'application/json'
        }
      })
      .then((cache) => {
        return cache.json();
      })
      .then((cache) => {
        return console.log("LRU cache is now: ", cache);
      })
      return url;
    })
    .then((url) => {
      resolve(url);
    })
    .catch((err) => {
      reject(err);
    });
  });
};

// Encrypt a string
encrypt = (id) => {
  const key = crypto.createCipher('aes-128-cbc', process.env.CRYPTO_PW);
  return key.update(id, 'utf8', 'hex') + key.final('hex');
};

// Decrypt a string
decrypt = (id) => {
  const key = crypto.createDecipher('aes-128-cbc', process.env.CRYPTO_PW);
  return key.update(id, 'hex', 'utf8') + key.final('utf8');
};

module.exports = {
  readTemplate,
  getGif,
  encrypt,
  decrypt
};