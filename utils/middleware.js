const logger = require('./logger')

const unknownEndpoint = (_request, response) => {
  response.status(404).json( { error: 'unknown endpoint' } )
}

const errorHandler = (error, _request, response, next) => {
  logger.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json( { error: error.message } )
  }
  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler
}