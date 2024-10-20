// Import statements
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Word = require('./models/word')
const app = express()
const aiService = require('./services/ai')
const photoService = require('./services/photo')

const MAX_WORD_LENGTH_FOR_AI = 50

// Adding initial middlewares
app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
morgan.token('body', function (req) { JSON.stringify(req.body); return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Returns words list from database
app.get('/api/words', (_request, response) => {
  Word.find({}).then(ws => response.json(ws))
})

// Adds new word to database
app.post('/api/words', (request, response) => {
  const body = request.body
  console.log('Adding word ' + body.word + '...')

  // Add word if example sentence is provided
  if (!aiService.available() || body.sentence || body.word.length > MAX_WORD_LENGTH_FOR_AI) {
    const word = new Word({
      word: body.word,
      meaning: body.meaning,
      picture: body.picture,
      sentence: body.sentence
    })
    word.save().then(savedWord => {
      response.json(savedWord)
    })
  }
  // Generate example sentence if one is not provided and add word
  else {
    console.log('Generating example sentence...')
    aiService.generateSentence(body.word)
      .then(c => {
        console.log('Sentence generated.')
        const sentence = c.choices[0].message.content
        const word = new Word({
          word: body.word,
          meaning: body.meaning,
          picture: body.picture,
          sentence
        })
        word.save().then(savedWord => {
          response.json(savedWord)
        })
      })
      // Add word without example sentence if error occured
      .catch(err => {
        console.log(err)
        const word = new Word({ ...body })
        word.save().then(savedWord => {
          response.json(savedWord)
        })
      })
  }
})

// Update the meaning of an existing word
app.put('/api/words/:id', (request, response) => {
  const body = request.body
  const word = { word: body.word, meaning: body.meaning, sentence: body.sentence, picture: body.picture }
  console.log('Updating word ' + word.word + '...')
  Word.findByIdAndUpdate(request.params.id, word, { new: true, runValidators: true, context: 'query' }).then(updatedWord => {
    response.json(updatedWord)
  })
})

// Delete word from database
app.delete('/api/words/:id', (request, response) => {
  console.log('Updating word new word ' + request.params.id + '...')
  Word.findByIdAndDelete(request.params.id)
    .then(() => {
      console.log('Deleted.')
      response.status(204).end()
    })
    .catch(() => {
      console.log('Word was not found')
      response.status(404).end()
    })
})

// Return requested image
app.get('/api/photos/:id', (request, response, next) => {
  if (!photoService.available())
    return response.status(500).json( { error: 'invalid photo API key' } )
  console.log('Looking for images online')
  const id = request.params.id
  Word.findById(id)
    .then(word => {
      const query = word.meaning
      photoService.getPhoto(query, word.picture)
        .then(photo => {
          const wordWithPic = { word: word.word, meaning: word.meaning, picture: photo }
          Word.findByIdAndUpdate(id, wordWithPic, { new: true, runValidators: true, context: 'query' }).then(updatedWord => {
            console.log('Added the image for ' + word.word)
            response.json(updatedWord)
          })
        })
        .catch(error => {
          return next(error)
        })
    })
    .catch(error => {
      return next(error)
    })
})

// Authentication
app.get('/api/auth/:id', (request, response) => {
  const clientPassword = request.params.id
  const password = process.env.PASSWORD ||'password'
  if (password)
    response.json(password === clientPassword)
  else
    response.status(404).end()
})

const unknownEndpoint = (_request, response) => {
  response.status(404).json( { error: 'unknown endpoint' } )
}

app.use(unknownEndpoint)

const errorHandler = (error, _request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json( { error: error.message } )
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
