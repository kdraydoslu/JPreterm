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
      // Use Polymarket Gamma API for public market data (doesn't require config)
      const baseUrl = 'https://gamma-api.polymarket.com/markets'
      const queryParams = new URLSearchParams({
        active: 'true',
        closed: 'false',
        order: 'volume',
        dir: 'desc',
        limit: '20'
      })
      
      if (category !== 'all') {
        queryParams.append('tag', category)
      }

      const response = await fetch(`${baseUrl}?${queryParams.toString()}`)
      if (!response.ok) throw new Error(`Failed to fetch markets: ${response.status}`)
      const data = await response.json()
      
      // Map Gamma API data to our Market interface
      this.markets = data.map((m: any) => {
        const prices = JSON.parse(m.outcomePrices || '["0.5", "0.5"]')
        return {
          id: m.id,
          question: m.question,
          category: m.groupItemTitle || 'General',
          yes: parseFloat(prices[0]) * 100,
          no: parseFloat(prices[1]) * 100,
          volume: `$${(parseFloat(m.volume) / 1000).toFixed(1)}K`,
          liquidity: `$${(parseFloat(m.liquidity) / 1000).toFixed(1)}K`,
          endDate: m.endDate,
          trending: parseFloat(m.volume24hr) > 10000,
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
