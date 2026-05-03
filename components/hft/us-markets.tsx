'use client'

import { useState, useEffect } from 'react'
import { MarketGate } from './market-gate'

// ─── US Markets Left Sidebar ────────────────────────────────────────────────
const USLeftSidebar = () => {
  const sectors = [
    { name: 'Technology', etf: 'XLK', change: 1.42, hot: true },
    { name: 'Financials', etf: 'XLF', change: 0.87, hot: false },
    { name: 'Healthcare', etf: 'XLV', change: -0.34, hot: false },
    { name: 'Energy', etf: 'XLE', change: -1.12, hot: false },
    { name: 'Consumer Disc', etf: 'XLY', change: 2.15, hot: true },
    { name: 'Industrials', etf: 'XLI', change: 0.55, hot: false },
    { name: 'Real Estate', etf: 'XLRE', change: -0.78, hot: false },
    { name: 'Utilities', etf: 'XLU', change: 0.12, hot: false },
    { name: 'Materials', etf: 'XLB', change: 0.33, hot: false },
    { name: 'Comm. Services', etf: 'XLC', change: 1.88, hot: true },
    { name: 'Cons. Staples', etf: 'XLP', change: -0.21, hot: false },
  ]

  const [breadth, setBreadth] = useState({ advance: 287, decline: 213, unchanged: 12 })
  const [fearGreed, setFearGreed] = useState(62)
  const [vix, setVix] = useState(18.45)

  useEffect(() => {
    const iv = setInterval(() => {
      setBreadth({
        advance: 200 + Math.floor(Math.random() * 200),
        decline: 100 + Math.floor(Math.random() * 200),
        unchanged: 5 + Math.floor(Math.random() * 20),
      })
      setFearGreed(prev => Math.max(10, Math.min(90, prev + (Math.random() - 0.5) * 2)))
      setVix(prev => Math.max(10, Math.min(40, prev + (Math.random() - 0.5) * 0.3)))
    }, 2000)
    return () => clearInterval(iv)
  }, [])

  const fgColor = fearGreed > 75 ? '#00ff9d' : fearGreed > 55 ? '#ffcc00' : fearGreed > 35 ? '#ff7700' : '#ff2244'
  const fgLabel = fearGreed > 75 ? 'GREED' : fearGreed > 55 ? 'NEUTRAL' : fearGreed > 35 ? 'FEAR' : 'EXT.FEAR'

  return (
    <aside className="flex flex-col h-full overflow-hidden bg-[rgba(10,3,0,0.7)] border-r border-[rgba(255,119,0,0.15)]">
      {/* Fear & Greed */}
      <div className="px-2 py-2 border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <div className="text-[9px] text-[rgba(255,119,0,0.5)] tracking-[2px] font-[var(--font-orbitron)] mb-1">FEAR & GREED INDEX</div>
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 shrink-0">
            <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
              <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,119,0,0.1)" strokeWidth="4"/>
              <circle cx="22" cy="22" r="18" fill="none" stroke={fgColor} strokeWidth="4"
                strokeDasharray={`${fearGreed * 1.131} 113.1`} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${fgColor})` }}/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-bold font-mono" style={{ color: fgColor }}>{Math.round(fearGreed)}</span>
            </div>
          </div>
          <div>
            <div className="font-[var(--font-orbitron)] text-[10px] font-bold" style={{ color: fgColor }}>{fgLabel}</div>
            <div className="text-[8px] text-[rgba(255,119,0,0.4)] mt-0.5">CNN Money Index</div>
          </div>
        </div>
      </div>

      {/* VIX */}
      <div className="px-2 py-1.5 border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <div className="text-[9px] text-[rgba(255,119,0,0.5)] tracking-[2px] font-[var(--font-orbitron)] mb-1">VIX VOLATILITY</div>
        <div className="flex justify-between items-center">
          <span className="font-[var(--font-orbitron)] text-[20px] font-black text-[#ffcc00]" style={{ textShadow: '0 0 10px rgba(255,204,0,0.6)' }}>
            {vix.toFixed(2)}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${vix > 25 ? 'border-[#ff2244] text-[#ff2244] bg-[rgba(255,34,68,0.1)]' : 'border-[#00ff9d] text-[#00ff9d] bg-[rgba(0,255,157,0.1)]'}`}>
            {vix > 25 ? 'HIGH VOL' : vix > 18 ? 'STABLE' : 'LOW VOL'}
          </span>
        </div>
      </div>

      {/* Market Breadth */}
      <div className="px-2 py-1.5 border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <div className="text-[9px] text-[rgba(255,119,0,0.5)] tracking-[2px] font-[var(--font-orbitron)] mb-1.5">NYSE BREADTH</div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-[rgba(255,119,0,0.5)]">↑ Advancing</span>
            <span className="text-[#00ff9d] font-mono">{breadth.advance}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-[rgba(255,119,0,0.5)]">↓ Declining</span>
            <span className="text-[#ff2244] font-mono">{breadth.decline}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-[rgba(255,119,0,0.5)]">— Unchanged</span>
            <span className="text-[#ffcc00] font-mono">{breadth.unchanged}</span>
          </div>
          <div className="h-2 bg-[rgba(255,119,0,0.05)] rounded-full overflow-hidden mt-1 flex">
            <div className="h-full bg-[#00ff9d]" style={{ width: `${(breadth.advance / (breadth.advance + breadth.decline + breadth.unchanged)) * 100}%` }}/>
            <div className="h-full bg-[#ff2244]" style={{ width: `${(breadth.decline / (breadth.advance + breadth.decline + breadth.unchanged)) * 100}%` }}/>
            <div className="h-full bg-[#ffcc00] flex-1"/>
          </div>
        </div>
      </div>

      {/* Sector Performance */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-2 py-1 border-b border-[rgba(255,119,0,0.15)] shrink-0">
          <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#ff00aa] tracking-[1px]">SECTOR PERFORMANCE</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {sectors.map(s => (
            <div key={s.etf} className="flex items-center justify-between px-2 py-1 border-b border-[rgba(255,119,0,0.04)] hover:bg-[rgba(255,119,0,0.05)] cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[#ff7700] text-[9px] font-bold">{s.etf}</span>
                  {s.hot && <span className="text-[6px] text-[#ff00aa] font-[var(--font-orbitron)] animate-[liveBlink_1s_step-end_infinite]">●</span>}
                </div>
                <div className="text-[8px] text-[rgba(255,119,0,0.4)] truncate">{s.name}</div>
              </div>
              <div className="text-right">
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

// ─── US Markets Right Sidebar ───────────────────────────────────────────────
const USRightSidebar = () => {
  const [fedRate, setFedRate] = useState(5.25)
  const [nextCutProb, setNextCutProb] = useState(68)
  const [darkPool, setDarkPool] = useState([
    { symbol: 'AAPL', level: 218.50, volume: '12.4M', type: 'SUPPORT' },
    { symbol: 'NVDA', level: 875.00, volume: '8.2M', type: 'RESISTANCE' },
    { symbol: 'TSLA', level: 245.00, volume: '5.1M', type: 'SUPPORT' },
    { symbol: 'MSFT', level: 415.00, volume: '6.8M', type: 'RESISTANCE' },
    { symbol: 'SPY',  level: 595.00, volume: '22.1M', type: 'SUPPORT' },
  ])
  const [optionsFlow, setOptionsFlow] = useState([
    { ticker: 'SPY', type: 'CALL', strike: 600, expiry: '05/17', premium: '$2.4M', sentiment: 'BULL' },
    { ticker: 'QQQ', type: 'CALL', strike: 510, expiry: '05/17', premium: '$1.8M', sentiment: 'BULL' },
    { ticker: 'NVDA', type: 'PUT', strike: 850, expiry: '05/10', premium: '$3.1M', sentiment: 'BEAR' },
    { ticker: 'AAPL', type: 'CALL', strike: 220, expiry: '05/24', premium: '$1.2M', sentiment: 'BULL' },
    { ticker: 'IWM', type: 'PUT', strike: 195, expiry: '05/17', premium: '$0.9M', sentiment: 'BEAR' },
  ])

  useEffect(() => {
    const iv = setInterval(() => {
      setNextCutProb(prev => Math.max(30, Math.min(90, prev + (Math.random() - 0.5) * 1.5)))
      setDarkPool(prev => prev.map(d => ({
        ...d, level: d.level * (1 + (Math.random() - 0.5) * 0.001)
      })))
    }, 2000)
    return () => clearInterval(iv)
  }, [])

  const earnings = [
    { co: 'AAPL', date: 'May 08', est: '$1.57', icon: '🍎' },
    { co: 'NVDA', date: 'May 22', est: '$5.80', icon: '🟩' },
    { co: 'MSFT', date: 'May 07', est: '$2.90', icon: '🪟' },
    { co: 'AMZN', date: 'May 01', est: '$1.24', icon: '📦' },
  ]

  return (
    <aside className="flex flex-col h-full overflow-hidden bg-[rgba(10,3,0,0.7)] border-l border-[rgba(255,119,0,0.15)]">
      {/* Fed Watch */}
      <div className="px-2 py-2 border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <div className="text-[9px] text-[rgba(255,119,0,0.5)] tracking-[2px] font-[var(--font-orbitron)] mb-1">FED WATCH TOOL</div>
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="text-[8px] text-[rgba(255,119,0,0.4)]">Current Rate</div>
            <div className="font-[var(--font-orbitron)] text-[18px] font-black text-[#ff00aa]" style={{ textShadow: '0 0 8px rgba(255,0,170,0.6)' }}>
              {fedRate}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[8px] text-[rgba(255,119,0,0.4)]">Next Cut Prob</div>
            <div className="font-[var(--font-orbitron)] text-[18px] font-black text-[#00ff9d]">
              {Math.round(nextCutProb)}%
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-[rgba(255,119,0,0.05)] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#ff00aa] to-[#00ff9d] transition-all duration-700" style={{ width: `${nextCutProb}%` }}/>
        </div>
        <div className="flex justify-between text-[8px] text-[rgba(255,119,0,0.3)] mt-0.5">
          <span>No Cut</span><span>CME FedFund Futures</span><span>Cut</span>
        </div>
      </div>

      {/* Options Flow */}
      <div className="border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <div className="px-2 py-1 flex items-center justify-between">
          <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#ffcc00] tracking-[1px]">OPTIONS FLOW</span>
          <span className="text-[6px] text-[#ff2244] font-[var(--font-orbitron)] animate-[liveBlink_1s_step-end_infinite]">● LIVE</span>
        </div>
        <div className="space-y-0.5 px-1 pb-1">
          {optionsFlow.map((o, i) => (
            <div key={i} className={`flex items-center justify-between px-1.5 py-1 rounded text-[9px] border ${o.type === 'CALL' ? 'border-[rgba(0,255,157,0.15)] bg-[rgba(0,255,157,0.04)]' : 'border-[rgba(255,34,68,0.15)] bg-[rgba(255,34,68,0.04)]'}`}>
              <span className="text-[#ff7700] font-bold w-9">{o.ticker}</span>
              <span className={`font-bold w-8 ${o.type === 'CALL' ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>{o.type}</span>
              <span className="text-[rgba(255,255,255,0.5)]">${o.strike}</span>
              <span className="text-[#ffcc00]">{o.premium}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dark Pool Levels */}
      <div className="border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <div className="px-2 py-1">
          <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#ff00aa] tracking-[1px]">DARK POOL LEVELS</span>
        </div>
        <div className="space-y-0.5 px-1 pb-1">
          {darkPool.map((d, i) => (
            <div key={i} className="flex items-center justify-between px-1.5 py-1 rounded border border-[rgba(255,119,0,0.08)] bg-[rgba(0,0,0,0.2)]">
              <span className="text-[#ff7700] font-bold text-[9px] w-10">{d.symbol}</span>
              <span className="text-white font-mono text-[9px]">${d.level.toFixed(2)}</span>
              <span className={`text-[8px] font-bold ${d.type === 'SUPPORT' ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>{d.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Calendar */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-2 py-1 border-b border-[rgba(255,119,0,0.15)] shrink-0">
          <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#ffcc00] tracking-[1px]">EARNINGS CALENDAR</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-1 py-1 space-y-1">
          {earnings.map((e, i) => (
            <div key={i} className="p-1.5 border border-[rgba(255,204,0,0.1)] bg-[rgba(0,0,0,0.3)] rounded flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]">{e.icon}</span>
                <div>
                  <div className="text-[#ffcc00] text-[10px] font-bold">{e.co}</div>
                  <div className="text-[8px] text-[rgba(255,119,0,0.4)]">{e.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[8px] text-[rgba(255,119,0,0.4)]">EPS Est.</div>
                <div className="text-[10px] text-[#00ff9d] font-mono">{e.est}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function USMarkets() {
  const [selectedStock, setSelectedStock] = useState('AAPL')
  const [isMarketOpen, setIsMarketOpen] = useState(false)
  
  useEffect(() => {
    const checkMarket = () => {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-US', {
         timeZone: 'America/New_York',
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
      
      // US Markets open 09:30 (570) to 16:00 (960) EST
      if (!isWeekend && timeInMinutes >= 570 && timeInMinutes <= 960) {
         setIsMarketOpen(true)
      } else {
         setIsMarketOpen(false)
      }
    }
    checkMarket()
    const interval = setInterval(checkMarket, 60000)
    return () => clearInterval(interval)
  }, [])

  const [stocks, setStocks] = useState([
    { "symbol": "AAPL", "name": "Apple Inc.", "price": 234.56, "change": 1.23, "volume": "52.3M", "technicalIndicators": { "rsi": 65, "macd": 2, "sma20": 175, "sma50": 172, "sma200": 168 } },
    { "symbol": "MSFT", "name": "Microsoft Corp.", "price": 412.30, "change": 0.85, "volume": "24.1M", "technicalIndicators": { "rsi": 58, "macd": 1.5, "sma20": 405, "sma50": 398, "sma200": 385 } },
    { "symbol": "NVDA", "name": "NVIDIA Corp.", "price": 895.10, "change": 2.45, "volume": "85.6M", "technicalIndicators": { "rsi": 72, "macd": 4.2, "sma20": 850, "sma50": 780, "sma200": 650 } },
    { "symbol": "AMZN", "name": "Amazon.com Inc.", "price": 185.40, "change": 1.12, "volume": "35.2M", "technicalIndicators": { "rsi": 61, "macd": 1.8, "sma20": 178, "sma50": 170, "sma200": 155 } },
    { "symbol": "GOOGL", "name": "Alphabet Inc.", "price": 168.20, "change": 0.95, "volume": "22.8M", "technicalIndicators": { "rsi": 55, "macd": 0.8, "sma20": 162, "sma50": 155, "sma200": 145 } },
    { "symbol": "META", "name": "Meta Platforms Inc.", "price": 485.60, "change": 1.55, "volume": "18.4M", "technicalIndicators": { "rsi": 63, "macd": 2.5, "sma20": 470, "sma50": 450, "sma200": 410 } },
    { "symbol": "TSLA", "name": "Tesla Inc.", "price": 175.30, "change": -2.15, "volume": "110.2M", "technicalIndicators": { "rsi": 38, "macd": -1.2, "sma20": 185, "sma50": 195, "sma200": 210 } },
    { "symbol": "AVGO", "name": "Broadcom Inc.", "price": 1345.20, "change": 1.88, "volume": "4.2M", "technicalIndicators": { "rsi": 68, "macd": 5.5, "sma20": 1280, "sma50": 1200, "sma200": 1050 } },
    { "symbol": "NFLX", "name": "Netflix Inc.", "price": 610.40, "change": 0.75, "volume": "5.8M", "technicalIndicators": { "rsi": 59, "macd": 1.2, "sma20": 595, "sma50": 570, "sma200": 520 } },
    { "symbol": "AMD", "name": "Advanced Micro Devices", "price": 162.80, "change": 1.45, "volume": "62.1M", "technicalIndicators": { "rsi": 54, "macd": 0.5, "sma20": 158, "sma50": 165, "sma200": 140 } },
    { "symbol": "COST", "name": "Costco Wholesale", "price": 725.30, "change": 0.65, "volume": "3.1M", "technicalIndicators": { "rsi": 57, "macd": 1.1, "sma20": 710, "sma50": 685, "sma200": 620 } },
    { "symbol": "CRM", "name": "Salesforce Inc.", "price": 278.40, "change": -0.45, "volume": "6.2M", "technicalIndicators": { "rsi": 48, "macd": -0.2, "sma20": 285, "sma50": 290, "sma200": 265 } },
    { "symbol": "ADBE", "name": "Adobe Inc.", "price": 475.20, "change": -1.15, "volume": "4.8M", "technicalIndicators": { "rsi": 42, "macd": -0.8, "sma20": 490, "sma50": 510, "sma200": 480 } },
    { "symbol": "V", "name": "Visa Inc.", "price": 275.60, "change": 0.42, "volume": "7.5M", "technicalIndicators": { "rsi": 52, "macd": 0.5, "sma20": 272, "sma50": 268, "sma200": 255 } },
    { "symbol": "MA", "name": "Mastercard Inc.", "price": 455.80, "change": 0.35, "volume": "4.2M", "technicalIndicators": { "rsi": 50, "macd": 0.4, "sma20": 450, "sma50": 445, "sma200": 420 } },
    { "symbol": "JPM", "name": "JPMorgan Chase & Co.", "price": 195.40, "change": 0.88, "volume": "12.4M", "technicalIndicators": { "rsi": 56, "macd": 1.2, "sma20": 190, "sma50": 185, "sma200": 170 } },
    { "symbol": "BAC", "name": "Bank of America", "price": 38.20, "change": 0.55, "volume": "42.1M", "technicalIndicators": { "rsi": 53, "macd": 0.3, "sma20": 37.5, "sma50": 36.8, "sma200": 34.5 } },
    { "symbol": "WFC", "name": "Wells Fargo & Co.", "price": 60.15, "change": 1.25, "volume": "22.4M", "technicalIndicators": { "rsi": 62, "macd": 0.8, "sma20": 58, "sma50": 56, "sma200": 52 } },
    { "symbol": "MS", "name": "Morgan Stanley", "price": 94.30, "change": 0.45, "volume": "8.2M", "technicalIndicators": { "rsi": 51, "macd": 0.2, "sma20": 92, "sma50": 90, "sma200": 85 } },
    { "symbol": "GS", "name": "Goldman Sachs Group", "price": 425.60, "change": 1.15, "volume": "3.5M", "technicalIndicators": { "rsi": 59, "macd": 2.1, "sma20": 415, "sma50": 405, "sma200": 380 } },
    { "symbol": "UNH", "name": "UnitedHealth Group", "price": 525.40, "change": -0.25, "volume": "4.8M", "technicalIndicators": { "rsi": 49, "macd": 0.1, "sma20": 520, "sma50": 515, "sma200": 490 } },
    { "symbol": "LLY", "name": "Eli Lilly and Co.", "price": 785.20, "change": 1.42, "volume": "3.2M", "technicalIndicators": { "rsi": 66, "macd": 3.5, "sma20": 760, "sma50": 730, "sma200": 650 } },
    { "symbol": "JNJ", "name": "Johnson & Johnson", "price": 148.50, "change": -0.15, "volume": "15.4M", "technicalIndicators": { "rsi": 45, "macd": -0.2, "sma20": 152, "sma50": 155, "sma200": 158 } },
    { "symbol": "PG", "name": "Procter & Gamble", "price": 162.30, "change": 0.22, "volume": "8.5M", "technicalIndicators": { "rsi": 52, "macd": 0.3, "sma20": 160, "sma50": 158, "sma200": 152 } },
    { "symbol": "HD", "name": "Home Depot Inc.", "price": 345.80, "change": 0.55, "volume": "5.2M", "technicalIndicators": { "rsi": 54, "macd": 0.6, "sma20": 340, "sma50": 335, "sma200": 320 } },
    { "symbol": "CVX", "name": "Chevron Corp.", "price": 162.40, "change": -0.85, "volume": "10.4M", "technicalIndicators": { "rsi": 44, "macd": -0.4, "sma20": 165, "sma50": 168, "sma200": 160 } },
    { "symbol": "XOM", "name": "Exxon Mobil Corp.", "price": 121.20, "change": -1.12, "volume": "18.5M", "technicalIndicators": { "rsi": 42, "macd": -0.6, "sma20": 125, "sma50": 128, "sma200": 118 } },
    { "symbol": "DIS", "name": "Walt Disney Co.", "price": 112.50, "change": 0.35, "volume": "12.8M", "technicalIndicators": { "rsi": 51, "macd": 0.2, "sma20": 110, "sma50": 108, "sma200": 102 } },
    { "symbol": "NKE", "name": "NIKE Inc.", "price": 92.40, "change": -0.75, "volume": "10.2M", "technicalIndicators": { "rsi": 43, "macd": -0.3, "sma20": 95, "sma50": 98, "sma200": 105 } },
    { "symbol": "BA", "name": "Boeing Co.", "price": 178.60, "change": -1.45, "volume": "8.4M", "technicalIndicators": { "rsi": 39, "macd": -0.8, "sma20": 185, "sma50": 195, "sma200": 210 } }
  ])

  const economicEvents = [
    { time: '08:30', event: 'Non-Farm Payrolls', impact: 'HIGH', forecast: '185K', previous: '199K' },
    { time: '10:00', event: 'ISM Manufacturing PMI', impact: 'HIGH', forecast: '48.5', previous: '47.8' },
    { time: '14:00', event: 'Fed Chair Speech', impact: 'HIGH', forecast: '-', previous: '-' },
    { time: '15:30', event: 'Crude Oil Inventories', impact: 'MEDIUM', forecast: '-2.1M', previous: '-1.5M' },
  ]

  const [indices, setIndices] = useState([
    { name: 'S&P 500', value: 5987.37, change: 0.45 },
    { name: 'DOW JONES', value: 43910.98, change: -0.12 },
    { name: 'NASDAQ', value: 19218.17, change: 0.89 },
    { name: 'Russell 2000', value: 2285.43, change: 0.23 },
  ])

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await fetch('/api/market-data')
        const data = await res.json()
        
        if (data && data.americas) {
          // Map Alpha Vantage data into our indices UI shape
          const realIndices = data.americas
            .filter((idx: any) => ['S&P 500', 'DOW JONES', 'NASDAQ'].includes(idx.id))
            .map((idx: any) => ({
              name: idx.id,
              value: idx.value,
              change: idx.pctChange || idx.change
            }))
          
          if (realIndices.length > 0) {
            setIndices(realIndices)
          }
        }

        if (data && data.us_stocks && data.us_stocks.length > 0) {
          setStocks(prev => {
            const newStocks = [...prev]
            data.us_stocks.forEach((fetchedStock: any) => {
              const idx = newStocks.findIndex(s => s.symbol === fetchedStock.symbol)
              if (idx !== -1) {
                newStocks[idx] = { ...newStocks[idx], ...fetchedStock }
              } else if (prev.length === 1 && prev[0].symbol === 'AAPL' && newStocks.length === 1) {
                 // If it's the initial default state, just take the backend data
                 return data.us_stocks
              }
            })
            // Return backend data on first load, otherwise merge
            return prev.length <= 1 ? data.us_stocks : newStocks
          })
          
          if (!data.us_stocks.find((s: any) => s.symbol === selectedStock) && stocks.length <= 1) {
            setSelectedStock(data.us_stocks[0].symbol);
          }
        }
      } catch (err) {
        console.error("Failed to fetch real market data:", err)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // update every minute
    return () => clearInterval(interval)
  }, [selectedStock])

  const [newSymbol, setNewSymbol] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddStock = async () => {
    const sym = newSymbol.trim().toUpperCase()
    if (!sym || stocks.find(s => s.symbol === sym)) return
    
    const newStockObj = {
      symbol: sym,
      name: sym,
      price: 0,
      change: 0,
      volume: '0M',
      technicalIndicators: { rsi: 50, macd: 0, sma20: 0, sma50: 0, sma200: 0 }
    }
    
    setStocks(prev => [newStockObj, ...prev])
    setNewSymbol('')
    setIsAdding(false)
    
    try {
      const { marketDataService } = await import('@/lib/market-data')
      const quote = await marketDataService.fetchFinnhubQuote(sym)
      if (quote && quote.c) {
        setStocks(prev => prev.map(s => s.symbol === sym ? {
          ...s,
          price: quote.c,
          change: quote.dp || 0,
          volume: `${(Math.random() * 50 + 5).toFixed(1)}M`,
          technicalIndicators: {
            rsi: 40 + Math.random() * 40,
            macd: (Math.random() - 0.5) * 2,
            sma20: quote.c * 0.98,
            sma50: quote.c * 0.95,
            sma200: quote.c * 0.85
          }
        } : s))
      }
    } catch (e) {}
  }

  const selected = stocks.find((s: any) => s.symbol === selectedStock) || stocks[0] || {
    symbol: '---', name: '---', price: 0, change: 0, volume: '0', 
    technicalIndicators: { rsi: 50, macd: 0, sma20: 0, sma50: 0, sma200: 0 }
  }
  const technicalIndicators = selected.technicalIndicators

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[200px] border-r border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.7)] flex flex-col">
          <USLeftSidebar />
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
                    <button onClick={() => setIsAdding(!isAdding)} className="text-[#00ff9d] hover:text-white text-[12px] leading-none px-1">+</button>
                  </div>
                  {isAdding && (
                     <div className="mb-2 px-1 flex gap-1">
                        <input 
                           type="text" 
                           value={newSymbol} 
                           onChange={e => setNewSymbol(e.target.value.toUpperCase())}
                           placeholder="SYMBOL..." 
                           className="flex-1 bg-[rgba(0,0,0,0.5)] border border-[rgba(255,119,0,0.3)] rounded px-2 py-1 text-[10px] text-white font-mono outline-none"
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') handleAddStock()
                           }}
                        />
                        <button onClick={handleAddStock} className="px-2 py-1 bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/30 rounded text-[9px] font-bold">ADD</button>
                     </div>
                  )}
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
                            ${stock.price?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[8px] text-[rgba(255,119,0,0.4)]">
                          <span>{stock.name}</span>
                          <div className="flex items-center gap-2">
                            <span>Vol: {stock.volume}</span>
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
          <USRightSidebar />
        </div>
      </div>
    </div>
  )
}
