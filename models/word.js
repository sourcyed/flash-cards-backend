const mongoose = require('mongoose')

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    minLength: 2,
    required: true
  },
  meaning: {
    type: String,
    minLength: 2,
    required: true
  },
  sentence: {
    type: String,
    required: false
  },
  picture: {
    type: String,
    default: ''
  }
})

wordSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Word', wordSchema)