const redis = require("redis")

// LRU cache
const client = redis.createClient(process.env.REDIS_URL)

client.on("connect", () => {
  console.log("connected")
})

client.on("error", err => {
  console.log("Error " + err)
})

getCache = () => {
  return new Promise((resolve, reject) => {
    client.lrange("cache", 0, -1, (err, reply) => {
      if (err) {
        reject(err)
      }
      console.log(`The cache is: ${reply}.`)
      resolve(reply)
    })
  })
}

addToCache = gif => {
  return new Promise((resolve, reject) => {
    client.rpush("cache", gif, (err, reply) => {
      if (err) {
        reject(err)
      }
      console.log(`${gif} pushed to the cache.`)
      resolve(reply)
    })
  })
}

popCache = () => {
  return new Promise((resolve, reject) => {
    client.lpop("cache", (err, reply) => {
      if (err) {
        reject(err)
      }
      console.log(`Popped ${reply} from cache.`)
      resolve(reply)
    })
  })
}

module.exports = {
  getCache,
  addToCache,
  popCache
}
