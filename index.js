const express = require('express')
const cors = require('cors')
const pexels = require('pexels')
const mongoose = require('mongoose')
const Word = require('./models/word')
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


app.get('/api/words', (request, response) => {
    Word.find({}).then(ws => response.json(ws))
})

app.post('/api/words', (request, response) => {
    const body = request.body
    if (!body.word)
        return response.status(400).json({error: 'word missing'})
    if (!body.meaning)
        return response.status(400).json({error: 'meaning missing'})
    const word = new Word({
        word: body.word,
        meaning: body.meaning,
    })

    word.save().then(savedWord => {
        response.json(savedWord)
    })
})

app.put('/api/words/:id', (request, response) => {
    const body = request.body
    const word = { word: body.word, meaning: body.meaning }
    Word.findByIdAndUpdate(request.params.id, word, { new: true }).then(updatedWord => {
        response.json(updatedWord)
    })
})

app.delete('/api/words/:id', (request, response) => {
    Word.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => {
            response.status(404).end()
        })
})

app.get('/api/photos/:id', (request, response) => {
    if (!client)
        return response.status(500).json({error: "invalid API key"})

    const id = request.params.id
    Word.findById(id).then(word => {
        if (word.picture) {
            response.json(word.picture)
        }
        else {
            const query = word.meaning
            client.photos.search({ query, per_page: 1 })
            .then(photos => {
                const photo = photos.photos.length > 0 ? photos.photos[0].src.tiny : '/'
                const wordWithPic = {word: word.word, meaning: word.meaning, picture: photo}
                Word.findByIdAndUpdate(id, wordWithPic).then(updatedWord => {
                    response.json(photo) 
                })
                } 
            )
        }
    })
    .catch(error => {
        response.status(404).json({error: "word does not exist"})
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

const unknownEndpoint = (request, response) => {
    response.status(404).json({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
