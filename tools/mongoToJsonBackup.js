const fs = require('fs')
const mongoose = require('mongoose')
const Word = require('../models/word')
const logger = require('../utils/logger')
const config = require('../utils/config')

const backup = 'backup/backup_' + new Date().toISOString() + '.json'

mongoose.set('strictQuery', false)
const url = config.MONGODB_URI
logger.info('connecting to', url)

mongoose.connect(url)
  .then(() => {
    logger.info('connected to MongoDB')

    Word.find({})
      .then(words => {
        words.map(w => {
          return {
            word: w.word,
            meaning: w.meaning,
            picture: w.picture,
            id: w.id
          }
        })
        fs.writeFileSync(backup, JSON.stringify( { words } ))
        console.log(words.length, 'words saved')
      })
      .catch(error => {
        console.error('Error fetching words:', error)
      })
      .finally(() => {
        mongoose.connection.close()
      })
  })
  .catch(error => {
    logger.info('error connecting to MongoDB:', error.message)
  })

