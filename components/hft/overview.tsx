'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { marketDataService, type TickerData } from '@/lib/market-data'

interface Asset {
  ticker: string
  name: string
  price: string | number
  change: string | number
  history: { value: number }[]
}

function MiniSparkline({ data, color }: { data: { value: number }[]; color: string }) {
  if (!data || data.length < 2) return <div className="w-20 h-8 bg-white/5 animate-pulse rounded" />
  return (
    <div className="w-20 h-8 opacity-70">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <YAxis hide domain={['auto', 'auto']} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function PulseColumn({ title, assets, color }: { title: string; assets: Asset[]; color: string }) {
  return (
    <div className="bg-[#0c0602]/90 border border-white/10 rounded-2xl flex flex-col h-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
        <h3 className="text-[11px] font-black tracking-[0.4em] text-white/50 uppercase">{title}</h3>
        <div className="h-2 w-2 rounded-full shadow-[0_0_10px_currentColor] animate-pulse" style={{ backgroundColor: color, color }} />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {assets.map((asset, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/10 group">
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-white group-hover:text-[#ff7700] transition-colors">{asset.ticker}</span>
              <span className="text-[9px] text-white/40 uppercase truncate w-24 font-bold tracking-tighter">{asset.name}</span>
            </div>
            <div className="flex items-center gap-6">
              <MiniSparkline data={asset.history} color={String(asset.change).startsWith('-') ? '#ff3333' : '#00ff9d'} />
              <div className="flex flex-col items-end min-w-[80px]">
                <span className="text-[16px] font-mono font-black text-white tracking-tighter tabular-nums">
                  {typeof asset.price === 'number' ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : asset.price}
                </span>
                <span className={`text-[10px] font-mono font-black px-1 rounded ${String(asset.change).startsWith('-') ? 'text-[#ff3333] bg-[#ff3333]/5' : 'text-[#00ff9d] bg-[#00ff9d]/5'}`}>
                   {asset.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Overview() {
  const [clock, setClock] = useState('')
  const [prices, setPrices] = useState<Record<string, number | string>>({})
  const [changes, setChanges] = useState<Record<string, number | string>>({})
  const [history, setHistory] = useState<Record<string, { value: number }[]>>({})
  const [macroData, setMacroData] = useState<any[]>([])
  const initialized = useRef(false)

  // Asset configuration
  const cryptoList = useMemo(() => [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOGEUSDT', 
    'PEPEUSDT', 'NEARUSDT', 'LINKUSDT', 'DOTUSDT', 'LTCUSDT', 'SHIBUSDT', 'APTUSDT', 'OPUSDT'
  ], [])

  const stockList = useMemo(() => [
    { ticker: 'TSLA', name: 'TESLA INC' },
    { ticker: 'NVDA', name: 'NVIDIA CORP' },
    { ticker: 'AAPL', name: 'APPLE INC' },
    { ticker: 'AMZN', name: 'AMAZON' },
    { ticker: 'MSFT', name: 'MICROSOFT' },
    { ticker: 'GOOGL', name: 'ALPHABET' },
    { ticker: 'META', name: 'META' },
    { ticker: 'AMD', name: 'AMD' }
  ], [])

  const marketIndices = useMemo(() => [
    { ticker: 'SPY', name: 'S&P 500' },
    { ticker: 'QQQ', name: 'NASDAQ 100' },
    { ticker: 'DIA', name: 'DOW JONES' },
    { ticker: 'GLD', name: 'GOLD TRUST' },
    { ticker: 'USO', name: 'US OIL' },
    { ticker: 'EURUSD', name: 'EUR / USD', finn: 'OANDA:EUR_USD' },
    { ticker: 'XAUUSD', name: 'GOLD / USD', finn: 'OANDA:XAU_USD' }
  ], [])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const timer = setInterval(() => setClock(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000)

    // Initial data fetch for all symbols to remove '---'
    const prefetchData = async () => {
      // 1. Crypto Prefetch
      for (const symbol of cryptoList) {
        try {
          const ticker = await marketDataService.fetchTicker(symbol)
          setPrices(prev => ({ ...prev, [symbol]: parseFloat(ticker.price) }))
          setChanges(prev => ({ ...prev, [symbol]: ticker.priceChangePercent }))
        } catch (e) {}
      }

      // 2. Stocks/Indices Prefetch
      const finnSymbols = [...stockList.map(s => s.ticker), ...marketIndices.map(m => m.finn || m.ticker)]
      for (const s of finnSymbols) {
        try {
          const quote = await marketDataService.fetchFinnhubQuote(s)
          if (quote && quote.c) {
            setPrices(prev => ({ ...prev, [s]: quote.c }))
            setChanges(prev => ({ ...prev, [s]: quote.dp || '0' }))
          }
        } catch (e) {}
      }
    }
    prefetchData()

    // 3. Binance Crypto Stream
    marketDataService.subscribeAllTickers((tickers) => {
      tickers.forEach(t => {
        if (cryptoList.includes(t.symbol)) {
          const price = parseFloat(t.price)
          setPrices(prev => ({ ...prev, [t.symbol]: price }))
          setChanges(prev => ({ ...prev, [t.symbol]: t.priceChangePercent }))
          setHistory(prev => {
            const h = prev[t.symbol] || []
            return { ...prev, [t.symbol]: [...h.slice(-19), { value: price }] }
          })
        }
      })
    })

    // 4. Finnhub Stocks Stream
    const finnTargets = [...stockList.map(s => s.ticker), ...marketIndices.map(m => m.finn || m.ticker)]
    marketDataService.subscribeFinnhub(finnTargets, (symbol, price) => {
      if (price) {
        setPrices(prev => ({ ...prev, [symbol]: price }))
        setHistory(prev => {
          const h = prev[symbol] || []
          return { ...prev, [symbol]: [...h.slice(-19), { value: price }] }
        })
      }
    })

    // 5. World Bank Feed
    const fetchMacro = async () => {
      const gdp = await marketDataService.fetchWorldBankIndicator('NY.GDP.MKTP.KD.ZG')
      const inf = await marketDataService.fetchWorldBankIndicator('FP.CPI.TOTL.ZG')
      setMacroData([
        { label: 'GLOBAL GDP GROWTH', value: gdp[0]?.value?.toFixed(2) + '%', year: gdp[0]?.date },
        { label: 'GLOBAL INFLATION', value: inf[0]?.value?.toFixed(2) + '%', year: inf[0]?.date },
      ])
    }
    fetchMacro()

    return () => {
      clearInterval(timer)
      marketDataService.cleanup()
    }
  }, [cryptoList, stockList, marketIndices])

  const assets = useMemo(() => {
    const crypto = cryptoList.map(s => ({
      ticker: s.replace('USDT', ''),
      name: s.replace('USDT', ' / USDT'),
      price: prices[s] || '...',
      change: changes[s] || '0',
      history: history[s] || []
    }))
    
    const stocks = stockList.map(s => ({
      ticker: s.ticker,
      name: s.name,
      price: prices[s.ticker] || '...',
      change: changes[s.ticker] || '0',
      history: history[s.ticker] || []
    }))

    const indices = marketIndices.map(m => {
       const key = m.finn || m.ticker
       return {
          ticker: m.ticker,
          name: m.name,
          price: prices[key] || '...',
          change: changes[key] || '0',
          history: history[key] || []
       }
    })

    return { crypto, stocks, indices }
  }, [prices, changes, history, cryptoList, stockList, marketIndices])

  return (
    <div className="h-full bg-black text-[#ff7700] flex flex-col font-sans select-none overflow-hidden p-4 gap-4">
      {/* Universal Ticker Bar */}
      <div className="h-10 border border-white/10 rounded-xl flex items-center bg-white/[0.02] overflow-hidden shrink-0 shadow-lg">
         <div className="flex items-center gap-12 animate-[marquee_100s_linear_infinite] whitespace-nowrap px-6">
            {[...assets.crypto, ...assets.stocks].concat([...assets.crypto, ...assets.stocks]).map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                 <span className="text-[12px] font-black text-white/80">{a.ticker}</span>
                 <span className={`text-[12px] font-mono font-black ${String(a.change).startsWith('-') ? 'text-[#ff3333]' : 'text-[#00ff9d]'}`}>
                    ${typeof a.price === 'number' ? a.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : a.price}
                 </span>
                 <span className="text-white/10 mx-3 opacity-30">/</span>
              </div>
            ))}
         </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Intelligence Side */}
        <div className="w-80 flex flex-col gap-4 shrink-0">
           {/* Macro Stats */}
           <div className="bg-[#110802] border border-[#ff7700]/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff7700]/5 rounded-full blur-3xl group-hover:bg-[#ff7700]/10 transition-all pointer-events-none" />
              <div className="flex items-center justify-between mb-6">
                 <span className="text-[10px] font-black tracking-[0.5em] text-[#ff7700] uppercase">Macro Data Hub</span>
                 <div className="h-2 w-2 rounded-full bg-[#ff7700] shadow-[0_0_12px_#ff7700] animate-pulse" />
              </div>
              <div className="space-y-6">
                 {macroData.map((m, i) => (
                   <div key={i} className="flex flex-col">
                      <span className="text-[9px] text-white/30 font-black uppercase tracking-tight mb-1">{m.label} ({m.year})</span>
                      <span className="text-3xl font-mono font-black text-white tracking-tighter">{m.value}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Telemetry */}
           <div className="flex-1 bg-[#0c0602] border border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden shadow-xl">
              <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.5em] mb-6">Engine Telemetry</span>
              <div className="space-y-4">
                 {[
                   { l: 'LATENCY', v: '18MS', s: 'OPTIMAL' },
                   { l: 'FINNHUB', v: 'SYNCED', s: 'UP' },
                   { l: 'BINANCE', v: 'STREAMING', s: 'UP' },
                   { l: 'STORAGE', v: 'LOCAL_ENCRYPTED', s: 'OK' }
                 ].map((s, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40 font-bold uppercase">{s.l}</span>
                      <div className="flex flex-col items-end">
                         <span className="text-[11px] text-[#00ff9d] font-mono font-black tracking-widest">{s.v}</span>
                         <span className="text-[7px] text-white/20 font-black uppercase">{s.s}</span>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="flex-1" />
              <div className="p-4 bg-[#ff7700]/5 border border-[#ff7700]/10 rounded-xl">
                 <span className="text-[10px] font-mono text-white/40 leading-relaxed block text-center lowercase">
                    active session: {Math.random().toString(36).slice(2, 10).toUpperCase()}
                 </span>
              </div>
           </div>
        </div>

        {/* Market Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
           <PulseColumn title="Universal Indices / FX" assets={assets.indices} color="#ff7700" />
           <PulseColumn title="Global Equities" assets={assets.stocks} color="#00ff9d" />
           <PulseColumn title="Digital Assets Hub" assets={assets.crypto} color="#ff00aa" />
        </div>
      </div>

      {/* Console Bar */}
      <div className="h-12 bg-[#080402] border border-white/10 rounded-xl flex items-center px-8 justify-between shrink-0 shadow-2xl">
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-[#00ff9d] shadow-[0_0_10px_#00ff9d]" />
               <span className="text-[11px] font-black text-white/90 tracking-[0.2em] uppercase">Hyperlink Synchronization: Finalized</span>
            </div>
            <div className="h-5 w-[1px] bg-white/10" />
            <span className="text-[10px] font-mono text-white/30 truncate max-w-[400px]">SRC: FINNHUB_WSS + BINANCE_GLOBAL_TICKER + WB_IND_API</span>
         </div>
         <div className="text-lg font-mono font-black text-white tracking-[0.3em] tabular-nums">{clock}</div>
      </div>

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 119, 0, 0.2); border-radius: 4px; }
      `}</style>
    </div>
  )
}
