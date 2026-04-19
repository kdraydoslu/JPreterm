'use client'

import { useState, useEffect } from 'react'
import { LeftSidebar } from './left-sidebar'
import { RightSidebar } from './right-sidebar'
import { MarketGate } from './market-gate'

export function USMarkets() {
  const [selectedStock, setSelectedStock] = useState('AAPL')
  const [isMarketOpen, setIsMarketOpen] = useState(false)
  
  // Market status check logic (simplified for demo)
  useEffect(() => {
    const checkMarket = () => {
      const now = new Date()
      // Current simulation time is 2026-04-19 (Sunday)
      setIsMarketOpen(false) 
    }
    checkMarket()
    const interval = setInterval(checkMarket, 60000)
    return () => clearInterval(interval)
  }, [])

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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[200px] border-r border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.7)] flex flex-col">
          <LeftSidebar />
        </div>

        {/* Center Area */}
        <div className="flex-1 overflow-hidden relative bg-[rgba(10,3,0,0.9)]">
          <MarketGate isOpen={isMarketOpen} nextOpening="Monday 09:30 EST">
            <div className="h-full flex flex-col p-2 overflow-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-4 border-b border-[rgba(255,119,0,0.15)] pb-2 shrink-0">
                <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#ff00aa] tracking-[1.5px]">
                  US MARKETS DATACENTER
                </span>
                <div className="flex gap-4">
                  {indices.map(idx => (
                    <div key={idx.name} className="flex gap-2 text-[9px] font-mono">
                      <span className="text-[rgba(255,119,0,0.6)]">{idx.name}:</span>
                      <span className={idx.change >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}>
                        {idx.value.toFixed(1)} ({idx.change > 0 ? '+' : ''}{idx.change}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 flex-1">
                {/* Column 1: Watchlist */}
                <div className="border-r border-[rgba(255,119,0,0.1)] flex flex-col overflow-hidden px-1">
                  <div className="text-[9px] text-[#ffcc00] font-[var(--font-orbitron)] mb-2 px-1 flex items-center justify-between">
                    <span>WATCHLIST</span>
                    <span className="text-[7px] text-[rgba(255,204,0,0.5)]">LIVE_FEED</span>
                  </div>
                  <div className="space-y-1 overflow-y-auto custom-scrollbar">
                    {stocks.map(stock => (
                      <div 
                        key={stock.symbol}
                        onClick={() => setSelectedStock(stock.symbol)}
                        className={`p-1.5 rounded border border-[rgba(255,119,0,0.05)] cursor-pointer transition-all ${
                          selectedStock === stock.symbol ? 'bg-[rgba(255,119,0,0.1)] border-[rgba(255,119,0,0.3)]' : 'hover:bg-[rgba(255,119,0,0.03)]'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[#ff7700] text-xs font-bold">{stock.symbol}</span>
                          <span className={`text-[10px] font-mono ${stock.change >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
                            ${stock.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[8px] text-[rgba(255,119,0,0.4)]">
                          <span>{stock.name}</span>
                          <span>Vol: {stock.volume}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Analysis */}
                <div className="border-r border-[rgba(255,119,0,0.1)] flex flex-col overflow-hidden px-1">
                   <div className="text-[9px] text-[#00ff9d] font-[var(--font-orbitron)] mb-2 px-1">TECHNICALS: {selectedStock}</div>
                   <div className="space-y-4">
                      <div className="p-2 bg-[rgba(0,0,0,0.3)] rounded border border-[rgba(255,119,0,0.1)]">
                         <div className="text-[8px] text-[rgba(255,119,0,0.6)] mb-1 uppercase">RSI (14)</div>
                         <div className="h-1.5 bg-[rgba(255,119,0,0.05)] rounded-full overflow-hidden mb-1">
                            <div className="h-full bg-[#ff7700]" style={{ width: `${technicalIndicators.rsi}%` }} />
                         </div>
                         <div className="flex justify-between text-[10px] items-center">
                            <span className="text-[#ff7700] font-mono">{technicalIndicators.rsi.toFixed(1)}</span>
                            <span className="text-[rgba(255,119,0,0.4)]">{technicalIndicators.rsi > 70 ? 'OVERBOUGHT' : technicalIndicators.rsi < 30 ? 'OVERSOLD' : 'NEUTRAL'}</span>
                         </div>
                      </div>

                      <div className="p-2 bg-[rgba(0,0,0,0.3)] rounded border border-[rgba(255,119,0,0.1)]">
                         <div className="text-[8px] text-[rgba(255,119,0,0.6)] mb-1 uppercase">Moving Averages</div>
                         <div className="space-y-1">
                            <div className="flex justify-between text-[9px]">
                               <span className="text-[rgba(255,119,0,0.4)]">SMA 20</span>
                               <span className="text-[#ff7700]">${technicalIndicators.sma20.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[9px]">
                               <span className="text-[rgba(255,119,0,0.4)]">SMA 50</span>
                               <span className="text-[#00ff9d]">${technicalIndicators.sma50.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[9px]">
                               <span className="text-[rgba(255,119,0,0.4)]">SMA 200</span>
                               <span className="text-[#ffcc00]">${technicalIndicators.sma200.toFixed(2)}</span>
                            </div>
                         </div>
                      </div>

                      <div className="p-2 bg-[rgba(0,0,0,0.3)] rounded border border-[rgba(255,119,0,0.1)]">
                         <div className="text-[8px] text-[rgba(255,119,0,0.6)] mb-1 uppercase">Order Flow Visualizer</div>
                         <div className="flex items-end gap-2 h-12">
                            {[45, 62, 78, 34, 56, 89, 43, 67, 54, 30].map((v, i) => (
                              <div key={i} className="flex-1 bg-[rgba(255,119,0,0.2)] hover:bg-[#ff7700] transition-all" style={{ height: `${v}%` }} />
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Column 3: Economic Feed */}
                <div className="flex flex-col overflow-hidden px-1">
                   <div className="text-[9px] text-[#ff00aa] font-[var(--font-orbitron)] mb-2 px-1">CALENDAR & EVENTS</div>
                   <div className="space-y-2 overflow-y-auto custom-scrollbar">
                      {economicEvents.map((event, i) => (
                        <div key={i} className="p-2 border-l-2 border-[rgba(255,119,0,0.2)] bg-[rgba(10,3,0,0.4)] rounded-r">
                           <div className="flex justify-between text-[8px] mb-1">
                              <span className="text-[#ff7700] font-mono">{event.time}</span>
                              <span className={event.impact === 'HIGH' ? 'text-[#ff2244]' : 'text-[#ffcc00]'}>{event.impact}</span>
                           </div>
                           <div className="text-[10px] text-[rgba(255,238,221,0.8)] mb-1 font-bold">{event.event}</div>
                           <div className="flex gap-2 text-[8px] text-[rgba(255,119,0,0.4)]">
                              <span>FCST: <span className="text-[rgba(255,119,0,0.8)]">{event.forecast}</span></span>
                              <span>PREV: <span className="text-[rgba(255,119,0,0.8)]">{event.previous}</span></span>
                           </div>
                        </div>
                      ))}
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-[rgba(255,119,0,0.1)] shrink-0">
                      <div className="text-[8px] text-[rgba(255,119,0,0.4)] mb-2 uppercase tracking-widest">Global Volatility</div>
                      <div className="flex items-center gap-4">
                         <div className="flex-1">
                            <div className="text-[14px] font-bold text-[#ffcc00] font-mono">VIX: 18.45</div>
                            <div className="text-[8px] text-[#00ff9d]">STABLE_VOL</div>
                         </div>
                         <div className="w-10 h-10 rounded-full border border-[rgba(255,119,0,0.2)] flex items-center justify-center">
                            <div className="text-[9px] text-[#00ff9d] font-bold">62%</div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </MarketGate>
        </div>

        {/* Right Sidebar */}
        <div className="w-[210px] border-l border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.7)] flex flex-col">
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}
