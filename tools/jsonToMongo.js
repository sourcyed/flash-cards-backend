const fs = require('fs')
const mongoose = require('mongoose')
const Word = require('../models/word')
const logger = require('../utils/logger')
const config = require('../utils/config')

mongoose.set('strictQuery', false)
const url = config.MONGODB_URI
logger.info('connecting to', url)

mongoose.connect(url)
  .then(() => {
    logger.info('connected to MongoDB')

    const db = process.argv[2]
    const words = JSON.parse(fs.readFileSync(db).toString()).words

    words
      .forEach(w => {
        const word = new Word({
          word: w.word,
          meaning: w.meaning,
          sentence: w.sentence,
          picture: w.picture
        })
        word.save().then(sw => console.log(sw, 'saved'))
      })
      .catch(error => {
        console.error('Error fetching words: ', error)
      })
      .finally(() => {
        mongoose.connection.close()
      })
  })
  .catch(error => {
    logger.info('error connecting to MongoDB: ', error.message)
  })
