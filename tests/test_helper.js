const Word = require('../models/word')

const initialWords = [
  {
    word: 'ensimmäinen',
    meaning: 'first'
  },
  {
    word: 'toinen',
    meaning: 'second'
  }
]

const nonExistingId = async () => {
  const word = new Word({ word: 'willremovethissoon' })
  await word.save()
  await word.deleteOne()

  return word._id.toString()
}

const wordsInDb = async () => {
  const words = await Word.find({})
  return words.map(word => word.toJSON())
}

module.exports = {
  initialWords, nonExistingId, wordsInDb
}