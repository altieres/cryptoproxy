import Kline from './kline'
import { KlineMapArray, AllocationMap, binanceToKline, computeAllocation, accumulate } from './cr'

describe('kline computation', () => {
  test('binance to kline', () => {
    expect(klines1h.btcusdt[0]).toEqual(new Kline({
      time: 1640995200000,
      open: 40000,
      high: 41500,
      low: 39000,
      close: 41000,
    }))
  })

  test('kline normalization on first btc', () => {
    expect(klines1h.btcusdt[0].normalize()).toEqual(new Kline({
      time: 1640995200000,
      open: 0,
      high: 3.75,
      low: -2.5,
      close: 2.5,
    }))
  })

  test('kline normalization on first eth', () => {
    expect(klines1h.ethusdt[0].normalize()).toEqual(new Kline({
      time: 1640995200000,
      open: 0,
      high: 8.33333333,
      low: -3.33333333,
      close: 6.66666667,
    }))
  })

  test('kline offset on first btc', () => {
    expect(klines1h.btcusdt[0].normalize().offset(1)).toEqual(new Kline({
      time: 1640995200000,
      open: 1,
      high: 1.0375,
      low: 0.975,
      close: 1.025,
    }))
  })

  test('kline offset on first eth', () => {
    expect(klines1h.ethusdt[0].normalize().offset(5)).toEqual(new Kline({
      time: 1640995200000,
      open: 5,
      high: 5.41666667,
      low: 4.83333333,
      close: 5.33333333,
    }))
  })

  test('three weeks', () => {
    expect(computeAllocation(klines1h, allocation1h)).toEqual([
      new Kline({ time: 1640995200000, open: 0.00000000, high: 6.04166667, low: -2.91666666, close:  4.58333333 }),
      new Kline({ time: 1641081600000, open: 0.00000000, high: 2.57367883, low: -5.60467474, close:  5.39634141 }),
      new Kline({ time: 1641168000000, open: 0.00000000, high: 1.42857143, low: -2.85714285, close: -1.19047619 }),
    ])
  })

  test('three weeks accumulated', () => {
    expect(accumulate(computeAllocation(klines1h, allocation1h))).toEqual([
      new Kline({ time: 1640995200000, open: 0.00000000, high:  6.04166667, low: -2.91666666, close: 4.58333333 }),
      new Kline({ time: 1641081600000, open: 4.58333333, high:  7.15701216, low: -1.02134141, close: 9.97967474 }),
      new Kline({ time: 1641168000000, open: 9.97967474, high: 11.40824617, low:  7.12253189, close: 8.78919855 }),
    ])
  })
})

const btcusdt1h: Array<any> = [
  [1640995200000, "40000.00000000", "41500.00000000", "39000.00000000", "41000.00000000", "2.00000000", 1641081599999, "1.00000000", 1, "1.00000000", "1.00000000", "0"],
  [1641081600000, "41000.00000000", "42500.00000000", "40000.00000000", "42000.00000000", "2.00000000", 1641167999999, "1.00000000", 1, "1.00000000", "1.00000000", "0"],
  [1641168000000, "42000.00000000", "42500.00000000", "41000.00000000", "41000.00000000", "2.00000000", 1641254399999, "1.00000000", 1, "1.00000000", "1.00000000", "0"],
]

const ethusdt1h: Array<any> = [
  [1640995200000, "3000.00000000", "3250.00000000", "2900.00000000", "3200.00000000", "2.00000000", 1641081599999, "1.00000000", 1, "1.00000000", "1.00000000", "0"],
  [1641081600000, "3200.00000000", "3250.00000000", "2900.00000000", "3000.00000000", "2.00000000", 1641167999999, "1.00000000", 1, "1.00000000", "1.00000000", "0"],
  [1641168000000, "3000.00000000", "3050.00000000", "2900.00000000", "3000.00000000", "2.00000000", 1641254399999, "1.00000000", 1, "1.00000000", "1.00000000", "0"],
]

const coffeeusdt1h: Array<any> = [
  [1640995200000, "180.00000000", "185.00000000", "170.00000000", "200.00000000", "2.00000000", 1641081599999, "1.00000000", 1, "1.00000000", "1.00000000", "0"],
  [1641081600000, "200.00000000", "205.00000000", "190.00000000", "240.00000000", "2.00000000", 1641167999999, "1.00000000", 1, "1.00000000", "1.00000000", "0"],
  [1641168000000, "240.00000000", "245.00000000", "210.00000000", "220.00000000", "2.00000000", 1641254399999, "1.00000000", 1, "1.00000000", "1.00000000", "0"],
]

const klines1h: KlineMapArray = {
  btcusdt: btcusdt1h.map((b) => binanceToKline(b)),
  ethusdt: ethusdt1h.map((b) => binanceToKline(b)),
  coffeeusdt: coffeeusdt1h.map((b) => binanceToKline(b)),
}

const allocation1h: AllocationMap = {
  btcusdt:    [ [ 1640995200000, 0.5 ], [ 1641081600000, 0.33333333 ], [ 1641168000000, 0.5 ] ],
  ethusdt:    [ [ 1640995200000, 0.5 ], [ 1641081600000, 0.33333333 ], [ 1641168000000, 0.5 ] ],
  coffeeusdt: [                         [ 1641081600000, 0.33333333 ], [ 1641168000000, 0   ] ],
}

export { }
