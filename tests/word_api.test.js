const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const Word = require('../models/word')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

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

beforeEach(async () => {
  await Word.deleteMany({})
  let wordObject = new Word(initialWords[0])
  await wordObject.save()
  wordObject = new Word(initialWords[1])
  await wordObject.save()
})

test('words are returned as json', async () => {
  await api
    .get('/api/words')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

// test('the words list is empty', async () => {
//   const response = await api.get('/api/words')

//   assert.strictEqual(response.body.length, 0)
// })

test('there are two words', async () => {
  const response = await api.get('/api/words')

  assert.strictEqual(response.body.length, initialWords.length)
})

test('the first word is ensimmäinen', async () => {
  const response = await api.get('/api/words')
  const words = response.body.map(e => e.word)
  assert(words.includes('ensimmäinen'))
})

after(async () => {
  await mongoose.connection.close()
})