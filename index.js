// Import statements
const config = require('./utils/config')
const logger = require('./utils/logger')
const app = require('./app')
const https = require('https')
const fs = require('fs')

const DOMAIN = config.DOMAIN 
let PORT = config.PORT || 3001

let server = app

if (DOMAIN) {
  const options = {
      key: fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/privkey.pem`),
      cert: fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/cert.pem`),
      ca: fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/fullchain.pem`)
  }
  server = https.createServer(options,app)
  PORT = 443
}

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})
