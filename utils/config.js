require('dotenv').config()

const PORT = process.env.PORT
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const PEXELS_API_KEY = process.env.PEXELS_API_KEY
const PASSWORD = process.env.PASSWORD

const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

module.exports = {
  PORT,
  MONGODB_URI,
  OPENAI_API_KEY,
  PEXELS_API_KEY,
  PASSWORD
}