'use client'

import { useEffect, useState } from 'react'
import { marketDataService, type OrderBookData } from '@/lib/market-data'

interface OrderRow {
  price: string
  asset: string
  size: string
  fill: number
}

export function OrderBook() {
  const [asks, setAsks] = useState<OrderRow[]>([])
  const [bids, setBids] = useState<OrderRow[]>([])
  const [midPrice, setMidPrice] = useState(0)
  const [imbalance, setImbalance] = useState(50)
  const [spread, setSpread] = useState(0)
  const [symbol] = useState('BTCUSDT')

  useEffect(() => {
    let mounted = true

    // Fetch initial snapshot
    marketDataService.fetchOrderBookSnapshot(symbol, 10)
      .then((data) => {
        if (mounted) updateOrderBook(data)
      })
      .catch((error) => {
        console.warn('Failed to fetch initial order book:', error)
      })

    // Subscribe to real-time updates
    marketDataService.subscribeOrderBook(symbol, (data) => {
      if (mounted) updateOrderBook(data)
    })

    return () => {
      mounted = false
      marketDataService.unsubscribe(symbol)
    }
  }, [symbol])

  const updateOrderBook = (data: OrderBookData) => {
    const newAsks: OrderRow[] = data.asks.slice(0, 8).map(([price, size]) => {
      const sizeNum = parseFloat(size)
      const maxSize = Math.max(...data.asks.slice(0, 8).map(([, s]) => parseFloat(s)))
      return {
        price: parseFloat(price).toFixed(2),
        asset: symbol.replace('USDT', '/USDT'),
        size: sizeNum.toFixed(4),
        fill: sizeNum / maxSize,
      }
    })

    const newBids: OrderRow[] = data.bids.slice(0, 8).map(([price, size]) => {
      const sizeNum = parseFloat(size)
      const maxSize = Math.max(...data.bids.slice(0, 8).map(([, s]) => parseFloat(s)))
      return {
        price: parseFloat(price).toFixed(2),
        asset: symbol.replace('USDT', '/USDT'),
        size: sizeNum.toFixed(4),
        fill: sizeNum / maxSize,
      }
    })

    setAsks(newAsks.reverse())
    setBids(newBids)

    // Calculate mid price
    if (data.asks.length > 0 && data.bids.length > 0) {
      const bestAsk = parseFloat(data.asks[0][0])
      const bestBid = parseFloat(data.bids[0][0])
      const mid = (bestAsk + bestBid) / 2
      setMidPrice(mid)
      setSpread(bestAsk - bestBid)

      // Calculate order book imbalance
      const bidVolume = data.bids.slice(0, 10).reduce((sum, [, size]) => sum + parseFloat(size), 0)
      const askVolume = data.asks.slice(0, 10).reduce((sum, [, size]) => sum + parseFloat(size), 0)
      const totalVolume = bidVolume + askVolume
      const imbalancePercent = totalVolume > 0 ? (bidVolume / totalVolume) * 100 : 50
      setImbalance(imbalancePercent)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-1.5 py-0.5 text-[8px] text-[rgba(255,119,0,0.4)] tracking-[1px] flex justify-between border-b border-[rgba(255,119,0,0.08)] shrink-0">
        <span>Real-time Binance order book</span>
        <span className="text-[#ff7700]">{symbol.replace('USDT', '/USDT')}</span>
      </div>
      <div className="grid grid-cols-[1fr_1fr_50px] px-1.5 py-0.5 text-[8px] text-[rgba(255,119,0,0.4)] tracking-[1px] border-b border-[rgba(255,119,0,0.08)] shrink-0">
        <span>PRICE</span>
        <span>ASSET</span>
        <span className="text-right">SIZE</span>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          {asks.map((row, i) => (
            <div
              key={`ask-${i}`}
              className="grid grid-cols-[1fr_1fr_50px] px-1.5 py-0.5 text-[9px] relative border-b border-[rgba(255,119,0,0.03)]"
              style={{ '--fill': `${row.fill * 100}%` } as React.CSSProperties}
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-[rgba(255,34,68,0.08)]"
                style={{ width: `${row.fill * 100}%` }}
              />
              <span className="text-[#ff2244] font-mono text-[9px] relative z-10">{row.price}</span>
              <span className="text-[rgba(255,238,221,0.7)] relative z-10">{row.asset}</span>
              <span className="text-right text-[rgba(255,119,0,0.5)] relative z-10">{row.size}</span>
            </div>
          ))}
        </div>

        <div className="text-center py-0.5 text-[8px] text-[#ffcc00] bg-[rgba(255,204,0,0.05)] border-y border-[rgba(255,204,0,0.1)] shrink-0">
          SPREAD: <span className="text-[#ffcc00] mx-1">{spread.toFixed(2)}</span> | MID:{' '}
          <span className="text-[#ff7700] ml-1">{midPrice > 0 ? midPrice.toFixed(2) : '---'}</span>
        </div>

        <div className="flex-1 overflow-hidden">
          {bids.map((row, i) => (
            <div
              key={`bid-${i}`}
              className="grid grid-cols-[1fr_1fr_50px] px-1.5 py-0.5 text-[9px] relative border-b border-[rgba(255,119,0,0.03)]"
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-[rgba(0,255,157,0.08)]"
                style={{ width: `${row.fill * 100}%` }}
              />
              <span className="text-[#00ff9d] font-mono text-[9px] relative z-10">{row.price}</span>
              <span className="text-[rgba(255,238,221,0.7)] relative z-10">{row.asset}</span>
              <span className="text-right text-[rgba(255,119,0,0.5)] relative z-10">{row.size}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 px-1.5 py-0.5 border-t border-[rgba(255,119,0,0.15)] shrink-0">
        <span className="text-[7px] text-[rgba(255,119,0,0.4)] w-[50px]">IMBALANCE</span>
        <div className="flex-1 h-[5px] bg-[rgba(255,34,68,0.3)] rounded-sm overflow-hidden relative">
          <div
            className="h-full bg-[#00ff9d] rounded-sm transition-all duration-500"
            style={{ width: `${imbalance}%` }}
          />
        </div>
        <span className="text-[8px] text-[#00ff9d] w-[30px] text-right">{imbalance.toFixed(0)}%</span>
      </div>
    </div>
  )
}
