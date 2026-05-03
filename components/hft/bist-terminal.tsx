'use client'

import { useState, useEffect } from 'react'
import { MarketGate } from './market-gate'
import { BISTAnalysisView } from './bist-analysis'

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis'>('dashboard')
  
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
    { "symbol": "AEFES", "name": "Anadolu Efes", "price": 18.98, "change": 1.99, "volume": "716.5M", "technicalIndicators": { "rsi": 50.1, "macd": -0.77, "sma20": 18.57, "sma50": 17.98 } },
    { "symbol": "AGHOL", "name": "Anadolu Grubu Holding", "price": 31.38, "change": 1.49, "volume": "126.3M", "technicalIndicators": { "rsi": 44.4, "macd": 0.87, "sma20": 31.50, "sma50": 29.81 } },
    { "symbol": "AKBNK", "name": "Akbank", "price": 73.2, "change": -0.68, "volume": "8.8B", "technicalIndicators": { "rsi": 64.0, "macd": -0.35, "sma20": 71.45, "sma50": 65.93 } },
    { "symbol": "AKSA", "name": "Aksa Akrilik", "price": 10.59, "change": 3.62, "volume": "645.5M", "technicalIndicators": { "rsi": 57.6, "macd": 0.11, "sma20": 10.85, "sma50": 9.54 } },
    { "symbol": "AKSEN", "name": "Aksa Enerji", "price": 82.2, "change": -1.14, "volume": "450.8M", "technicalIndicators": { "rsi": 44.4, "macd": 0.29, "sma20": 81.79, "sma50": 75.86 } },
    { "symbol": "ALARK", "name": "Alarko Holding", "price": 95.65, "change": -1.54, "volume": "576.9M", "technicalIndicators": { "rsi": 60.0, "macd": -0.50, "sma20": 97.36, "sma50": 94.87 } },
    { "symbol": "ALTNY", "name": "ALTNY", "price": 16.01, "change": 1.01, "volume": "242.9M", "technicalIndicators": { "rsi": 46.1, "macd": -0.67, "sma20": 15.75, "sma50": 15.08 } },
    { "symbol": "ANSGR", "name": "ANSGR", "price": 28.88, "change": 0.42, "volume": "176.3M", "technicalIndicators": { "rsi": 43.7, "macd": -0.63, "sma20": 30.01, "sma50": 26.59 } },
    { "symbol": "ARCLK", "name": "Arçelik", "price": 111.9, "change": -0.36, "volume": "293.6M", "technicalIndicators": { "rsi": 57.6, "macd": 0.70, "sma20": 108.12, "sma50": 101.77 } },
    { "symbol": "ASELS", "name": "Aselsan", "price": 420.25, "change": -1.23, "volume": "11.5B", "technicalIndicators": { "rsi": 47.0, "macd": 0.60, "sma20": 440.32, "sma50": 379.67 } },
    { "symbol": "ASTOR", "name": "Astor Enerji", "price": 284, "change": 7.58, "volume": "12.8B", "technicalIndicators": { "rsi": 42.4, "macd": 0.02, "sma20": 281.36, "sma50": 279.71 } },
    { "symbol": "BALSU", "name": "BALSU", "price": 14.65, "change": 1.24, "volume": "60.1M", "technicalIndicators": { "rsi": 44.5, "macd": -0.72, "sma20": 14.85, "sma50": 13.67 } },
    { "symbol": "BIMAS", "name": "Bim Birleşik Mağazalar", "price": 741.5, "change": 1.99, "volume": "4.0B", "technicalIndicators": { "rsi": 40.1, "macd": -0.60, "sma20": 777.06, "sma50": 696.56 } },
    { "symbol": "BRSAN", "name": "BRSAN", "price": 547, "change": -1.62, "volume": "884.8M", "technicalIndicators": { "rsi": 51.0, "macd": -0.23, "sma20": 520.92, "sma50": 504.50 } },
    { "symbol": "BRYAT", "name": "BRYAT", "price": 2104, "change": -0.05, "volume": "88.8M", "technicalIndicators": { "rsi": 53.4, "macd": 0.08, "sma20": 2019.53, "sma50": 2029.42 } },
    { "symbol": "BSOKE", "name": "BSOKE", "price": 38.34, "change": 1.75, "volume": "409.3M", "technicalIndicators": { "rsi": 61.4, "macd": 0.27, "sma20": 37.02, "sma50": 36.97 } },
    { "symbol": "BTCIM", "name": "BTCIM", "price": 6.22, "change": 0.48, "volume": "249.0M", "technicalIndicators": { "rsi": 64.7, "macd": -0.41, "sma20": 6.19, "sma50": 5.87 } },
    { "symbol": "CANTE", "name": "CANTE", "price": 1.79, "change": -0.56, "volume": "725.9M", "technicalIndicators": { "rsi": 64.6, "macd": -0.59, "sma20": 1.80, "sma50": 1.66 } },
    { "symbol": "CCOLA", "name": "Coca-Cola İçecek", "price": 75, "change": 0.47, "volume": "305.3M", "technicalIndicators": { "rsi": 69.7, "macd": 0.20, "sma20": 77.01, "sma50": 68.20 } },
    { "symbol": "CIMSA", "name": "CIMSA", "price": 57.6, "change": 0.7, "volume": "768.0M", "technicalIndicators": { "rsi": 53.9, "macd": 0.36, "sma20": 59.39, "sma50": 56.48 } },
    { "symbol": "CVKMD", "name": "CVKMD", "price": 35.68, "change": 3.84, "volume": "1.1B", "technicalIndicators": { "rsi": 48.4, "macd": 0.96, "sma20": 35.16, "sma50": 34.70 } },
    { "symbol": "CWENE", "name": "CWENE", "price": 36.64, "change": 0.55, "volume": "1.5B", "technicalIndicators": { "rsi": 57.1, "macd": -0.98, "sma20": 35.89, "sma50": 35.08 } },
    { "symbol": "DAPGM", "name": "DAPGM", "price": 10.54, "change": 1.35, "volume": "508.2M", "technicalIndicators": { "rsi": 58.6, "macd": -0.76, "sma20": 10.76, "sma50": 10.38 } },
    { "symbol": "DOAS", "name": "Doğuş Otomotiv", "price": 180.5, "change": 0.11, "volume": "199.4M", "technicalIndicators": { "rsi": 60.2, "macd": -0.69, "sma20": 184.76, "sma50": 176.00 } },
    { "symbol": "DOHOL", "name": "Doğan Holding", "price": 22.74, "change": 0.8, "volume": "455.5M", "technicalIndicators": { "rsi": 57.9, "macd": -0.73, "sma20": 23.57, "sma50": 21.20 } },
    { "symbol": "DSTKF", "name": "DSTKF", "price": 2730, "change": 6.12, "volume": "1.2B", "technicalIndicators": { "rsi": 61.6, "macd": -0.74, "sma20": 2697.58, "sma50": 2458.47 } },
    { "symbol": "ECILC", "name": "ECILC", "price": 85.45, "change": -0.12, "volume": "455.1M", "technicalIndicators": { "rsi": 56.1, "macd": -0.34, "sma20": 83.13, "sma50": 77.94 } },
    { "symbol": "EFOR", "name": "EFOR", "price": 11.55, "change": 4.71, "volume": "2.7B", "technicalIndicators": { "rsi": 57.2, "macd": 0.83, "sma20": 11.25, "sma50": 10.53 } },
    { "symbol": "EKGYO", "name": "Emlak Konut GYO", "price": 20.58, "change": 1.98, "volume": "2.2B", "technicalIndicators": { "rsi": 58.2, "macd": -0.42, "sma20": 20.47, "sma50": 20.35 } },
    { "symbol": "ENERY", "name": "ENERY", "price": 8.9, "change": 0.79, "volume": "115.5M", "technicalIndicators": { "rsi": 61.9, "macd": -0.31, "sma20": 8.89, "sma50": 8.57 } },
    { "symbol": "ENJSA", "name": "Enerjisa Enerji", "price": 122.8, "change": 0.24, "volume": "955.7M", "technicalIndicators": { "rsi": 47.4, "macd": 0.57, "sma20": 123.38, "sma50": 115.41 } },
    { "symbol": "ENKAI", "name": "Enka İnşaat", "price": 104.6, "change": -0.29, "volume": "630.6M", "technicalIndicators": { "rsi": 50.9, "macd": -0.03, "sma20": 108.27, "sma50": 99.24 } },
    { "symbol": "EREGL", "name": "Ereğli Demir Çelik", "price": 35.12, "change": 4.15, "volume": "7.8B", "technicalIndicators": { "rsi": 43.3, "macd": -0.79, "sma20": 33.62, "sma50": 33.45 } },
    { "symbol": "EUPWR", "name": "EUPWR", "price": 52.4, "change": 7.16, "volume": "2.0B", "technicalIndicators": { "rsi": 68.0, "macd": -0.70, "sma20": 53.37, "sma50": 49.67 } },
    { "symbol": "EUREN", "name": "EUREN", "price": 5.51, "change": 0.18, "volume": "804.2M", "technicalIndicators": { "rsi": 51.4, "macd": 0.18, "sma20": 5.45, "sma50": 5.36 } },
    { "symbol": "FENER", "name": "FENER", "price": 3.14, "change": 7.9, "volume": "1.3B", "technicalIndicators": { "rsi": 64.8, "macd": -0.37, "sma20": 3.20, "sma50": 2.83 } },
    { "symbol": "FROTO", "name": "Ford Otosan", "price": 98, "change": -0.05, "volume": "1.6B", "technicalIndicators": { "rsi": 67.9, "macd": -0.15, "sma20": 102.25, "sma50": 88.33 } },
    { "symbol": "GARAN", "name": "Garanti BBVA", "price": 133.8, "change": 0.83, "volume": "3.7B", "technicalIndicators": { "rsi": 69.2, "macd": 0.66, "sma20": 136.66, "sma50": 130.17 } },
    { "symbol": "GENIL", "name": "GENIL", "price": 9.26, "change": -2.63, "volume": "363.4M", "technicalIndicators": { "rsi": 63.3, "macd": 0.37, "sma20": 8.88, "sma50": 8.50 } },
    { "symbol": "GESAN", "name": "GESAN", "price": 49.8, "change": 3.32, "volume": "807.9M", "technicalIndicators": { "rsi": 55.1, "macd": -0.13, "sma20": 49.70, "sma50": 47.38 } },
    { "symbol": "GLRMK", "name": "GLRMK", "price": 189.5, "change": 7.06, "volume": "4.0B", "technicalIndicators": { "rsi": 64.8, "macd": 0.42, "sma20": 188.69, "sma50": 181.42 } },
    { "symbol": "GRSEL", "name": "GRSEL", "price": 299, "change": 1.18, "volume": "333.0M", "technicalIndicators": { "rsi": 66.1, "macd": -0.41, "sma20": 305.57, "sma50": 297.26 } },
    { "symbol": "GRTHO", "name": "GRTHO", "price": 258, "change": 1.57, "volume": "428.7M", "technicalIndicators": { "rsi": 69.4, "macd": -0.62, "sma20": 267.41, "sma50": 244.13 } },
    { "symbol": "GSRAY", "name": "GSRAY", "price": 1.17, "change": 2.63, "volume": "563.0M", "technicalIndicators": { "rsi": 40.2, "macd": -0.02, "sma20": 1.21, "sma50": 1.07 } },
    { "symbol": "GUBRF", "name": "GUBRF", "price": 530.5, "change": 0.47, "volume": "764.9M", "technicalIndicators": { "rsi": 62.9, "macd": -0.47, "sma20": 509.97, "sma50": 478.76 } },
    { "symbol": "HALKB", "name": "Halkbank", "price": 37.84, "change": 0.91, "volume": "1.2B", "technicalIndicators": { "rsi": 51.5, "macd": 0.17, "sma20": 38.30, "sma50": 35.19 } },
    { "symbol": "HEKTS", "name": "Hektaş", "price": 3.43, "change": 3.94, "volume": "1.0B", "technicalIndicators": { "rsi": 43.3, "macd": -0.89, "sma20": 3.43, "sma50": 3.34 } },
    { "symbol": "ISCTR", "name": "İş Bankası (C)", "price": 14.34, "change": 2.28, "volume": "5.9B", "technicalIndicators": { "rsi": 52.6, "macd": 0.96, "sma20": 14.19, "sma50": 13.26 } },
    { "symbol": "ISMEN", "name": "ISMEN", "price": 42.28, "change": 1.73, "volume": "288.6M", "technicalIndicators": { "rsi": 44.1, "macd": -0.55, "sma20": 43.06, "sma50": 40.08 } },
    { "symbol": "IZENR", "name": "IZENR", "price": 10.72, "change": 0, "volume": "831.9M", "technicalIndicators": { "rsi": 62.9, "macd": 0.13, "sma20": 10.40, "sma50": 10.61 } },
    { "symbol": "KCHOL", "name": "Koç Holding", "price": 202.2, "change": -0.05, "volume": "4.1B", "technicalIndicators": { "rsi": 58.6, "macd": 0.36, "sma20": 206.67, "sma50": 187.60 } },
    { "symbol": "KLRHO", "name": "KLRHO", "price": 102.3, "change": -0.97, "volume": "345.6M", "technicalIndicators": { "rsi": 47.8, "macd": -0.59, "sma20": 98.17, "sma50": 92.18 } },
    { "symbol": "KONTR", "name": "Kontrolmatik", "price": 10.41, "change": -0.19, "volume": "6.0B", "technicalIndicators": { "rsi": 54.5, "macd": 0.25, "sma20": 10.36, "sma50": 9.86 } },
    { "symbol": "KRDMD", "name": "Kardemir (D)", "price": 38.52, "change": 2.18, "volume": "2.9B", "technicalIndicators": { "rsi": 56.4, "macd": 0.50, "sma20": 39.27, "sma50": 34.74 } },
    { "symbol": "KTLEV", "name": "KTLEV", "price": 115, "change": 4.07, "volume": "4.1B", "technicalIndicators": { "rsi": 68.0, "macd": 0.09, "sma20": 111.69, "sma50": 114.87 } },
    { "symbol": "KUYAS", "name": "KUYAS", "price": 83.1, "change": -1.77, "volume": "1.1B", "technicalIndicators": { "rsi": 64.2, "macd": 0.82, "sma20": 86.98, "sma50": 80.84 } },
    { "symbol": "MAGEN", "name": "MAGEN", "price": 64.05, "change": 1.26, "volume": "290.0M", "technicalIndicators": { "rsi": 60.8, "macd": -0.81, "sma20": 65.46, "sma50": 61.17 } },
    { "symbol": "MAVI", "name": "MAVI", "price": 43.32, "change": 0.74, "volume": "210.7M", "technicalIndicators": { "rsi": 46.1, "macd": 0.01, "sma20": 41.49, "sma50": 39.67 } },
    { "symbol": "MGROS", "name": "Migros", "price": 641.5, "change": 2.48, "volume": "1.3B", "technicalIndicators": { "rsi": 62.6, "macd": -0.15, "sma20": 651.79, "sma50": 595.32 } },
    { "symbol": "MIATK", "name": "MIATK", "price": 39.96, "change": 1.52, "volume": "498.2M", "technicalIndicators": { "rsi": 63.9, "macd": -0.80, "sma20": 41.48, "sma50": 35.99 } },
    { "symbol": "MPARK", "name": "MPARK", "price": 444.75, "change": 4.4, "volume": "951.3M", "technicalIndicators": { "rsi": 44.0, "macd": -0.09, "sma20": 428.52, "sma50": 408.29 } },
    { "symbol": "OBAMS", "name": "OBAMS", "price": 8.25, "change": 4.43, "volume": "669.6M", "technicalIndicators": { "rsi": 67.7, "macd": 0.20, "sma20": 8.31, "sma50": 7.85 } },
    { "symbol": "ODAS", "name": "ODAS", "price": 6.86, "change": -1.86, "volume": "430.7M", "technicalIndicators": { "rsi": 58.3, "macd": 0.89, "sma20": 6.75, "sma50": 6.29 } },
    { "symbol": "OTKAR", "name": "OTKAR", "price": 382.75, "change": 2.96, "volume": "225.7M", "technicalIndicators": { "rsi": 54.7, "macd": -0.56, "sma20": 368.72, "sma50": 347.17 } },
    { "symbol": "OYAKC", "name": "OYAKC", "price": 23.7, "change": -0.42, "volume": "274.5M", "technicalIndicators": { "rsi": 41.6, "macd": -0.78, "sma20": 24.19, "sma50": 21.52 } },
    { "symbol": "PAHOL", "name": "PAHOL", "price": 1.57, "change": 0, "volume": "432.6M", "technicalIndicators": { "rsi": 62.4, "macd": 0.48, "sma20": 1.53, "sma50": 1.54 } },
    { "symbol": "PASEU", "name": "PASEU", "price": 132, "change": 8.82, "volume": "15.0B", "technicalIndicators": { "rsi": 62.5, "macd": -0.85, "sma20": 133.09, "sma50": 125.48 } },
    { "symbol": "PATEK", "name": "PATEK", "price": 21.68, "change": 0.74, "volume": "315.9M", "technicalIndicators": { "rsi": 56.0, "macd": -0.30, "sma20": 21.61, "sma50": 20.70 } },
    { "symbol": "PETKM", "name": "Petkim", "price": 23.9, "change": -3.71, "volume": "2.3B", "technicalIndicators": { "rsi": 44.5, "macd": -0.84, "sma20": 23.82, "sma50": 23.02 } },
    { "symbol": "PGSUS", "name": "Pegasus", "price": 180.6, "change": 0.84, "volume": "2.1B", "technicalIndicators": { "rsi": 49.8, "macd": 0.63, "sma20": 182.32, "sma50": 169.34 } },
    { "symbol": "PSGYO", "name": "PSGYO", "price": 3, "change": -0.33, "volume": "472.2M", "technicalIndicators": { "rsi": 59.5, "macd": -0.94, "sma20": 2.97, "sma50": 2.92 } },
    { "symbol": "QUAGR", "name": "QUAGR", "price": 3.72, "change": 9.73, "volume": "1.5B", "technicalIndicators": { "rsi": 59.0, "macd": -0.56, "sma20": 3.66, "sma50": 3.46 } },
    { "symbol": "RALYH", "name": "RALYH", "price": 336.5, "change": 3.78, "volume": "1.2B", "technicalIndicators": { "rsi": 66.4, "macd": 0.06, "sma20": 352.03, "sma50": 305.47 } },
    { "symbol": "REEDR", "name": "REEDR", "price": 7.62, "change": 0.26, "volume": "264.8M", "technicalIndicators": { "rsi": 64.5, "macd": 0.51, "sma20": 7.99, "sma50": 7.48 } },
    { "symbol": "SAHOL", "name": "Sabancı Holding", "price": 95.65, "change": -0.52, "volume": "3.2B", "technicalIndicators": { "rsi": 69.6, "macd": 0.53, "sma20": 92.62, "sma50": 87.26 } },
    { "symbol": "SARKY", "name": "SARKY", "price": 26.46, "change": 1.3, "volume": "166.5M", "technicalIndicators": { "rsi": 59.9, "macd": 0.45, "sma20": 25.57, "sma50": 24.62 } },
    { "symbol": "SASA", "name": "Sasa Polyester", "price": 3.14, "change": -1.88, "volume": "13.0B", "technicalIndicators": { "rsi": 53.6, "macd": -0.88, "sma20": 3.00, "sma50": 3.12 } },
    { "symbol": "SISE", "name": "Şişe Cam", "price": 47.86, "change": 4.32, "volume": "3.3B", "technicalIndicators": { "rsi": 58.5, "macd": -0.38, "sma20": 47.08, "sma50": 47.58 } },
    { "symbol": "SKBNK", "name": "SKBNK", "price": 12.27, "change": 0.25, "volume": "366.7M", "technicalIndicators": { "rsi": 66.2, "macd": -0.54, "sma20": 11.79, "sma50": 11.23 } },
    { "symbol": "SOKM", "name": "SOKM", "price": 50.9, "change": 0.1, "volume": "345.4M", "technicalIndicators": { "rsi": 67.4, "macd": 0.53, "sma20": 50.09, "sma50": 50.74 } },
    { "symbol": "TABGD", "name": "TABGD", "price": 269, "change": 1.7, "volume": "65.0M", "technicalIndicators": { "rsi": 60.0, "macd": 0.62, "sma20": 257.78, "sma50": 257.72 } },
    { "symbol": "TAVHL", "name": "TAV Havalimanları", "price": 278.5, "change": -0.09, "volume": "887.5M", "technicalIndicators": { "rsi": 60.2, "macd": 0.22, "sma20": 283.75, "sma50": 257.75 } },
    { "symbol": "TCELL", "name": "Turkcell", "price": 112.1, "change": 0, "volume": "2.3B", "technicalIndicators": { "rsi": 54.6, "macd": 0.60, "sma20": 109.42, "sma50": 105.19 } },
    { "symbol": "THYAO", "name": "Türk Hava Yolları", "price": 308.25, "change": -1.99, "volume": "17.3B", "technicalIndicators": { "rsi": 52.6, "macd": 0.68, "sma20": 320.33, "sma50": 295.40 } },
    { "symbol": "TKFEN", "name": "TKFEN", "price": 142.6, "change": 5.24, "volume": "1.5B", "technicalIndicators": { "rsi": 46.3, "macd": 0.62, "sma20": 141.21, "sma50": 138.40 } },
    { "symbol": "TOASO", "name": "Tofaş Oto. Fab.", "price": 294.5, "change": -0.76, "volume": "973.3M", "technicalIndicators": { "rsi": 61.7, "macd": 0.14, "sma20": 280.59, "sma50": 284.15 } },
    { "symbol": "TRALT", "name": "TRALT", "price": 41.38, "change": -0.05, "volume": "5.8B", "technicalIndicators": { "rsi": 67.7, "macd": 0.06, "sma20": 39.45, "sma50": 38.69 } },
    { "symbol": "TRENJ", "name": "TRENJ", "price": 91.8, "change": 2.91, "volume": "178.9M", "technicalIndicators": { "rsi": 51.2, "macd": 0.21, "sma20": 95.94, "sma50": 87.46 } },
    { "symbol": "TRMET", "name": "TRMET", "price": 118.8, "change": -1.98, "volume": "613.0M", "technicalIndicators": { "rsi": 56.3, "macd": -0.52, "sma20": 115.42, "sma50": 109.45 } },
    { "symbol": "TSKB", "name": "TSKB", "price": 11.6, "change": -1.28, "volume": "316.2M", "technicalIndicators": { "rsi": 44.2, "macd": 0.72, "sma20": 11.31, "sma50": 11.08 } },
    { "symbol": "TTKOM", "name": "Türk Telekom", "price": 62.15, "change": -0.96, "volume": "573.7M", "technicalIndicators": { "rsi": 49.0, "macd": -0.56, "sma20": 59.72, "sma50": 58.67 } },
    { "symbol": "TUKAS", "name": "TUKAS", "price": 2.56, "change": 1.99, "volume": "654.2M", "technicalIndicators": { "rsi": 64.1, "macd": 0.89, "sma20": 2.65, "sma50": 2.44 } },
    { "symbol": "TUPRS", "name": "Tüpraş", "price": 271, "change": -1.63, "volume": "6.5B", "technicalIndicators": { "rsi": 48.0, "macd": -0.32, "sma20": 258.98, "sma50": 260.36 } },
    { "symbol": "TUREX", "name": "TUREX", "price": 8.74, "change": 2.34, "volume": "328.7M", "technicalIndicators": { "rsi": 45.0, "macd": 0.65, "sma20": 8.54, "sma50": 8.06 } },
    { "symbol": "TURSG", "name": "TURSG", "price": 14.06, "change": 2.78, "volume": "256.5M", "technicalIndicators": { "rsi": 69.3, "macd": 0.32, "sma20": 13.79, "sma50": 12.83 } },
    { "symbol": "ULKER", "name": "ULKER", "price": 123.9, "change": 0.9, "volume": "714.3M", "technicalIndicators": { "rsi": 67.4, "macd": 0.62, "sma20": 118.20, "sma50": 111.59 } },
    { "symbol": "VAKBN", "name": "Vakıfbank", "price": 31.66, "change": 1.02, "volume": "998.0M", "technicalIndicators": { "rsi": 60.6, "macd": 0.14, "sma20": 31.20, "sma50": 28.77 } },
    { "symbol": "VESTL", "name": "VESTL", "price": 27.8, "change": -0.07, "volume": "130.0M", "technicalIndicators": { "rsi": 66.0, "macd": -0.38, "sma20": 29.01, "sma50": 26.27 } },
    { "symbol": "YKBNK", "name": "Yapı Kredi Bankası", "price": 37.04, "change": 1.31, "volume": "5.5B", "technicalIndicators": { "rsi": 67.1, "macd": 0.20, "sma20": 38.52, "sma50": 34.12 } },
    { "symbol": "ZOREN", "name": "ZOREN", "price": 3.06, "change": 0.99, "volume": "110.4M", "technicalIndicators": { "rsi": 67.3, "macd": 1.00, "sma20": 3.15, "sma50": 2.81 } }
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
                <div className="flex items-center gap-6">
                  <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#00ff9d] tracking-[1.5px] [text-shadow:0_0_8px_rgba(0,255,157,0.3)]">
                    BIST TERMINAL V3.0
                  </span>
                  <div className="flex bg-[rgba(255,119,0,0.05)] p-0.5 rounded border border-[rgba(255,119,0,0.1)]">
                    <button 
                      onClick={() => setActiveTab('dashboard')}
                      className={`px-3 py-1 text-[9px] font-bold font-[var(--font-orbitron)] rounded transition-all ${activeTab === 'dashboard' ? 'bg-[#ff7700] text-black shadow-[0_0_10px_rgba(255,119,0,0.4)]' : 'text-[rgba(255,119,0,0.5)] hover:text-[#ff7700]'}`}
                    >
                      DASHBOARD
                    </button>
                    <button 
                      onClick={() => setActiveTab('analysis')}
                      className={`px-3 py-1 text-[9px] font-bold font-[var(--font-orbitron)] rounded transition-all ${activeTab === 'analysis' ? 'bg-[#ff7700] text-black shadow-[0_0_10px_rgba(255,119,0,0.4)]' : 'text-[rgba(255,119,0,0.5)] hover:text-[#ff7700]'}`}
                    >
                      ANALİZ (AI)
                    </button>
                  </div>
                </div>
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

              {activeTab === 'dashboard' ? (
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
              ) : (
                <BISTAnalysisView 
                  stocks={stocks} 
                  selectedTicker={selectedStock} 
                  onSelectTicker={setSelectedStock} 
                />
              )}
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
