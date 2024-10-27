const wordsRouter = require('express').Router()
const Word = require('../models/word')
const logger = require('../utils/logger')
const aiService = require('../services/ai')
const photoService = require('../services/photo')

const MAX_WORD_LENGTH_FOR_AI = 50

// Returns words list from database
wordsRouter.get('/', (_request, response) => {
  Word.find({}).then(ws => response.json(ws))
})

// Adds new word to database
wordsRouter.post('/', (request, response) => {
  const body = request.body
  logger.info('Adding word ' + body.word + '...')

  // Add word if example sentence is provided
  const word = new Word({
    word: body.word,
    meaning: body.meaning,
    picture: body.picture,
    sentence: body.sentence
  })
  return word.save()
    .then(savedWord => {
      if (aiService.available() && !body.sentence && body.word.length < MAX_WORD_LENGTH_FOR_AI) {
        logger.info('Generating example sentence for ' + savedWord.word + '...')
        return aiService.generateSentence(body.word)
          .then(c => {
            logger.info('Sentence generated.')
            const sentence = c.choices[0].message.content
            savedWord.sentence = sentence
            return savedWord.save()
          })
      } else {
        return savedWord
      }
    })
    .then(savedWord => {
      return updateImage(savedWord)
    })
    .then(savedWord => {
      return response.status(201).json(savedWord)
    })
})

// Update the meaning of an existing word
wordsRouter.put('/:id', (request, response) => {
  const body = request.body
  const word = { word: body.word, meaning: body.meaning, sentence: body.sentence, picture: body.picture }
  logger.info('Updating word ' + word.word + '...')
  Word.findByIdAndUpdate(request.params.id, word, { new: true, runValidators: true, context: 'query' }).then(updatedWord => {
    response.json(updatedWord)
  })
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
wordsRouter.get('/:id', (request, response) => {
  Word.findById(request.params.id)
    .then(word => {
      if (!word) {
        return response.status(404).end()
      }
      return updateImage(word).then(updatedWord => response.status(201).json(updatedWord))
    })
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

module.exports = wordsRouter