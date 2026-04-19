// Polymarket API Service for JARVIS PRE TERM

export interface PolymarketConfig {
  apiKey: string
  secretKey: string
  walletAddress: string
}

export interface Market {
  id: string
  question: string
  category: string
  yes: number
  no: number
  volume: string
  liquidity: string
  endDate: string
  trending: boolean
  live: boolean
}

export interface Position {
  id: string
  marketId: string
  outcome: 'YES' | 'NO'
  shares: number
  avgPrice: number
  pnl: number
  status: 'OPEN' | 'CLOSED' | 'REDEEMED'
}

export interface Trade {
  id: string
  marketId: string
  outcome: 'YES' | 'NO'
  amount: number
  price: number
  timestamp: number
  status: 'PENDING' | 'FILLED' | 'CANCELLED'
}

export interface WalletBalance {
  usdc: number
  eth: number
  available: number
}

class PolymarketService {
  private config: PolymarketConfig | null = null
  private markets: Market[] = []
  private positions: Position[] = []
  private trades: Trade[] = []

  constructor() {
    // Config will be set via setConfig method
    // localStorage not available in SSR
  }

  setConfig(apiKey: string, secretKey: string, walletAddress: string) {
    this.config = { apiKey, secretKey, walletAddress }
    localStorage.setItem('polymarket_config', JSON.stringify(this.config))
  }

  getConfig() {
    return this.config
  }

  clearConfig() {
    this.config = null
    localStorage.removeItem('polymarket_config')
  }

  async fetchMarkets(category: string = 'all'): Promise<Market[]> {
    try {
      // Use Gamma API events/markets endpoint for better discovery
      const url = `https://gamma-api.polymarket.com/markets?active=true&closed=false&order=volume&dir=desc&limit=25`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      
      if (!Array.isArray(data)) return []

      // Map and filter by category if needed
      const filtered = data.filter((m: any) => {
        if (!m.question || !m.outcomePrices) return false
        if (category === 'all') return true
        
        // Map UI categories to API tags/groups
        const tag = (m.groupItemTitle || m.category || '').toLowerCase()
        return tag.includes(category.toLowerCase())
      })

      this.markets = filtered.map((m: any) => {
        let prices = [0.5, 0.5]
        try {
          if (typeof m.outcomePrices === 'string') {
            prices = JSON.parse(m.outcomePrices).map((p: string) => parseFloat(p))
          } else if (Array.isArray(m.outcomePrices)) {
            prices = m.outcomePrices.map((p: any) => parseFloat(p))
          } else if (m.outcomes && m.outcomes.length > 0) {
             // Fallback to equal weights if prices missing
             prices = m.outcomes.map(() => 0.5)
          }
        } catch (e) {
          console.warn('Price parsing failed for market:', m.id, e)
        }

        return {
          id: m.id || m.conditionId || Math.random().toString(),
          question: m.question || 'Unknown Market',
          category: m.groupItemTitle || m.category || 'General',
          yes: (prices[0] || 0.5) * 100,
          no: (prices[1] || 0.5) * 100,
          volume: m.volume ? `$${(parseFloat(m.volume) / 1000000).toFixed(1)}M` : '$0M',
          liquidity: m.liquidity ? `$${(parseFloat(m.liquidity) / 1000).toFixed(1)}K` : '$0K',
          endDate: m.endDate || 'N/A',
          trending: parseFloat(m.volume24hr || '0') > 50000,
          live: m.active && !m.closed
        }
      })
      
      return this.markets
    } catch (error) {
      console.error('Failed to fetch markets:', error)
      return []
    }
  }

  async fetchPositions(): Promise<Position[]> {
    if (!this.config) return []

    try {
      const response = await fetch(`https://clob.polymarket.com/positions?wallet=${this.config.walletAddress}`)
      if (!response.ok) throw new Error('Failed to fetch positions')
      const data = await response.json()
      
      this.positions = data.positions || []
      return this.positions
    } catch (error) {
      console.error('Failed to fetch positions:', error)
      return []
    }
  }

  async fetchOrderBook(tokenId: string): Promise<{ bids: any[], asks: any[] }> {
    try {
      const response = await fetch(`https://clob.polymarket.com/book?token_id=${tokenId}`)
      if (!response.ok) throw new Error('Failed to fetch order book')
      const data = await response.json()
      return {
        bids: data.bids || [],
        asks: data.asks || []
      }
    } catch (error) {
      console.error('Failed to fetch order book:', error)
      return { bids: [], asks: [] }
    }
  }

  async fetchPriceHistory(tokenId: string): Promise<any[]> {
    try {
      const response = await fetch(`https://clob.polymarket.com/prices-history?token_id=${tokenId}&interval=60`)
      if (!response.ok) throw new Error('Failed to fetch price history')
      const data = await response.json()
      return data.history || []
    } catch (error) {
      console.error('Failed to fetch price history:', error)
      return []
    }
  }

  async fetchTrades(): Promise<Trade[]> {
    if (!this.config) return []

    try {
      const response = await fetch(`https://clob.polymarket.com/trades?wallet=${this.config.walletAddress}`)
      if (!response.ok) throw new Error('Failed to fetch trades')
      const data = await response.json()
      
      this.trades = data.trades || []
      return this.trades
    } catch (error) {
      console.error('Failed to fetch trades:', error)
      return []
    }
  }

  async fetchBalance(): Promise<WalletBalance> {
    if (!this.config) return { usdc: 0, eth: 0, available: 0 }

    try {
      const response = await fetch(`https://clob.polymarket.com/balance?wallet=${this.config.walletAddress}`)
      if (!response.ok) throw new Error('Failed to fetch balance')
      const data = await response.json()
      
      return {
        usdc: data.usdc || 0,
        eth: data.eth || 0,
        available: data.available || 0,
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      return { usdc: 0, eth: 0, available: 0 }
    }
  }

  async placeTrade(marketId: string, outcome: 'YES' | 'NO', amount: number, price: number): Promise<Trade | null> {
    if (!this.config) return null

    try {
      const response = await fetch('https://clob.polymarket.com/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Secret-Key': this.config.secretKey,
        },
        body: JSON.stringify({
          marketId,
          outcome,
          amount,
          price,
          wallet: this.config.walletAddress,
        }),
      })

      const data = await response.json()
      return data.trade || null
    } catch (error) {
      console.error('Failed to place trade:', error)
      return null
    }
  }

  async redeem(marketId: string): Promise<boolean> {
    if (!this.config) return false

    try {
      const response = await fetch(`https://clob.polymarket.com/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Secret-Key': this.config.secretKey,
        },
        body: JSON.stringify({
          marketId,
          wallet: this.config.walletAddress,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Failed to redeem:', error)
      return false
    }
  }

  async claim(marketId: string): Promise<boolean> {
    if (!this.config) return false

    try {
      const response = await fetch(`https://clob.polymarket.com/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Secret-Key': this.config.secretKey,
        },
        body: JSON.stringify({
          marketId,
          wallet: this.config.walletAddress,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Failed to claim:', error)
      return false
    }
  }

  async copyTrade(marketId: string, outcome: 'YES' | 'NO', amount: number): Promise<boolean> {
    if (!this.config) return false

    try {
      const response = await fetch(`https://clob.polymarket.com/copy-trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Secret-Key': this.config.secretKey,
        },
        body: JSON.stringify({
          marketId,
          outcome,
          amount,
          wallet: this.config.walletAddress,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Failed to copy trade:', error)
      return false
    }
  }

  // Getters
  getMarkets() { return this.markets }
  getPositions() { return this.positions }
  getTrades() { return this.trades }
}

export const polymarketService = new PolymarketService()
