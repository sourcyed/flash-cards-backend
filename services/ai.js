const OpenAI = require('openai')
const config = require('../utils/config')

let openai = null
try {
  openai = new OpenAI( { apiKey: config.OPENAI_API_KEY } )
}
catch (err) {
  console.log(err)
}

const available = () => {
  return !(openai === null)
}

const generateSentence = (word) => {
  return openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [ { role: 'user', content: `Kirjoita esimerkkilause sanalle '${word}', max 50 merkkiä` } ]
  })
}


module.exports = { available, generateSentence }