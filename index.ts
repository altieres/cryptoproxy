import axios from 'axios'
import express from 'express'

const app = express()
const port = process.env.PORT || 3000

const priceCacheTimeInMillis = 5000
var priceCached: any = []
var priceCacheLastUpdateTime = 0

async function priceUpdateIfNecessary() {
  if (new Date().getTime() < priceCacheLastUpdateTime + priceCacheTimeInMillis) return

  const priceUrl = 'https://api.binance.com/api/v3/ticker/price'
  const priceResponse = await axios.get(priceUrl)

  priceCached = Object.fromEntries(
    priceResponse.data.map((item: any) => [item.symbol, item.price])
  )
  console.log('prices cache updated.')

  priceCacheLastUpdateTime = new Date().getTime()
}

async function priceHandler(req: any, res: any) {
  try {
    const symbolUSDT = req.query.symbol.toUpperCase() + 'USDT'
    const symbolBTC = req.query.symbol.toUpperCase() + 'BTC'
    const symbolBTCUSDT = 'BTCUSDT'

    await priceUpdateIfNecessary()
    console.log(`requested prices for ${symbolUSDT}`)

    if (priceCached[symbolUSDT]) return res.send(priceCached[symbolUSDT].toString())

    res.send((priceCached[symbolBTC] * priceCached[symbolBTCUSDT]).toString())
  } catch (e) {
    res.status(400).send('invalid symbol')
  }
}

const change24hCacheTimeInMillis = 30000
var change24hCached: any = []
var change24hCacheLastUpdateTime = 0

async function change24hUpdateIfNecessary() {
  if (new Date().getTime() < change24hCacheLastUpdateTime + change24hCacheTimeInMillis) return

  const change24hUrl = 'https://api.binance.com/api/v3/ticker/24hr'
  const change24hResponse = await axios.get(change24hUrl)

  change24hCached = Object.fromEntries(
    change24hResponse.data.map((item: any) => [item.symbol, item.priceChangePercent])
  )
  console.log('change24h cache updated.')

  change24hCacheLastUpdateTime = new Date().getTime()
}

async function change24hHandler(req: any, res: any) {
  try {
    const symbolUSDT = req.query.symbol.toUpperCase() + 'USDT'
    const symbolBTC = req.query.symbol.toUpperCase() + 'BTC'
    const symbolBTCUSDT = 'BTCUSDT'

    await change24hUpdateIfNecessary()
    console.log(`requested change24h for ${symbolUSDT}`)

    if (change24hCached[symbolUSDT]) return res.send(change24hCached[symbolUSDT].toString())

    res.send((parseFloat(change24hCached[symbolBTC]) + parseFloat(change24hCached[symbolBTCUSDT])).toString())
  } catch (e) {
    res.status(400).send('invalid symbol')
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/binance', priceHandler)

app.get('/binance/ticker/price', priceHandler)

app.get('/binance/ticker/24hr', change24hHandler)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
