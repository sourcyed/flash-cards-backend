const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)

let words = [
    {
      "id": "liike",
      "word": "liike",
      "meaning": "action",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "yläpuolella",
      "word": "yläpuolella",
      "meaning": "above",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "onnettomuus",
      "word": "onnettomuus",
      "meaning": "accident",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "tammenterho",
      "word": "tammenterho",
      "meaning": "acorn",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "näytellä",
      "word": "näytellä",
      "meaning": "to act",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "näyttellijä",
      "word": "näyttellijä",
      "meaning": "actor",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "aikuinen",
      "word": "aikuinen",
      "meaning": "adult",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "lisätä",
      "word": "lisätä",
      "meaning": "to add",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "jälkeen",
      "word": "jälkeen",
      "meaning": "after",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "iltapäivä",
      "word": "iltapäivä",
      "meaning": "afternoon",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "seikkailu",
      "word": "seikkailu",
      "meaning": "adventure",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "olla samaa mieltä",
      "word": "olla samaa mieltä",
      "meaning": "to agree",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "lentokone",
      "word": "lentokone",
      "meaning": "airplane",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "lentokenttä",
      "word": "lentokenttä",
      "meaning": "airport",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "word": "herätyskello",
      "meaning": "alarm clock",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": "",
      "id": "herätyskello"
    },
    {
      "id": "avaruusolio",
      "word": "avaruusolio",
      "meaning": "alien",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "kaikki",
      "word": "kaikki",
      "meaning": "all",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "yksin",
      "word": "yksin",
      "meaning": "alone",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "aina",
      "word": "aina",
      "meaning": "always",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "huvipuisto",
      "word": "huvipuisto",
      "meaning": "amusement park",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "vihainen",
      "word": "vihainen",
      "meaning": "angry",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "eläin",
      "word": "eläin",
      "meaning": "animal",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "vastaus",
      "word": "vastaus",
      "meaning": "answer",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "muurahainen",
      "word": "muurahainen",
      "meaning": "ant",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "leiopomo",
      "word": "leiopomo",
      "meaning": "bakery",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "id": "side",
      "word": "side",
      "meaning": "bandage",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    },
    {
      "word": "pallo",
      "meaning": "ball",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": "",
      "id": "pallo"
    },
    {
      "word": "yhtye",
      "meaning": "band",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": "",
      "id": "yhtye"
    },
    {
      "id": "ilmapallo",
      "word": "ilmapallo",
      "meaning": "balloon",
      "sentence": "",
      "sentenceMeaning": "",
      "picture": ""
    }
]

app.get('/api/words', (request, response) => {
    response.json(words)
})

app.post('/api/words', (request, response) => {
    const word = {...request.body}
    if (!word.word)
        return response.status(400).json({error: 'word missing'})
    if (!word.word)
        return response.status(400).json({error: 'meaning missing'})
    word.id = word.word
    words = words.concat(word)
    response.json(word)
})

app.put('/api/words/:id', (request, response) => {
    const id = request.params.id
    const wordToUpdate = words.find(w => w.id === id)
    const body = {...request.body}
    const updatedWord = { ...wordToUpdate, word: body.word, meaning: body.meaning }
    words = words.concat(updatedWord)
    response.json(updatedWord)
})

app.delete('/api/words/:id', (request, response) => {
    const id = request.params.id
    words = words.filter(word => word.id !== id)

    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
    response.status(404).json({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
