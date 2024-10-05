const OpenAI = require('openai')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

let openai = null
try {
  openai = new OpenAI( { apiKey: OPENAI_API_KEY } )
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