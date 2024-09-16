require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Pexels = require('pexels')
const Word = require('./models/word')
const OpenAI = require('openai')
const app = express()

const PEXELS_API_KEY = process.env.PEXELS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

let openai = null
try {
  openai = new OpenAI( { apiKey: OPENAI_API_KEY } )
}
catch (err) {
  console.log(err)
}

let pexels = null
try {
  pexels = Pexels.createClient(PEXELS_API_KEY)
}
catch (err) {
  console.log(err)
}

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
morgan.token('body', function (req) { JSON.stringify(req.body); return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/words', (_request, response) => {
  Word.find({}).then(ws => response.json(ws))
})

app.post('/api/words', (request, response) => {
  const body = request.body
  console.log('Adding word ' + body.word + '...')
  if (!openai || body.sentence || body.word.length > 25) {
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
  else {
    console.log('Generating example sentence...')
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [ { role: 'user', content: `Kirjoita esimerkkilause sanalle '${body.word}', max 50 merkkiä` } ]
    })
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
      .catch(err => {
        console.log(err)
        const word = new Word({
          word: body.word,
          meaning: body.meaning,
          picture: body.picture,
          sentence: body.sentence
        })
        word.save().then(savedWord => {
          response.json(savedWord)
        })
      })
  }
})

app.put('/api/words/:id', (request, response) => {
  const body = request.body
  const word = { word: body.word, meaning: body.meaning, sentence: body.sentence, picture: body.picture }
  console.log('Updating word new word ' + word.word + '...')
  Word.findByIdAndUpdate(request.params.id, word, { new: true, runValidators: true, context: 'query' }).then(updatedWord => {
    response.json(updatedWord)
  })
})

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

app.get('/api/photos/:id', (request, response, next) => {
  if (!pexels)
    return response.status(500).json( { error: 'invalid photo API key' } )
  console.log('Looking for images online')
  const MAX_PHOTOS = 5
  const id = request.params.id
  Word.findById(id).then(word => {
    const query = word.meaning
    pexels.photos.search({ query, orientation: 'landscape', per_page: MAX_PHOTOS })
      .then(r => {
        console.log('Found images online')
        const photos = r.photos
        const photo = photos.length > 0 ? photos[word.picture === '/' ? 0 : (photos.findIndex(x => x.src.tiny === word.picture) + 1) % photos.length].src.tiny : '/'
        const wordWithPic = { word: word.word, meaning: word.meaning, picture: photo }
        Word.findByIdAndUpdate(id, wordWithPic).then(() => {
          console.log('Added the image for ' + word.word)
          response.json(photo)
        })
      }
      )
      .catch(error => {
        return next(error)
      })
  })
    .catch(error => {
      return next(error)
    })
})

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
