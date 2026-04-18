// Real-time market data service using Binance WebSocket API

export interface OrderBookData {
  symbol: string
  bids: [string, string][] // [price, quantity]
  asks: [string, string][]
  lastUpdateId: number
}

export interface TradeData {
  symbol: string
  price: string
  quantity: string
  time: number
  isBuyerMaker: boolean
}

export interface TickerData {
  symbol: string
  price: string
  priceChange: string
  priceChangePercent: string
  volume: string
  high: string
  low: string
}

class MarketDataService {
  private wsConnections: Map<string, WebSocket> = new Map()
  private orderBookCallbacks: Map<string, (data: OrderBookData) => void> = new Map()
  private tradeCallbacks: Map<string, (data: TradeData) => void> = new Map()
  private tickerCallbacks: Map<string, (data: TickerData) => void> = new Map()

  // Subscribe to order book depth updates
  subscribeOrderBook(symbol: string, callback: (data: OrderBookData) => void) {
    const streamName = `${symbol.toLowerCase()}@depth20@100ms`
    this.orderBookCallbacks.set(symbol, callback)
    
    if (!this.wsConnections.has(streamName)) {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`)
      
      ws.onopen = () => {
        console.log(`Connected to ${streamName}`)
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const cb = this.orderBookCallbacks.get(symbol)
          if (cb && data.bids && data.asks) {
            cb({
              symbol: data.s || symbol,
              bids: data.bids,
              asks: data.asks,
              lastUpdateId: data.lastUpdateId || 0,
            })
          }
        } catch (error) {
          console.error(`Error parsing order book data:`, error)
        }
      }
      
      ws.onerror = (error) => {
        console.warn(`WebSocket connection issue for ${streamName}, will retry`)
      }
      
      ws.onclose = () => {
        console.log(`Disconnected from ${streamName}`)
        this.wsConnections.delete(streamName)
      }
      
      this.wsConnections.set(streamName, ws)
    }
  }

  // Subscribe to real-time trades
  subscribeTrades(symbol: string, callback: (data: TradeData) => void) {
    const streamName = `${symbol.toLowerCase()}@trade`
    this.tradeCallbacks.set(symbol, callback)
    
    if (!this.wsConnections.has(streamName)) {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`)
      
      ws.onopen = () => {
        console.log(`Connected to ${streamName}`)
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const cb = this.tradeCallbacks.get(symbol)
          if (cb && data.p && data.q) {
            cb({
              symbol: data.s || symbol,
              price: data.p,
              quantity: data.q,
              time: data.T || Date.now(),
              isBuyerMaker: data.m || false,
            })
          }
        } catch (error) {
          console.error(`Error parsing trade data:`, error)
        }
      }
      
      ws.onerror = () => {
        console.warn(`WebSocket connection issue for ${streamName}`)
      }
      
      ws.onclose = () => {
        this.wsConnections.delete(streamName)
      }
      
      this.wsConnections.set(streamName, ws)
    }
  }

  // Subscribe to 24hr ticker
  subscribeTicker(symbol: string, callback: (data: TickerData) => void) {
    const streamName = `${symbol.toLowerCase()}@ticker`
    this.tickerCallbacks.set(symbol, callback)
    
    if (!this.wsConnections.has(streamName)) {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`)
      
      ws.onopen = () => {
        console.log(`Connected to ${streamName}`)
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const cb = this.tickerCallbacks.get(symbol)
          if (cb && data.c) {
            cb({
              symbol: data.s || symbol,
              price: data.c,
              priceChange: data.p || '0',
              priceChangePercent: data.P || '0',
              volume: data.v || '0',
              high: data.h || data.c,
              low: data.l || data.c,
            })
          }
        } catch (error) {
          console.error(`Error parsing ticker data:`, error)
        }
      }
      
      ws.onerror = () => {
        console.warn(`WebSocket connection issue for ${streamName}`)
      }
      
      ws.onclose = () => {
        this.wsConnections.delete(streamName)
      }
      
      this.wsConnections.set(streamName, ws)
    }
  }

  // Fetch initial order book snapshot
  async fetchOrderBookSnapshot(symbol: string, limit: number = 20): Promise<OrderBookData> {
    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`
    )
    const data = await response.json()
    return {
      symbol,
      bids: data.bids,
      asks: data.asks,
      lastUpdateId: data.lastUpdateId,
    }
  }

  // Fetch recent trades
  async fetchRecentTrades(symbol: string, limit: number = 100): Promise<TradeData[]> {
    const response = await fetch(
      `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=${limit}`
    )
    const data = await response.json()
    return data.map((trade: any) => ({
      symbol,
      price: trade.price,
      quantity: trade.qty,
      time: trade.time,
      isBuyerMaker: trade.isBuyerMaker,
    }))
  }

  // Fetch 24hr ticker
  async fetchTicker(symbol: string): Promise<TickerData> {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
    const data = await response.json()
    return {
      symbol: data.symbol,
      price: data.lastPrice,
      priceChange: data.priceChange,
      priceChangePercent: data.priceChangePercent,
      volume: data.volume,
      high: data.highPrice,
      low: data.lowPrice,
    }
  }

  // Unsubscribe and cleanup
  unsubscribe(symbol: string) {
    const streams = [
      `${symbol.toLowerCase()}@depth20@100ms`,
      `${symbol.toLowerCase()}@trade`,
      `${symbol.toLowerCase()}@ticker`,
    ]
    
    streams.forEach((streamName) => {
      const ws = this.wsConnections.get(streamName)
      if (ws) {
        ws.close()
        this.wsConnections.delete(streamName)
      }
    })
    
    this.orderBookCallbacks.delete(symbol)
    this.tradeCallbacks.delete(symbol)
    this.tickerCallbacks.delete(symbol)
  }

  // Cleanup all connections
  cleanup() {
    this.wsConnections.forEach((ws) => ws.close())
    this.wsConnections.clear()
    this.orderBookCallbacks.clear()
    this.tradeCallbacks.clear()
    this.tickerCallbacks.clear()
  }
}

export const marketDataService = new MarketDataService()
