const jwt = require('jsonwebtoken')
const wordsRouter = require('express').Router()
const Word = require('../models/word')
const User = require('../models/user')
const logger = require('../utils/logger')
const aiService = require('../services/ai')
const photoService = require('../services/photo')

const MAX_WORD_LENGTH_FOR_AI = 50

// Returns words list from database
wordsRouter.get('/', async (request, response) => {
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid '})
  }
  const user = await User.findById(decodedToken.id).populate('words')
  response.json(user.words)
})

// Adds new word to database
wordsRouter.post('/', async (request, response) => {
  const body = request.body
  logger.info('Adding word ' + body.word + '...')

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid '})
  }
  const user = await User.findById(decodedToken.id)

  // Add word if example sentence is provided
  const word = new Word({
    word: body.word,
    meaning: body.meaning,
    picture: body.picture,
    sentence: body.sentence
  })

  let savedWord = await word.save()
  //savedWord = await generateSentence(savedWord)
  savedWord = await updateImage(savedWord)
  user.words = user.words.concat(savedWord._id)
  await user.save()
  return response.status(201).json(savedWord)
})

// Update the meaning of an existing word
wordsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const word = { word: body.word, meaning: body.meaning, sentence: body.sentence, picture: body.picture }
  logger.info('Updating word ' + word.word + '...')
  const updatedWord = await Word.findByIdAndUpdate(request.params.id, word, { new: true, runValidators: true, context: 'query' })
  response.json(updatedWord)
})

// Delete word from database
wordsRouter.delete('/:id', (request, response) => {
  logger.info('Deleting word  ' + request.params.id + '...')
  Word.findByIdAndDelete(request.params.id)
    .then(() => {
      logger.info('Deleted.')
      response.status(204).end()
    })
    .catch(() => {
      logger.info('Word was not found')
      response.status(404).end()
    })
})

// Replace word picture
wordsRouter.get('/:id', async (request, response) => {
  const word = await Word.findById(request.params.id)
  if (!word) {
    return response.status(404).end()
  }
  const updatedWord = await updateImage(word)
  response.status(201).json(updatedWord)
})

// Return requested image
const updateImage = (word) => {
  if (!photoService.available() || word.picture === '/')
    return word

  logger.info('Looking for images online...')
  const query = word.meaning
  return photoService.getPhoto(query, word.picture)
    .then(photo => {
      word.picture = photo
      logger.info('Found image ' + photo + ' for ' + word.word)
      return word.save()
    })
    .catch(error => {
      logger.error(error)
      return word
    })
}

const generateSentence = async (word) => {
  if (!aiService.available() || word.sentence || word.word.length > MAX_WORD_LENGTH_FOR_AI) {
    return word
  }
  logger.info('Generating example sentence for ' + word.word + '...')
  const c = await aiService.generateSentence(word.word)
  logger.info('Sentence generated.')
  const sentence = c.choices[0].message.content
  word.sentence = sentence
  return word.save()
}

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

module.exports = wordsRouter
