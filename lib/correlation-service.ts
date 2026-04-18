// Real-time correlation calculation service

export interface PricePoint {
  time: number
  price: number
}

export interface CorrelationData {
  symbol1: string
  symbol2: string
  correlation: number
  lastUpdate: number
}

class CorrelationService {
  private priceHistory: Map<string, PricePoint[]> = new Map()
  private readonly maxHistoryLength = 100
  private readonly minDataPoints = 20

  // Add a price point for a symbol
  addPricePoint(symbol: string, price: number) {
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, [])
    }

    const history = this.priceHistory.get(symbol)!
    history.push({ time: Date.now(), price })

    // Keep only recent data
    if (history.length > this.maxHistoryLength) {
      history.shift()
    }
  }

  // Calculate Pearson correlation coefficient between two symbols
  calculateCorrelation(symbol1: string, symbol2: string): number | null {
    const history1 = this.priceHistory.get(symbol1)
    const history2 = this.priceHistory.get(symbol2)

    if (!history1 || !history2) return null
    if (history1.length < this.minDataPoints || history2.length < this.minDataPoints) return null

    // Align data points by time (use most recent common length)
    const minLength = Math.min(history1.length, history2.length)
    const prices1 = history1.slice(-minLength).map((p) => p.price)
    const prices2 = history2.slice(-minLength).map((p) => p.price)

    // Calculate returns (percentage changes)
    const returns1 = this.calculateReturns(prices1)
    const returns2 = this.calculateReturns(prices2)

    if (returns1.length === 0 || returns2.length === 0) return null

    // Calculate Pearson correlation
    return this.pearsonCorrelation(returns1, returns2)
  }

  // Calculate percentage returns from prices
  private calculateReturns(prices: number[]): number[] {
    const returns: number[] = []
    for (let i = 1; i < prices.length; i++) {
      if (prices[i - 1] !== 0) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
      }
    }
    return returns
  }

  // Calculate Pearson correlation coefficient
  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length)
    if (n === 0) return 0

    // Calculate means
    const meanX = x.reduce((sum, val) => sum + val, 0) / n
    const meanY = y.reduce((sum, val) => sum + val, 0) / n

    // Calculate correlation
    let numerator = 0
    let sumXSquared = 0
    let sumYSquared = 0

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX
      const dy = y[i] - meanY
      numerator += dx * dy
      sumXSquared += dx * dx
      sumYSquared += dy * dy
    }

    const denominator = Math.sqrt(sumXSquared * sumYSquared)
    if (denominator === 0) return 0

    return numerator / denominator
  }

  // Get all correlations for a list of symbols
  getAllCorrelations(symbols: string[]): CorrelationData[] {
    const correlations: CorrelationData[] = []
    const now = Date.now()

    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const corr = this.calculateCorrelation(symbols[i], symbols[j])
        if (corr !== null) {
          correlations.push({
            symbol1: symbols[i],
            symbol2: symbols[j],
            correlation: corr,
            lastUpdate: now,
          })
        }
      }
    }

    return correlations
  }

  // Get price history for a symbol
  getPriceHistory(symbol: string): PricePoint[] {
    return this.priceHistory.get(symbol) || []
  }

  // Clear all data
  clear() {
    this.priceHistory.clear()
  }

  // Clear data for a specific symbol
  clearSymbol(symbol: string) {
    this.priceHistory.delete(symbol)
  }
}

export const correlationService = new CorrelationService()
