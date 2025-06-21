const { test, after, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const User = require('../models/user')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with valid credentials', async () => {
    const usersAtStart = await helper.usersInDb()

    const user = usersAtStart[0]
    const username = user.username
    const password = 'secret'

    await api
      .post('/api/login')
      .send({ username, password })
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('creation fails with proper statuscode and message with wrong password', async () => {
    const usersAtStart = await helper.usersInDb()

    const user = usersAtStart[0]
    const username = user.username
    const password = 'wrong'

    const result = await api
      .post('/api/login')
      .send({ username, password })
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('invalid username or password'))
  })

  test('creation fails with proper statuscode and message with imaginary user', async () => {
    const newUser = {
      username: 'new',
      password:'random'
    }

    const result = await api
      .post('/api/login')
      .send(newUser)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('invalid username or password'))
  })
})

after(async () => {
  await mongoose.connection.close()
})