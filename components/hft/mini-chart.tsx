'use client'

import { useEffect, useState } from 'react'
import { marketDataService, type TickerData } from '@/lib/market-data'

interface MiniChartProps {
  symbol: string
}

interface KlineData {
  time: number
  close: number
}

export function MiniChart({ symbol }: MiniChartProps) {
  const [ticker, setTicker] = useState<TickerData | null>(null)
  const [sparkline, setSparkline] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Fetch 4-hour kline data from Binance
    const fetchKlineData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=48`
        )
        const data = await response.json()
        
        if (mounted && Array.isArray(data)) {
          const prices = data.map((kline: any) => parseFloat(kline[4])) // Close price
          setSparkline(prices)
          setIsLoading(false)
        }
      } catch (error) {
        console.warn(`Failed to fetch kline data for ${symbol}:`, error)
        setIsLoading(false)
      }
    }

    // Fetch initial ticker data
    marketDataService.fetchTicker(symbol)
      .then((data) => {
        if (mounted) {
          setTicker(data)
        }
      })
      .catch((error) => {
        console.warn(`Failed to fetch ticker for ${symbol}:`, error)
      })

    fetchKlineData()

    // Subscribe to real-time ticker updates
    marketDataService.subscribeTicker(symbol, (data) => {
      if (mounted) {
        setTicker(data)
        const newPrice = parseFloat(data.price)
        
        setSparkline((prev) => {
          if (prev.length === 0) return [newPrice]
          const updated = [...prev.slice(1), newPrice]
          return updated
        })
      }
    })

    // Refresh kline data every 5 minutes
    const refreshInterval = setInterval(fetchKlineData, 5 * 60 * 1000)

    return () => {
      mounted = false
      clearInterval(refreshInterval)
      marketDataService.unsubscribe(symbol)
    }
  }, [symbol])

  const price = ticker ? parseFloat(ticker.price) : 0
  const change = ticker ? parseFloat(ticker.priceChangePercent) : 0
  const isPositive = change >= 0

  // Calculate sparkline path
  const getSparklinePath = () => {
    if (sparkline.length < 2) return ''
    
    const min = Math.min(...sparkline)
    const max = Math.max(...sparkline)
    const range = max - min || 1
    const width = 100
    const height = 40
    const step = width / (sparkline.length - 1)
    
    const points = sparkline.map((value, i) => {
      const x = i * step
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    
    return `M ${points.join(' L ')}`
  }

  if (isLoading || !ticker) {
    return (
      <div className="flex flex-col overflow-hidden border-r border-[rgba(255,119,0,0.15)] last:border-r-0 bg-[rgba(10,1,0,0.5)] h-full">
        <div className="flex items-center justify-center h-full text-[10px] text-[rgba(255,119,0,0.4)]">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden border-r border-[rgba(255,119,0,0.15)] last:border-r-0 bg-[rgba(10,1,0,0.5)] h-full">
      <div className="flex items-center justify-between px-1 py-0.5 border-b border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.7)] shrink-0">
        <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#ff7700]">
          {symbol.replace('USDT', '')}
        </span>
        <span className="font-mono text-[11px] text-[#00ff9d] font-semibold">
          ${price > 1000 ? price.toFixed(0) : price.toFixed(2)}
        </span>
        <span className={`text-[9px] font-bold ${isPositive ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
          {isPositive ? '+' : ''}
          {change.toFixed(2)}%
        </span>
      </div>
      <div className="flex-1 relative overflow-hidden px-1 py-0.5">
        {sparkline.length > 1 ? (
          <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isPositive ? '#00ff9d' : '#ff2244'} stopOpacity="0.4" />
                <stop offset="100%" stopColor={isPositive ? '#00ff9d' : '#ff2244'} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d={`${getSparklinePath()} L 100,40 L 0,40 Z`}
              fill={`url(#gradient-${symbol})`}
            />
            <path
              d={getSparklinePath()}
              fill="none"
              stroke={isPositive ? '#ff7700' : '#ff2244'}
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-[9px] text-[rgba(255,119,0,0.4)]">
            Loading chart...
          </div>
        )}
      </div>
    </div>
  )
}
