const authRouter = require('express').Router()
const config = require('../utils/config')

// Authentication
authRouter.get('/:id', (request, response) => {
  const clientPassword = request.params.id
  const password = config.PASSWORD ||'password'
  if (password)
    response.json(password === clientPassword)
  else
    response.status(404).end()
})

module.exports = authRouter