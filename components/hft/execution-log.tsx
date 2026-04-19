'use client'

import { useEffect, useState } from 'react'
import { marketDataService, type TradeData } from '@/lib/market-data'

interface ExecRow {
  t: string
  side: 'BUY' | 'SELL'
  asset: string
  price: string
  size: string
  lat: string
}

export function ExecutionLog() {
  const [rows, setRows] = useState<ExecRow[]>([])
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT']

  useEffect(() => {
    let mounted = true

    // Fetch initial trades for all symbols
    symbols.forEach((symbol) => {
      marketDataService.fetchRecentTrades(symbol, 20)
        .then((trades) => {
          if (mounted) {
            trades.forEach((trade) => addTradeRow(trade))
          }
        })
        .catch((error) => {
          console.warn(`Failed to fetch trades for ${symbol}:`, error)
        })
    })

    // Subscribe to real-time trades
    symbols.forEach((symbol) => {
      marketDataService.subscribeTrades(symbol, (trade) => {
        if (mounted) addTradeRow(trade)
      })
    })

    return () => {
      mounted = false
      symbols.forEach((symbol) => {
        marketDataService.unsubscribe(symbol)
      })
    }
  }, [])

  const addTradeRow = (trade: TradeData) => {
    const now = new Date(trade.time)
    const t = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`
    const asset = trade.symbol.replace('USDT', '')
    const side: 'BUY' | 'SELL' = trade.isBuyerMaker ? 'SELL' : 'BUY'
    const price = parseFloat(trade.price).toFixed(2)
    const size = parseFloat(trade.quantity).toFixed(4)
    const lat = (Math.random() * 900 + 100).toFixed(0) // Simulated latency

    setRows((prev) => {
      const newRows = [{ t, side, asset, price, size, lat }, ...prev]
      return newRows.slice(0, 30)
    })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="grid grid-cols-[45px_55px_40px_38px_38px] px-1.5 py-0.5 text-[8px] text-[rgba(255,119,0,0.4)] border-b border-[rgba(255,119,0,0.08)] shrink-0">
        <span>TIME</span>
        <span>SIDE</span>
        <span>PRICE</span>
        <span className="text-right">SIZE</span>
        <span className="text-right">μs</span>
      </div>
      <div className="flex-1 overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[45px_55px_40px_38px_38px] px-1.5 py-0.5 text-[8px] border-b border-[rgba(255,119,0,0.03)] animate-[execFlash_0.2s_ease]"
          >
            <span className="text-[rgba(255,119,0,0.4)]">{row.t}</span>
            <span className={row.side === 'BUY' ? 'text-[#00ff9d] font-bold' : 'text-[#ff2244] font-bold'}>
              {row.side}/{row.asset}
            </span>
            <span className="text-[#ff7700]">{parseFloat(row.price).toFixed(1)}</span>
            <span className="text-[rgba(255,238,221,0.7)] text-right">{row.size}</span>
            <span className="text-[#ffcc00] text-right">{row.lat}μs</span>
          </div>
        ))}
      </div>
    </div>
  )
}
