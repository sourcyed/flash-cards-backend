const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const Word = require('../models/word')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')


beforeEach(async () => {
  await Word.deleteMany({})
  let wordObject = new Word(helper.initialWords[0])
  await wordObject.save()
  wordObject = new Word(helper.initialWords[1])
  await wordObject.save()
})

test('words are returned as json', async () => {
  await api
    .get('/api/words')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two words', async () => {
  const response = await api.get('/api/words')

  assert.strictEqual(response.body.length, helper.initialWords.length)
})

test('the first word is ensimmäinen', async () => {
  const response = await api.get('/api/words')
  const words = response.body.map(e => e.word)
  assert(words.includes('ensimmäinen'))
})

test('a valid word can be added', async () => {
  const newWord = {
    word: 'testWord',
    meaning: 'testMeaning'
  }

  await api
    .post('/api/words')
    .send(newWord)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const wordsAtEnd = await helper.wordsInDb()
  assert.strictEqual(wordsAtEnd.length, helper.initialWords.length + 1)

  const words = wordsAtEnd.map(r => r.word)
  assert(words.includes('testWord'))
})

test('word without meaning is not added', async () => {
  const newWord = {
    word: 'newWord'
  }

  await api
    .post('/api/words')
    .send(newWord)
    .expect(400)

  const wordsAtEnd = await helper.wordsInDb()

  assert.strictEqual(wordsAtEnd.length, helper.initialWords.length)
})

test('a word can be deleted', async () => {
  const wordsAtStart = await helper.wordsInDb()
  const wordToDelete = wordsAtStart[0]

  await api
    .delete(`/api/words/${wordToDelete.id}`)
    .expect(204)

  const wordsAtEnd = await helper.wordsInDb()

  const words = wordsAtEnd.map(r => r.word)
  assert(!words.includes(wordToDelete.word))

  assert.strictEqual(wordsAtEnd.length, helper.initialWords.length - 1)
})

after(async () => {
  await mongoose.connection.close()
})