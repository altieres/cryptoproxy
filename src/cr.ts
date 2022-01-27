import Kline from './kline'

export type KlineMapArray = {
  [key: string]: Array<Kline>
}

export type AllocationMap = {
  [key: string]: AllocationObject
}

export type AllocationObject = {
  [key: number]: number
}

export const computeAllocation = (symbolsAndValues: KlineMapArray, allocations: AllocationMap): Array<Kline> => {
  const firstSymbolKey: string = Object.keys(symbolsAndValues)[0]

  const symbolsByIndex = symbolsAndValues[firstSymbolKey].map((_: Kline, index: number) => {
    return Object.entries(symbolsAndValues).map(([ symbol, value ]) => {
      const kline = value[index]
      const allocation = allocations[symbol][kline.time] || 0

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
    time: binanceKline[0],
    open: parseFloat(binanceKline[1]),
    high: parseFloat(binanceKline[2]),
    low: parseFloat(binanceKline[3]),
    close: parseFloat(binanceKline[4]),
  })
}
