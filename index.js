const express = require('express')
const cors = require('cors')
const pexels = require('pexels')
const fs = require('fs')
const { log } = require('console')
const app = express()

const PEXELS_API_KEY = process.env.PEXELS_API_KEY
let client = null
try {
    client = pexels.createClient(PEXELS_API_KEY)
}
catch (err) {
     console.log(err) 
}

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)

const db = 'db.json'

const getWords = () => {
  const dbObject = JSON.parse(fs.readFileSync(db).toString())
  return dbObject.words
}


const setWords = ws => {
  words = ws
  const dbObject = { words }
  fs.writeFileSync(db, JSON.stringify(dbObject))
}

let words = getWords()

app.get('/api/words', (request, response) => {
    response.json(words)
})

app.post('/api/words', (request, response) => {
    const word = {...request.body}
    if (!word.word)
        return response.status(400).json({error: 'word missing'})
    if (!word.meaning)
        return response.status(400).json({error: 'meaning missing'})
    word.id = word.word
    setWords(words.concat(word))
    response.json(word)
})

app.put('/api/words/:id', (request, response) => {
    const id = request.params.id
    const wordToUpdate = words.find(w => w.id === id)
    const body = {...request.body}
    const updatedWord = { ...wordToUpdate, word: body.word, meaning: body.meaning }
    setWords(words = words.concat(updatedWord))
    response.json(updatedWord)
})

app.delete('/api/words/:id', (request, response) => {
    const id = request.params.id
    setWords(words.filter(word => word.id !== id))

    response.status(204).end()
})

app.get('/api/photos/:query', (request, response) => {
    if (!client)
        return response.status(500).json({error: "invalid API key"})

    const query = request.params.query
    client.photos.search({ query, per_page: 1 })
    .then(photos => {
        photos.photos
        ? (response.json({ photo: photos.photos[0].src.tiny })) 
        : response.status(404).json({error: "no image found"})
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).json({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
