class Kline {
  time: number = 0
  open: number = 0
  high: number = 0
  low: number = 0
  close: number = 0

  constructor(init: Partial<Kline> | null = null) {
    if (init !== null) Object.assign(this, init)
  }

  normalize(): Kline {
    const divisor = this.open

    return new Kline({
      time: this.time,
      open: (this.open / divisor - 1) * 100,
      high: (this.high / divisor - 1) * 100,
      low: (this.low / divisor - 1) * 100,
      close: (this.close / divisor - 1) * 100,
    }).fixed8()
  }

  allocate(value: number): Kline {
    return new Kline({
      time: this.time,
      open: this.open * value,
      high: this.high * value,
      low: this.low * value,
      close: this.close * value,
    }).fixed8()
  }

  sum(other: Kline): Kline {
    return new Kline({
      time: this.time,
      open: this.open + other.open,
      high: this.high + other.high,
      low: this.low + other.low,
      close: this.close + other.close,
    }).fixed8()
  }

  sumPercent(value: number): Kline {
    return new Kline({
      time: this.time,
      open: this.open + value,
      high: this.high + value,
      low: this.low + value,
      close: this.close + value,
    }).fixed8()
  }

  offset(value: number): Kline {
    if (this.open !== 0) throw 'offset only works on normalized klines (where open is equal to 0)'

    return new Kline({
      time: this.time,
      open: value * (1 + this.open / 100),
      high: value * (1 + this.high / 100),
      low: value * (1 + this.low / 100),
      close: value * (1 + this.close / 100),
    }).fixed8()
  }

  fixed8(): Kline {
    return new Kline({
      time: this.time,
      open: parseFloat((this.open).toFixed(8)),
      high: parseFloat((this.high).toFixed(8)),
      low: parseFloat((this.low).toFixed(8)),
      close: parseFloat((this.close).toFixed(8)),
    })
  }
}

export default Kline
