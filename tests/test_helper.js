const Word = require('../models/word')
const User = require('../models/user')

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

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialWords, nonExistingId, wordsInDb, usersInDb
}