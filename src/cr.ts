import axios from 'axios'
import Kline from './kline'
import { allocation } from './cr_allocation'

export type KlineMapArray = {
  [key: string]: Array<Kline>
}

export type AllocationMap = {
  [key: string]: AllocationItem[]
}

export type AllocationItem = [number, number]

const validIntervals = ['1w', '4h', '1h']

export const crKlinesHandler = async (req: any, res: any) => {
  const interval = req.query.interval
  if (!validIntervals.includes(interval))
    return res.status(400).send(`invalid interval ${validIntervals.join(', ')}`)

  const priceUrl = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&startTime=1640995200000`
  const priceResponse = await axios.get(priceUrl)

  console.log('interval', interval);
  const initialKlines = {
    'BTCUSDT': priceResponse.data.map((b: any) => binanceToKline(b))
  }

  const finalKlines = accumulate(computeAllocation(initialKlines, allocation)).map((b: Kline) => b.sumPercent(100))
  res.send(finalKlines)
}

export const computeAllocation = (symbolsAndValues: KlineMapArray, allocations: AllocationMap): Array<Kline> => {
  const firstSymbolKey: string = Object.keys(symbolsAndValues)[0]

  const symbolsByIndex = symbolsAndValues[firstSymbolKey].map((_: Kline, index: number) => {
    return Object.entries(symbolsAndValues).map(([ symbol, value ]) => {
      const kline = value[index]
      const allocation = (allocations[symbol].filter((curr) => curr[0] <= kline.time.getTime()).reverse()[0] || [ 0, 0 ])[1]

      return { symbol, kline, allocation }
    })
  })

  const result = symbolsByIndex.map((symbolByIndex) => {
    return symbolByIndex.reduce((prvKline, curr) => {
      const currKline = curr.kline.normalize().allocate(curr.allocation)

      return currKline.sum(prvKline)
    }, new Kline())
  })

  return result
}

export const accumulate = (klines: Array<Kline>): Array<Kline> => {
  return klines.reduce((acc: Array<Kline>, curr: Kline) => {
    const previousKline = acc.length === 0
      ? new Kline()
      : acc[acc.length - 1]

    return acc.concat(curr.sumPercent(previousKline.close))
  }, [])
}

export const binanceToKline = (binanceKline: any) => {
  return new Kline({
    time: new Date(binanceKline[0]),
    open: parseFloat(binanceKline[1]),
    high: parseFloat(binanceKline[2]),
    low: parseFloat(binanceKline[3]),
    close: parseFloat(binanceKline[4]),
  })
}
