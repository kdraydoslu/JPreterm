'use client'

import { useState, useEffect } from 'react'

export function USMarkets() {
  const [selectedStock, setSelectedStock] = useState('AAPL')
  
  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 234.56, change: 1.23, volume: '52.3M', pe: 31.2, marketCap: '3.6T' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 445.78, change: 0.87, volume: '23.1M', pe: 37.8, marketCap: '3.3T' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 178.90, change: -0.45, volume: '18.7M', pe: 26.4, marketCap: '2.2T' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 198.45, change: 1.56, volume: '45.2M', pe: 58.3, marketCap: '2.1T' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 142.34, change: 2.89, volume: '67.8M', pe: 72.5, marketCap: '3.5T' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 345.67, change: -1.12, volume: '89.4M', pe: 68.9, marketCap: '1.1T' },
    { symbol: 'META', name: 'Meta Platforms', price: 589.23, change: 0.98, volume: '15.6M', pe: 32.1, marketCap: '1.5T' },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 223.45, change: 0.34, volume: '8.9M', pe: 12.8, marketCap: '645B' },
  ]

  const economicEvents = [
    { time: '08:30', event: 'Non-Farm Payrolls', impact: 'HIGH', forecast: '185K', previous: '199K' },
    { time: '10:00', event: 'ISM Manufacturing PMI', impact: 'HIGH', forecast: '48.5', previous: '47.8' },
    { time: '14:00', event: 'Fed Chair Speech', impact: 'HIGH', forecast: '-', previous: '-' },
    { time: '15:30', event: 'Crude Oil Inventories', impact: 'MEDIUM', forecast: '-2.1M', previous: '-1.5M' },
  ]

  const indices = [
    { name: 'S&P 500', value: 5987.37, change: 0.45 },
    { name: 'Dow Jones', value: 43910.98, change: -0.12 },
    { name: 'NASDAQ', value: 19218.17, change: 0.89 },
    { name: 'Russell 2000', value: 2285.43, change: 0.23 },
  ]

  const [technicalIndicators, setTechnicalIndicators] = useState({
    rsi: 65.4,
    macd: 2.34,
    sma20: 175.23,
    sma50: 172.45,
    sma200: 168.90,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTechnicalIndicators({
        rsi: 30 + Math.random() * 40,
        macd: (Math.random() - 0.5) * 5,
        sma20: 175 + Math.random() * 5,
        sma50: 172 + Math.random() * 5,
        sma200: 168 + Math.random() * 5,
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const selected = stocks.find((s) => s.symbol === selectedStock) || stocks[0]

  return (
    <div className="h-full bg-[rgba(10,3,0,0.9)] overflow-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-[var(--font-orbitron)] text-2xl font-bold text-[#ff7700]">
            US Markets
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[rgba(255,34,68,0.8)] text-sm">● MARKET CLOSED</span>
            <span className="text-[rgba(255,119,0,0.6)] text-sm">Opens Monday 09:30 EST</span>
          </div>
        </div>

        {/* Major Indices */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {indices.map((index) => {
            const isPositive = index.change >= 0
            return (
              <div key={index.name} className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3">
                <div className="text-[rgba(255,119,0,0.6)] text-xs mb-1">{index.name}</div>
                <div className="font-mono text-lg text-[#ff7700] mb-1">
                  {index.value.toFixed(2)}
                </div>
                <div className={`text-sm font-bold ${isPositive ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
                  {isPositive ? '+' : ''}{index.change.toFixed(2)}%
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Stock List */}
            <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4">
              <h2 className="font-[var(--font-orbitron)] text-sm font-bold text-[#00ff9d] mb-3">
                Top Stocks
              </h2>
              <div className="space-y-2">
                {stocks.map((stock) => {
                  const isPositive = stock.change >= 0
                  const isSelected = stock.symbol === selectedStock
                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock.symbol)}
                      className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-[rgba(255,119,0,0.1)] border border-[rgba(255,119,0,0.3)]' 
                          : 'hover:bg-[rgba(10,3,0,0.4)]'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-[var(--font-orbitron)] text-sm text-[#ff7700] mb-1">
                          {stock.symbol}
                        </div>
                        <div className="text-[rgba(255,119,0,0.6)] text-xs">{stock.name}</div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="font-mono text-sm text-[#00ff9d]">
                          ${stock.price.toFixed(2)}
                        </div>
                        <div className={`text-xs font-bold ${isPositive ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
                          {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[rgba(255,119,0,0.6)] text-xs">Vol</div>
                        <div className="text-[#ff7700] text-xs">{stock.volume}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Technical Analysis */}
            <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4">
              <h2 className="font-[var(--font-orbitron)] text-sm font-bold text-[#00ff9d] mb-3">
                Technical Analysis - {selected.symbol}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mb-2">RSI (14)</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[rgba(255,119,0,0.1)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          technicalIndicators.rsi > 70 ? 'bg-[#ff2244]' : 
                          technicalIndicators.rsi < 30 ? 'bg-[#00ff9d]' : 
                          'bg-[#ffcc00]'
                        }`}
                        style={{ width: `${technicalIndicators.rsi}%` }}
                      />
                    </div>
                    <span className="text-[#ff7700] font-mono text-sm w-12">
                      {technicalIndicators.rsi.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mt-1">
                    {technicalIndicators.rsi > 70 ? 'Overbought' : 
                     technicalIndicators.rsi < 30 ? 'Oversold' : 'Neutral'}
                  </div>
                </div>

                <div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mb-2">MACD</div>
                  <div className={`font-mono text-lg ${
                    technicalIndicators.macd > 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'
                  }`}>
                    {technicalIndicators.macd.toFixed(2)}
                  </div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mt-1">
                    {technicalIndicators.macd > 0 ? 'Bullish' : 'Bearish'}
                  </div>
                </div>

                <div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mb-1">Moving Averages</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[rgba(255,119,0,0.6)]">SMA 20</span>
                      <span className="text-[#ff7700] font-mono">${technicalIndicators.sma20.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[rgba(255,119,0,0.6)]">SMA 50</span>
                      <span className="text-[#00ff9d] font-mono">${technicalIndicators.sma50.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[rgba(255,119,0,0.6)]">SMA 200</span>
                      <span className="text-[#ffcc00] font-mono">${technicalIndicators.sma200.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mb-1">Fundamentals</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[rgba(255,119,0,0.6)]">P/E Ratio</span>
                      <span className="text-[#ff7700] font-mono">{selected.pe}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[rgba(255,119,0,0.6)]">Market Cap</span>
                      <span className="text-[#00ff9d] font-mono">${selected.marketCap}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[rgba(255,119,0,0.6)]">Volume</span>
                      <span className="text-[#ffcc00] font-mono">{selected.volume}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Economic Calendar */}
          <div className="space-y-4">
            <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4">
              <h2 className="font-[var(--font-orbitron)] text-sm font-bold text-[#00ff9d] mb-3">
                Economic Calendar
              </h2>
              <div className="space-y-3">
                {economicEvents.map((event, i) => (
                  <div key={i} className="border-l-2 border-[rgba(255,119,0,0.3)] pl-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#ff7700] font-mono text-sm">{event.time}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        event.impact === 'HIGH' 
                          ? 'bg-[rgba(255,34,68,0.2)] text-[#ff2244]' 
                          : 'bg-[rgba(255,204,0,0.2)] text-[#ffcc00]'
                      }`}>
                        {event.impact}
                      </span>
                    </div>
                    <div className="text-[rgba(255,119,0,0.9)] text-sm mb-2">{event.event}</div>
                    <div className="flex gap-4 text-xs">
                      <div>
                        <span className="text-[rgba(255,119,0,0.6)]">Forecast: </span>
                        <span className="text-[#ff7700]">{event.forecast}</span>
                      </div>
                      <div>
                        <span className="text-[rgba(255,119,0,0.6)]">Previous: </span>
                        <span className="text-[rgba(255,119,0,0.8)]">{event.previous}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Sentiment */}
            <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4">
              <h2 className="font-[var(--font-orbitron)] text-sm font-bold text-[#00ff9d] mb-3">
                Market Sentiment
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[rgba(255,119,0,0.6)] text-xs">Fear & Greed Index</span>
                    <span className="text-[#00ff9d] font-mono text-sm">62</span>
                  </div>
                  <div className="h-2 bg-[rgba(255,119,0,0.1)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#ff2244] via-[#ffcc00] to-[#00ff9d] rounded-full" style={{ width: '62%' }} />
                  </div>
                  <div className="flex justify-between text-xs text-[rgba(255,119,0,0.6)] mt-1">
                    <span>Fear</span>
                    <span>Greed</span>
                  </div>
                </div>

                <div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mb-2">VIX (Volatility Index)</div>
                  <div className="font-mono text-2xl text-[#ffcc00]">18.45</div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs">Moderate Volatility</div>
                </div>

                <div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mb-2">Put/Call Ratio</div>
                  <div className="font-mono text-lg text-[#ff7700]">0.87</div>
                  <div className="text-[#00ff9d] text-xs">Bullish</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
