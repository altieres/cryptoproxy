import axios from 'axios'
import express from 'express'

const app = express()
const port = process.env.PORT || 3000

const change24hCacheTimeInMillis = 30000
var change24hCached: any = []
var change24hCacheLastUpdateTime = 0

async function change24hUpdateIfNecessary() {
  if (new Date().getTime() < change24hCacheLastUpdateTime + change24hCacheTimeInMillis) return

  const change24hUrl = 'https://api.binance.com/api/v3/ticker/24hr'
  const change24hResponse = await axios.get(change24hUrl)

  change24hCached = Object.fromEntries(
    change24hResponse.data.map((item: any) => [item.symbol, item])
  )
  console.log('change24h cache updated.')

  change24hCacheLastUpdateTime = new Date().getTime()
}

async function change24hHandler(req: any, res: any) {
  try {
    await change24hUpdateIfNecessary()

    const symbolUSDT = req.query.symbol.toUpperCase() + 'USDT'
    const current = change24hCached[symbolUSDT]

    console.log(`requested change24h for ${symbolUSDT}`)

    return res.send({
      'symbol': symbolUSDT,
      'lastPrice': current.lastPrice,
      'highPrice': current.highPrice,
      'lowPrice': current.lowPrice,
    })
  } catch (e) {
    res.status(400).send('invalid symbol')
  }
}

app.get('/', (req, res) => {
  res.send('∞/21M')
})

app.get('/ticker', change24hHandler)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
