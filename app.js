// Import statements
const config = require('./utils/config')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const wordsRouter = require('./controllers/words')
const authRouter = require('./controllers/auth')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
const url = config.MONGODB_URI
logger.info('connecting to', url)

mongoose.connect(url)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.info('error connecting to MongoDB:', error.message)
  })

// Adding initial middlewares
app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
morgan.token('body', function (req) { JSON.stringify(req.body); return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', { skip: () => process.env.NODE_ENV === 'test' }))

app.use('/api/words', wordsRouter)
app.use('/api/auth', authRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app