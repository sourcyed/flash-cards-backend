require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const PEXELS_API_KEY = process.env.PEXELS_API_KEY
const PASSWORD = process.env.PASSWORD

module.exports = {
  PORT,
  MONGODB_URI,
  OPENAI_API_KEY,
  PEXELS_API_KEY,
  PASSWORD
}