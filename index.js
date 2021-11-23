const axios = require('axios')
const express = require('express')

const app = express()
const port = process.env.PORT || 3000

const cacheTimeInMilis = 5000
var cachedPrices = []
var cacheLastUpdateTime = 0

async function updatePricesIfNecessary() {
  if (new Date().getTime() < cacheLastUpdateTime + cacheTimeInMilis) return

  const binancePricesUrl = 'https://api.binance.com/api/v3/ticker/price'
  const binancePrices = await axios.get(binancePricesUrl)

  cachedPrices = Object.fromEntries(
    binancePrices.data.map(item => [item.symbol, item.price])
  )
  console.log('cache updated.')

  cacheLastUpdateTime = new Date().getTime()
}

updatePricesIfNecessary()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/binance', async (req, res) => {
  try {
    const symbolUSDT = req.query.symbol.toUpperCase() + 'USDT'
    const symbolBTC = req.query.symbol.toUpperCase() + 'BTC'
    const symbolBTCUSDT = 'BTCUSDT'
  
    await updatePricesIfNecessary()
    console.log(`requested prices for ${symbolUSDT}`)
  
    if (cachedPrices[symbolUSDT]) return res.send(cachedPrices[symbolUSDT].toString())
  
    res.send((cachedPrices[symbolBTC] * cachedPrices[symbolBTCUSDT]).toString())
  } catch (e) {
    res.status(400).send('invalid symbol')
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})