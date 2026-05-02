'use client'

import { useState, useEffect } from 'react'
import { MarketGate } from './market-gate'

// ─── BIST Terminal Left Sidebar ─────────────────────────────────────────────
const BISTLeftSidebar = () => {
  const [usdTry, setUsdTry] = useState(34.25)
  const [eurTry, setEurTry] = useState(37.10)
  const [bist100, setBist100] = useState(10234.56)
  const [bist100Change, setBist100Change] = useState(0.87)
  const [breadth, setBreadth] = useState({ advance: 342, decline: 158, unchanged: 8 })
  const [viopVolat, setViopVolat] = useState(24.8)
  const [yabanci, setYabanci] = useState({ net: -1250, kumulatif: 8450 }) // Milyon TL

  const sectors = [
    { name: 'Bankacılık', index: 'XBANK', change: 1.24, weight: 38 },
    { name: 'Holding', index: 'XHOLD', change: 0.55, weight: 14 },
    { name: 'Sanayi', index: 'XUSIN', change: -0.32, weight: 12 },
    { name: 'Mali', index: 'XFINK', change: 0.88, weight: 10 },
    { name: 'Enerji', index: 'XELKT', change: 2.10, weight: 8 },
    { name: 'Teknoloji', index: 'XBLSM', change: 3.45, weight: 7 },
    { name: 'Gayrimenkul', index: 'XGMYO', change: -0.65, weight: 6 },
    { name: 'Kimya', index: 'XKMYA', change: 0.21, weight: 5 },
  ]

  useEffect(() => {
    const iv = setInterval(() => {
      setUsdTry(prev => Math.max(30, Math.min(40, prev + (Math.random() - 0.5) * 0.05)))
      setEurTry(prev => Math.max(33, Math.min(44, prev + (Math.random() - 0.5) * 0.06)))
      setBist100(prev => Math.max(9000, prev + (Math.random() - 0.48) * 15))
      setBist100Change(prev => Math.max(-3, Math.min(3, prev + (Math.random() - 0.5) * 0.1)))
      setBreadth({
        advance: 250 + Math.floor(Math.random() * 200),
        decline: 80 + Math.floor(Math.random() * 200),
        unchanged: 2 + Math.floor(Math.random() * 15),
      })
      setViopVolat(prev => Math.max(15, Math.min(45, prev + (Math.random() - 0.5) * 0.5)))
      setYabanci(prev => ({
        net: prev.net + (Math.random() - 0.5) * 50,
        kumulatif: prev.kumulatif + (Math.random() - 0.48) * 20,
      }))
    }, 1800)
    return () => clearInterval(iv)
  }, [])

  return (
    <aside className="flex flex-col h-full overflow-hidden bg-[rgba(10,3,0,0.7)] border-r border-[rgba(255,119,0,0.15)]">
      {/* BIST 100 Özet */}
      <div className="px-2 py-2 border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <div className="text-[9px] text-[rgba(255,119,0,0.5)] tracking-[2px] font-[var(--font-orbitron)] mb-1">BIST 100</div>
        <div className="flex items-end justify-between">
          <span className="font-[var(--font-orbitron)] text-[20px] font-black text-[#00ff9d]"
            style={{ textShadow: '0 0 10px rgba(0,255,157,0.6)' }}>
            {bist100.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
          </span>
          <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${bist100Change >= 0 ? 'text-[#00ff9d] bg-[rgba(0,255,157,0.1)] border border-[rgba(0,255,157,0.3)]' : 'text-[#ff2244] bg-[rgba(255,34,68,0.1)] border border-[rgba(255,34,68,0.3)]'}`}>
            {bist100Change > 0 ? '+' : ''}{bist100Change.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* TCMB Faiz + Döviz */}
      <div className="px-2 py-1.5 border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <div className="text-[9px] text-[rgba(255,119,0,0.5)] tracking-[2px] font-[var(--font-orbitron)] mb-1.5">TCMB FAİZ & DÖVİZ</div>
        <div className="grid grid-cols-3 gap-1">
          <div className="p-1.5 bg-[rgba(255,0,170,0.06)] border border-[rgba(255,0,170,0.2)] rounded text-center">
            <div className="text-[7px] text-[rgba(255,119,0,0.5)] mb-0.5">POL.FAİZ</div>
            <div className="text-[13px] font-black text-[#ff00aa] font-[var(--font-orbitron)]">%50</div>
          </div>
          <div className="p-1.5 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,119,0,0.1)] rounded text-center">
            <div className="text-[7px] text-[rgba(255,119,0,0.5)] mb-0.5">USD/TRY</div>
            <div className="text-[11px] font-bold text-[#ffcc00] font-mono">₺{usdTry.toFixed(2)}</div>
          </div>
          <div className="p-1.5 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,119,0,0.1)] rounded text-center">
            <div className="text-[7px] text-[rgba(255,119,0,0.5)] mb-0.5">EUR/TRY</div>
            <div className="text-[11px] font-bold text-[#ffcc00] font-mono">₺{eurTry.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Piyasa Genişliği (BIST Breadth) */}
      <div className="px-2 py-1.5 border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <div className="text-[9px] text-[rgba(255,119,0,0.5)] tracking-[2px] font-[var(--font-orbitron)] mb-1.5">PİYASA GENİŞLİĞİ</div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-[rgba(255,119,0,0.5)]">↑ Yükselen</span>
            <span className="text-[#00ff9d] font-mono">{breadth.advance}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-[rgba(255,119,0,0.5)]">↓ Düşen</span>
            <span className="text-[#ff2244] font-mono">{breadth.decline}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-[rgba(255,119,0,0.5)]">— Değişmeyen</span>
            <span className="text-[#ffcc00] font-mono">{breadth.unchanged}</span>
          </div>
          <div className="h-2 bg-[rgba(255,119,0,0.05)] rounded-full overflow-hidden flex mt-1">
            <div className="h-full bg-[#00ff9d]" style={{ width: `${(breadth.advance / (breadth.advance + breadth.decline + breadth.unchanged)) * 100}%` }}/>
            <div className="h-full bg-[#ff2244]" style={{ width: `${(breadth.decline / (breadth.advance + breadth.decline + breadth.unchanged)) * 100}%` }}/>
            <div className="h-full bg-[#ffcc00] flex-1"/>
          </div>
        </div>
      </div>

      {/* VIOP Volatilite + Yabancı Akışı */}
      <div className="px-2 py-1.5 border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <div className="text-[9px] text-[rgba(255,119,0,0.5)] tracking-[2px] font-[var(--font-orbitron)] mb-1.5">VIOP & YABANCI</div>
        <div className="grid grid-cols-2 gap-1">
          <div className="p-1.5 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,204,0,0.15)] rounded">
            <div className="text-[7px] text-[rgba(255,119,0,0.5)] mb-0.5">VİOP VOL</div>
            <div className={`text-[13px] font-bold font-mono ${viopVolat > 30 ? 'text-[#ff2244]' : viopVolat > 22 ? 'text-[#ffcc00]' : 'text-[#00ff9d]'}`}>
              {viopVolat.toFixed(1)}
            </div>
            <div className={`text-[7px] mt-0.5 ${viopVolat > 30 ? 'text-[#ff2244]' : viopVolat > 22 ? 'text-[#ffcc00]' : 'text-[#00ff9d]'}`}>
              {viopVolat > 30 ? 'YÜKSEK' : viopVolat > 22 ? 'NORMAL' : 'DÜŞÜK'}
            </div>
          </div>
          <div className="p-1.5 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,119,0,0.15)] rounded">
            <div className="text-[7px] text-[rgba(255,119,0,0.5)] mb-0.5">YAB. NET (₺M)</div>
            <div className={`text-[12px] font-bold font-mono ${yabanci.net >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
              {yabanci.net > 0 ? '+' : ''}{yabanci.net.toFixed(0)}
            </div>
            <div className="text-[7px] text-[rgba(255,119,0,0.4)] mt-0.5">
              KÜM: +{yabanci.kumulatif.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Sektör Ağırlıkları */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-2 py-1 border-b border-[rgba(255,119,0,0.15)] shrink-0">
          <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#ff00aa] tracking-[1px]">SEKTÖR PERFORMANSI</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {sectors.map(s => (
            <div key={s.index} className="flex items-center justify-between px-2 py-1 border-b border-[rgba(255,119,0,0.04)] hover:bg-[rgba(255,119,0,0.05)] cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="text-[#ff7700] text-[9px] font-bold">{s.index}</div>
                <div className="text-[7px] text-[rgba(255,119,0,0.4)] truncate">{s.name} · %{s.weight}</div>
              </div>
              <div className="text-right ml-1">
                <span className={`text-[10px] font-mono font-bold ${s.change >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
                  {s.change > 0 ? '+' : ''}{s.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

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
          <BISTLeftSidebar />
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

        {/* Right Sidebar - BIST Specific */}
        <div className="w-[210px] border-l border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.7)] flex flex-col overflow-hidden">
          
          {/* Top Section: Gainers/Losers replacing Signal Feed */}
          <div className="flex-1 flex flex-col overflow-hidden p-2">
             <div className="text-[10px] font-bold text-[#ff7700] tracking-[1.5px] font-[var(--font-orbitron)] mb-2 px-1 flex items-center justify-between">
               <span>PİYASA RADARI</span>
               <div className="w-1.5 h-1.5 rounded-full bg-[#ff2244] animate-pulse" />
             </div>
             
             <div className="flex gap-2 mb-2 px-1">
               <button
                 onClick={() => setShowGainers(true)}
                 className={`flex-1 text-[9px] font-[var(--font-orbitron)] py-1.5 rounded transition-all ${
                   showGainers 
                     ? 'bg-[rgba(0,255,157,0.2)] text-[#00ff9d] border border-[rgba(0,255,157,0.4)] shadow-[0_0_8px_rgba(0,255,157,0.3)]' 
                     : 'bg-[rgba(255,119,0,0.05)] text-[rgba(255,119,0,0.5)] border border-[rgba(255,119,0,0.1)] hover:bg-[rgba(0,255,157,0.1)] hover:text-[#00ff9d]'
                 }`}
               >
                 YÜKSELENLER
               </button>
               <button
                 onClick={() => setShowGainers(false)}
                 className={`flex-1 text-[9px] font-[var(--font-orbitron)] py-1.5 rounded transition-all ${
                   !showGainers 
                     ? 'bg-[rgba(255,34,68,0.2)] text-[#ff2244] border border-[rgba(255,34,68,0.4)] shadow-[0_0_8px_rgba(255,34,68,0.3)]' 
                     : 'bg-[rgba(255,119,0,0.05)] text-[rgba(255,119,0,0.5)] border border-[rgba(255,119,0,0.1)] hover:bg-[rgba(255,34,68,0.1)] hover:text-[#ff2244]'
                 }`}
               >
                 DÜŞENLER
               </button>
             </div>
             
             <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 px-1 pb-2">
               {(showGainers ? gainers : losers).map((stock, i) => (
                 <div 
                   key={i}
                   onClick={() => setSelectedStock(stock.symbol)}
                   className="p-1.5 rounded bg-[rgba(10,3,0,0.5)] border border-[rgba(255,119,0,0.1)] cursor-pointer hover:bg-[rgba(255,119,0,0.1)] hover:border-[#ff7700] transition-all flex flex-col gap-1"
                 >
                   <div className="flex justify-between items-center">
                     <span className="text-[#ff7700] text-[11px] font-bold tracking-wider">{stock.symbol}</span>
                     <span className={`text-[10px] font-mono font-bold px-1 rounded ${stock.change >= 0 ? 'bg-[#00ff9d]/10 text-[#00ff9d]' : 'bg-[#ff2244]/10 text-[#ff2244]'}`}>
                       {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                     </span>
                   </div>
                   <div className="flex justify-between items-center text-[8px] text-[rgba(255,119,0,0.5)]">
                     <span>Vol: {stock.volume || '1.2M'}</span>
                     <span className="font-mono">₺{stock.price.toFixed(2)}</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Capital Allocation - BIST Specific */}
          <div className="border-t border-[rgba(255,119,0,0.15)] px-3 py-2 shrink-0 bg-[rgba(10,3,0,0.4)]">
            <div className="flex items-center justify-between pb-1 mb-2">
              <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#ff7700] tracking-[1.5px] [text-shadow:0_0_6px_rgba(255,119,0,0.5)]">
                CAPITAL ALLOCATION
              </span>
              <span className="bg-[rgba(255,34,68,0.15)] border border-[rgba(255,34,68,0.5)] text-[#ff2244] text-[8px] px-1.5 py-0.5 rounded-sm tracking-[2px] font-[var(--font-orbitron)] animate-[liveBlink_1s_step-end_infinite]">
                LIVE
              </span>
            </div>
            {[
              { label: 'BANKACILIK', width: 65, gradient: 'from-[#ff7700] to-[#00ff9d]' },
              { label: 'SANAYİ', width: 25, gradient: 'from-[#ff00aa] to-[#ff6600]' },
              { label: 'NAKİT/RİSK', width: 10, gradient: 'from-[#ff2244] to-[#ff6600]' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-[rgba(255,119,0,0.6)] font-semibold tracking-wide w-[55px]">{item.label}</span>
                <div className="flex-1 mx-2 h-[6px] bg-[rgba(255,119,0,0.1)] rounded-sm overflow-hidden">
                  <div className={`h-full rounded-sm bg-gradient-to-r ${item.gradient} relative overflow-hidden`} style={{ width: `${item.width}%` }}>
                     <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }} />
                  </div>
                </div>
                <span className="text-[10px] text-[#ff7700] font-mono font-bold w-[25px] text-right">{item.width}%</span>
              </div>
            ))}
          </div>
          
          {/* HFT Metrics */}
          <div className="border-t border-[rgba(255,119,0,0.15)] px-3 py-2 shrink-0 bg-[rgba(10,3,0,0.6)]">
            <div className="font-[var(--font-orbitron)] text-[9px] font-bold text-[#ff7700] tracking-[1.5px] mb-1.5 flex justify-between">
              <span>BIST METRICS</span>
              <span className="text-[#00ff9d] animate-pulse">●</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-[9px] text-[rgba(255,119,0,0.5)]">Emir/Sn</span>
              <span className="font-mono text-[10px] text-[#00ff9d] font-bold">142/sn</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-[9px] text-[rgba(255,119,0,0.5)]">Gecikme (BIST)</span>
              <span className="font-mono text-[10px] text-[#00ff9d] font-bold">12.4 ms</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[9px] text-[rgba(255,119,0,0.5)]">Açığa Satış %</span>
              <span className="font-mono text-[10px] text-[#ff2244] font-bold">18.5%</span>
            </div>
            
            <div className="text-[8px] text-[rgba(255,119,0,0.4)] mb-1 uppercase tracking-widest">Derinlik Yoğunluğu</div>
            <div className="flex gap-[1px] h-3">
               {[...Array(15)].map((_, i) => (
                 <div key={i} className={`flex-1 rounded-[1px] ${Math.random() > 0.5 ? 'bg-[#00ff9d]' : 'bg-[#ff2244]'}`} style={{ opacity: Math.random() * 0.5 + 0.3 }} />
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
