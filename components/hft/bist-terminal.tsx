'use client'

import { useState, useEffect } from 'react'
import { LeftSidebar } from './left-sidebar'
import { RightSidebar } from './right-sidebar'
import { MarketGate } from './market-gate'

export function BISTTerminal() {
  const [selectedStock, setSelectedStock] = useState('THYAO')
  const [isMarketOpen, setIsMarketOpen] = useState(false)
  const [gainers, setGainers] = useState<any[]>([])
  const [losers, setLosers] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [showGainers, setShowGainers] = useState(true)
  
  useEffect(() => {
    const checkMarket = () => {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-US', {
         timeZone: 'Europe/Istanbul',
         hour: 'numeric',
         minute: 'numeric',
         hour12: false,
         weekday: 'long'
      })
      const parts = formatter.formatToParts(now)
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10)
      const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10)
      const weekday = parts.find(p => p.type === 'weekday')?.value
      
      const isWeekend = weekday === 'Saturday' || weekday === 'Sunday'
      const timeInMinutes = hour * 60 + minute
      
      // BIST is open 10:00 (600) to 18:10 (1090)
      if (!isWeekend && timeInMinutes >= 600 && timeInMinutes <= 1090) {
         setIsMarketOpen(true)
      } else {
         setIsMarketOpen(false)
         // Wait, to ensure user always sees the data if they test this at night or weekend,
         // Let's actually force it open for this preview or give it an override:
         // Let's just use exact real world hours.
      }
    }
    checkMarket()
    const interval = setInterval(checkMarket, 60000)
    return () => clearInterval(interval)
  }, [])

  const [stocks, setStocks] = useState([
    { symbol: 'THYAO', name: 'Türk Hava Yolları', price: 312.50, change: 1.85, volume: '45.2M', technicalIndicators: { rsi: 58.3, macd: 1.45, sma20: 243.50, sma50: 238.20 } }
  ])

  const economicEvents = [
    { time: '10:00', event: 'TCMB Faiz Kararı', impact: 'HIGH', forecast: '%50.00', previous: '%50.00' },
    { time: '11:00', event: 'Enflasyon Verileri', impact: 'HIGH', forecast: '%3.2', previous: '%2.9' },
    { time: '14:00', event: 'İşsizlik Oranı', impact: 'MEDIUM', forecast: '%9.8', previous: '%9.6' },
  ]

  const [indices, setIndices] = useState([
    { name: 'BIST 100', value: 10234.56, change: 0.87 },
    { name: 'BIST 30', value: 11456.78, change: 1.12 },
    { name: 'USD/TRY', value: 34.25, change: 0.45 },
  ])

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // BIST verilerini çek
        const bistRes = await fetch('/api/bist-data')
        const bistData = await bistRes.json()
        
        if (bistData.stocks) {
          setStocks(prev => {
            const newStocks = [...prev]
            bistData.stocks.forEach((fetchedStock: any) => {
              const idx = newStocks.findIndex(s => s.symbol === fetchedStock.symbol)
              if (idx !== -1) {
                newStocks[idx] = { ...newStocks[idx], ...fetchedStock }
              } else if (prev.length === 1 && prev[0].symbol === 'THYAO' && newStocks.length === 1) {
                return bistData.stocks
              }
            })
            return prev.length <= 1 ? bistData.stocks : newStocks
          })
          setGainers(bistData.gainers || [])
          setLosers(bistData.losers || [])
        }
        
        if (bistData.bist100) {
          setIndices(prev => {
            const newIndices = [...prev]
            const bistIndex = newIndices.findIndex(i => i.name === 'BIST 100')
            if (bistIndex !== -1) {
              newIndices[bistIndex] = {
                name: 'BIST 100',
                value: bistData.bist100.value,
                change: bistData.bist100.change
              }
            }
            return newIndices
          })
        }

        // Haberleri çek
        const newsRes = await fetch('/api/bist-news')
        const newsData = await newsRes.json()
        if (newsData.news) {
          setNews(newsData.news)
        }
      } catch (err) {
        console.error("Failed to fetch BIST market data:", err)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000)
    return () => clearInterval(interval)
  }, [])

  const [newSymbol, setNewSymbol] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddStock = async () => {
    const sym = newSymbol.trim().toUpperCase()
    if (!sym || stocks.find(s => s.symbol === sym)) return
    
    // Add optimistic placeholder
    const optimisticStock = {
      symbol: sym,
      name: sym,
      price: 0,
      change: 0,
      volume: '0M',
      technicalIndicators: { rsi: 50, macd: 0, sma20: 0, sma50: 0, sma200: 0 }
    }
    setStocks(prev => [optimisticStock, ...prev])
    setNewSymbol('')
    setIsAdding(false)

    try {
      const res = await fetch(`/api/bist-quote?symbol=${sym}`)
      if (res.ok) {
        const data = await res.json()
        setStocks(prev => prev.map(s => s.symbol === sym ? { ...s, ...data } : s))
      }
    } catch (e) {
      console.error("Failed to fetch custom BIST stock:", e)
    }
  }

  const selected = stocks.find((s: any) => s.symbol === selectedStock) || stocks[0] || {
    symbol: '---', name: '---', price: 0, change: 0, volume: '0', 
    technicalIndicators: { rsi: 50, macd: 0, sma20: 0, sma50: 0, sma200: 0 }
  }
  const technicalIndicators = selected.technicalIndicators || {
    rsi: 50,
    macd: 0,
    sma20: 0,
    sma50: 0,
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[200px] border-r border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.7)] flex flex-col">
          <LeftSidebar />
        </div>

        {/* Center Area */}
        <div className="flex-1 overflow-hidden relative bg-[rgba(10,3,0,0.95)]">
          <MarketGate isOpen={isMarketOpen} nextOpening="Pazartesi 10:00 TRT">
            <div className="h-full flex flex-col p-2 overflow-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-4 border-b border-[rgba(255,119,0,0.15)] pb-2 shrink-0">
                <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#00ff9d] tracking-[1.5px] [text-shadow:0_0_8px_rgba(0,255,157,0.3)]">
                  BIST TERMINAL V3.0
                </span>
                <div className="flex gap-4">
                  {indices.map(idx => (
                    <div key={idx.name} className="flex gap-2 text-[9px] font-mono">
                      <span className="text-[rgba(255,119,0,0.6)]">{idx.name}:</span>
                      <span className={idx.change >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}>
                        {idx.name === 'USD/TRY' ? '' : ''}{idx.value.toLocaleString()} ({idx.change > 0 ? '+' : ''}{idx.change}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 flex-1">
                {/* Column 1: Watchlist + Gainers/Losers */}
                <div className="border-r border-[rgba(255,119,0,0.1)] flex flex-col overflow-hidden px-1">
                  <div className="text-[9px] text-[#ffcc00] font-[var(--font-orbitron)] mb-2 px-1 flex items-center justify-between">
                    <span>HİSSE TAKİP</span>
                    <div className="flex gap-2 items-center">
                       <button onClick={() => setIsAdding(!isAdding)} className="text-[#00ff9d] hover:text-white text-[12px] leading-none px-1">+</button>
                       <div className="flex gap-1 items-center">
                         <div className="w-1 h-1 rounded-full bg-[#00ff9d] animate-pulse" />
                         <span className="text-[7px] text-[rgba(0,255,157,0.5)]">BİST_CANLI</span>
                       </div>
                    </div>
                  </div>
                  {isAdding && (
                     <div className="mb-2 px-1 flex gap-1">
                        <input 
                           type="text" 
                           value={newSymbol} 
                           onChange={e => setNewSymbol(e.target.value.toUpperCase())}
                           placeholder="SEMBOL..." 
                           className="flex-1 bg-[rgba(0,0,0,0.5)] border border-[rgba(255,119,0,0.3)] rounded px-2 py-1 text-[10px] text-white font-mono outline-none"
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') handleAddStock()
                           }}
                        />
                        <button onClick={handleAddStock} className="px-2 py-1 bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/30 rounded text-[9px] font-bold">EKLE</button>
                     </div>
                  )}
                  <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
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
                            ₺{stock.price?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[8px] text-[rgba(255,119,0,0.4)]">
                          <span>{stock.name}</span>
                          <div className="flex gap-2 items-center">
                            <span className={stock.change >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}>
                              {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                            </span>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setStocks(prev => prev.filter(s => s.symbol !== stock.symbol)) 
                              }} 
                              className="text-[#ff2244] hover:text-white opacity-50 hover:opacity-100 px-1"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Günlük Yükselenler/Düşenler */}
                  <div className="mt-3 pt-3 border-t border-[rgba(255,119,0,0.15)] shrink-0">
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => setShowGainers(true)}
                        className={`flex-1 text-[8px] font-[var(--font-orbitron)] py-1 rounded transition-all ${
                          showGainers 
                            ? 'bg-[rgba(0,255,157,0.2)] text-[#00ff9d] border border-[rgba(0,255,157,0.4)]' 
                            : 'bg-[rgba(255,119,0,0.05)] text-[rgba(255,119,0,0.5)] border border-[rgba(255,119,0,0.1)]'
                        }`}
                      >
                        YÜKSELENLER
                      </button>
                      <button
                        onClick={() => setShowGainers(false)}
                        className={`flex-1 text-[8px] font-[var(--font-orbitron)] py-1 rounded transition-all ${
                          !showGainers 
                            ? 'bg-[rgba(255,34,68,0.2)] text-[#ff2244] border border-[rgba(255,34,68,0.4)]' 
                            : 'bg-[rgba(255,119,0,0.05)] text-[rgba(255,119,0,0.5)] border border-[rgba(255,119,0,0.1)]'
                        }`}
                      >
                        DÜŞENLER
                      </button>
                    </div>
                    <div className="space-y-1 max-h-[120px] overflow-y-auto custom-scrollbar">
                      {(showGainers ? gainers : losers).map((stock, i) => (
                        <div 
                          key={i}
                          onClick={() => setSelectedStock(stock.symbol)}
                          className="p-1 rounded bg-[rgba(10,3,0,0.3)] border border-[rgba(255,119,0,0.05)] cursor-pointer hover:bg-[rgba(255,119,0,0.05)] transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[#ff7700] text-[9px] font-bold">{stock.symbol}</span>
                            <span className={`text-[9px] font-mono font-bold ${stock.change >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
                              {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                            </span>
                          </div>
                          <div className="text-[7px] text-[rgba(255,119,0,0.4)]">₺{stock.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Market Depth & Technicals */}
                <div className="border-r border-[rgba(255,119,0,0.1)] flex flex-col overflow-hidden px-1">
                   <div className="text-[9px] text-[#00ff9d] font-[var(--font-orbitron)] mb-2 px-1 uppercase">{selectedStock} ANALİZ</div>
                   
                   {/* Mini Depth */}
                   <div className="grid grid-cols-2 gap-2 mb-4 p-2 bg-[rgba(0,0,0,0.3)] rounded border border-[rgba(255,119,0,0.05)]">
                      <div>
                        <div className="text-[7px] text-[#00ff9d] mb-1 font-bold">ALIŞ</div>
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex justify-between text-[8px] mb-0.5 font-mono text-[rgba(0,255,157,0.7)]">
                            <span>{(selected.price - 0.1 * (i+1)).toFixed(2)}</span>
                            <span>{Math.floor(Math.random() * 5000)}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="text-[7px] text-[#ff2244] mb-1 font-bold">SATIŞ</div>
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex justify-between text-[8px] mb-0.5 font-mono text-[rgba(255,34,68,0.7)]">
                            <span>{(selected.price + 0.1 * (i+1)).toFixed(2)}</span>
                            <span>{Math.floor(Math.random() * 5000)}</span>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="p-2 bg-[rgba(0,0,0,0.3)] rounded border border-[rgba(255,119,0,0.1)]">
                         <div className="flex justify-between text-[8px] text-[rgba(255,119,0,0.6)] mb-1 uppercase">
                            <span>RSI (14)</span>
                            <span className="text-[#ff7700]">{technicalIndicators.rsi.toFixed(1)}</span>
                         </div>
                         <div className="h-1 bg-[rgba(255,119,0,0.05)] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#ff2244] via-[#ffcc00] to-[#00ff9d]" style={{ width: `${technicalIndicators.rsi}%` }} />
                         </div>
                      </div>

                      <div className="p-2 bg-[rgba(0,0,0,0.3)] rounded border border-[rgba(255,119,0,0.1)]">
                         <div className="text-[8px] text-[rgba(255,119,0,0.6)] mb-2 uppercase">Hareketli Ortalamalar</div>
                         <div className="space-y-1">
                            <div className="flex justify-between text-[9px] border-b border-[rgba(255,119,0,0.05)] pb-0.5">
                               <span className="text-[rgba(255,119,0,0.4)]">20 GHO</span>
                               <span className="text-[#ff7700] font-mono">₺{technicalIndicators.sma20.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[9px]">
                               <span className="text-[rgba(255,119,0,0.4)]">50 GHO</span>
                               <span className="text-[#00ff9d] font-mono">₺{technicalIndicators.sma50.toFixed(2)}</span>
                            </div>
                         </div>
                      </div>

                      <div className="p-2 bg-[rgba(10,3,0,0.45)] rounded border border-[rgba(255,119,0,0.1)]">
                         <div className="text-[8px] text-[rgba(255,119,0,0.6)] mb-1 uppercase">Net PnL Simülasyon</div>
                         <div className="text-[16px] font-black font-[var(--font-orbitron)] text-[#00ff9d] [text-shadow:0_0_10px_rgba(0,255,157,0.5)]">
                           +₺82,491.20
                         </div>
                      </div>
                   </div>
                </div>

                {/* Column 3: News & Events */}
                <div className="flex flex-col overflow-hidden px-1">
                   <div className="text-[9px] text-[#ff00aa] font-[var(--font-orbitron)] mb-2 px-1 flex items-center justify-between">
                     <span>HABERLER & OLAYLAR</span>
                     <div className="w-1 h-1 rounded-full bg-[#ff2244] animate-pulse" />
                   </div>
                   <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1">
                      {news.map((item) => {
                        const timeAgo = Math.floor((Date.now() - new Date(item.time).getTime()) / 60000)
                        return (
                          <div key={item.id} className="p-2 border-l-2 border-[rgba(255,119,0,0.3)] bg-[rgba(10,3,0,0.4)] rounded-r hover:bg-[rgba(255,119,0,0.05)] transition-all cursor-pointer">
                             <div className="flex justify-between text-[7px] mb-1 font-mono">
                                <span className="text-[#ff7700]">{item.source}</span>
                                <span className="text-[rgba(255,119,0,0.5)]">{timeAgo}dk önce</span>
                             </div>
                             <div className="text-[10px] text-[rgba(255,238,221,0.9)] mb-1 font-semibold leading-tight">{item.title}</div>
                             <div className="text-[8px] text-[rgba(255,238,221,0.6)] mb-1 leading-snug">{item.content}</div>
                             <div className="flex gap-2 items-center">
                                <span className={`text-[7px] px-1.5 py-0.5 rounded ${
                                  item.impact === 'HIGH' 
                                    ? 'bg-[rgba(255,34,68,0.2)] text-[#ff2244] border border-[rgba(255,34,68,0.4)]' 
                                    : 'bg-[rgba(255,204,0,0.2)] text-[#ffcc00] border border-[rgba(255,204,0,0.4)]'
                                }`}>
                                  {item.impact}
                                </span>
                                <span className="text-[7px] text-[rgba(255,119,0,0.4)]">{item.category}</span>
                             </div>
                          </div>
                        )
                      })}
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-[rgba(255,119,0,0.15)] shrink-0">
                      <div className="text-[8px] text-[rgba(255,119,0,0.4)] mb-2 uppercase tracking-[2px]">Ekonomik Takvim</div>
                      {economicEvents.slice(0, 2).map((event, i) => (
                        <div key={i} className="p-1.5 mb-2 border-l border-[rgba(255,119,0,0.3)] bg-[rgba(10,3,0,0.4)] rounded-r">
                           <div className="flex justify-between text-[8px] mb-1 font-mono">
                              <span className="text-[#ff7700]">{event.time}</span>
                              <span className={event.impact === 'HIGH' ? 'text-[#ff2244]' : 'text-[#ffcc00]'}>{event.impact}</span>
                           </div>
                           <div className="text-[9px] text-[rgba(255,238,221,0.8)]">{event.event}</div>
                        </div>
                      ))}
                   </div>
                   
                   <div className="mt-2 pt-2 border-t border-[rgba(255,119,0,0.15)] shrink-0">
                      <div className="text-[8px] text-[rgba(255,119,0,0.4)] mb-2 uppercase tracking-[2px]">Kur Seviyeleri</div>
                      <div className="grid grid-cols-2 gap-2">
                         <div className="p-1.5 bg-[rgba(0,0,0,0.3)] rounded border border-[rgba(0,255,157,0.1)]">
                            <div className="text-[7px] text-[rgba(255,119,0,0.5)]">ALTIN/ONS</div>
                            <div className="text-[12px] font-bold text-[#00ff9d]">$2,456</div>
                         </div>
                         <div className="p-1.5 bg-[rgba(0,0,0,0.3)] rounded border border-[rgba(255,34,68,0.1)]">
                            <div className="text-[7px] text-[rgba(255,119,0,0.5)]">EUR/USD</div>
                            <div className="text-[12px] font-bold text-[#ff2244]">1.0845</div>
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
