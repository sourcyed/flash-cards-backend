const fs = require('fs')
const mongoose = require('mongoose')
const Word = require('../models/word')
const logger = require('../utils/logger')
const config = require('../utils/config')
const User = require('../models/user')

mongoose.set('strictQuery', false)
const url = config.MONGODB_URI
const username = process.argv[2]


mongoose.connect(url)
  .then(async () => {
    logger.info('connected to MongoDB')

    const user = await User.findOne({ username: username })
    console.log(`Found user: ${user.username}`)
    const words = await Word.find({})
    console.log(`Found ${words.length} words`)
    await user.updateOne({ words: words })
    console.log('Added words to user')
    await mongoose.connection.close()
    console.log('Connection closed')
  })
  .catch(error => {
    logger.info('error connecting to MongoDB: ', error.message)
  })
