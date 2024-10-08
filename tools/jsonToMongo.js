const fs = require('fs')
const Word = require('../models/word')

const db = process.argv[2]

const words = JSON.parse(fs.readFileSync(db).toString()).words

words.forEach(w => {
  const word = new Word({
    word: w.word,
    meaning: w.meaning,
    picture: w.picture,
  })
  word.save().then(sw => console.log(sw, 'saved'))
})