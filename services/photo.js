const Pexels = require('pexels')

const PEXELS_API_KEY = process.env.PEXELS_API_KEY

const MAX_PHOTOS = 5

let pexels = null
try {
  pexels = Pexels.createClient(PEXELS_API_KEY)
}
catch (err) {
  console.log(err)
}

const available = () => {
  return !(pexels === null)
}

const getPhoto = (query, current = null) => {
  return pexels.photos.search({ query, orientation: 'landscape', per_page: MAX_PHOTOS })
    .then(r => {
      const photos = r.photos
      const photo = photos.length > 0
        ? photos[current === '/'
          ? 0
          : (photos.findIndex(x => x.src.tiny === current) + 1) % photos.length].src.tiny
        : '/'
      return photo
    })
}

module.exports = { available, getPhoto }