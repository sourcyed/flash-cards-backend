const express = require('express')
const cors = require('cors')
const Pexels = require('pexels')
const mongoose = require('mongoose')
const Word = require('./models/word')
const word = require('./models/word')
const OpenAI = require('openai')
const app = express()

const PEXELS_API_KEY = process.env.PEXELS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

let openai = null
try {
    openai = new OpenAI({apiKey: OPENAI_API_KEY})
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
    } else {
        openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: `Kirjoita esimerkkilause sanalle '${body.word}', max 50 merkkiä`}]
        }).then(c => {
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
    Word.findByIdAndUpdate(request.params.id, word, { new: true, runValidators: true, context: 'query' }).then(updatedWord => {
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

app.get('/api/photos/:id', (request, response, next) => {
    if (!pexels)
        return response.status(500).json({error: "invalid photo API key"})
    
    const MAX_PHOTOS = 5
    const id = request.params.id
    Word.findById(id).then(word => {
        const query = word.meaning
        pexels.photos.search({ query, orientation: 'landscape', per_page: MAX_PHOTOS })
        .then(r => {
            const photos = r.photos
            const photo = photos.length > 0 ? photos[word.picture === '/' ? 0 : (photos.findIndex(x => x.src.tiny === word.picture) + 1) % photos.length].src.tiny : '/'
            const wordWithPic = {word: word.word, meaning: word.meaning, picture: photo}
            Word.findByIdAndUpdate(id, wordWithPic).then(updatedWord => {
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

const unknownEndpoint = (request, response) => {
    response.status(404).json({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
