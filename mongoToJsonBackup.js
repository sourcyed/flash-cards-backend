const fs = require('fs')
const Word = require('./models/word')

const backup = 'backup.json'

Word.find({}).then(words => {
    words.map(w => {
        return {
            word: w.word,
            meaning: w.meaning,
            picture: w.picture,
            id: w.id
        }
    })
    fs.writeFileSync(backup, JSON.stringify({words}))
    console.log(words.length, 'words saved')
})