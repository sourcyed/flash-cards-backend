const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, password, words } = request.body

  const saltRound = 10
  const passwordHash = await bcrypt.hash(password, saltRound)

  const user = new User({
    username,
    passwordHash,
    words
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('words')
  response.json(users)
})

module.exports = usersRouter