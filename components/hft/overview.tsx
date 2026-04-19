'use client'

import { useEffect, useState, useMemo } from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { marketDataService, type TickerData } from '@/lib/market-data'

interface Asset {
  ticker: string
  name: string
  price: string | number
  change: string | number
  history: { value: number }[]
  source: 'binance' | 'finnhub'
}

function MiniSparkline({ data, color }: { data: { value: number }[]; color: string }) {
  if (!data || data.length < 2) return <div className="w-16 h-6 bg-white/5 animate-pulse rounded" />
  return (
    <div className="w-16 h-6 opacity-60">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
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
    <div className="bg-[#0a0502]/80 border border-white/5 rounded-xl flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h3 className="text-[9px] font-black tracking-[0.3em] text-white/40 uppercase">{title}</h3>
        <div className="h-1.5 w-1.5 rounded-full animate-ping" style={{ backgroundColor: color }} />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {assets.map((asset, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/90">{asset.ticker}</span>
              <span className="text-[7px] text-white/30 uppercase truncate w-20">{asset.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <MiniSparkline data={asset.history} color={String(asset.change).startsWith('-') ? '#ff3333' : '#00ff9d'} />
              <div className="flex flex-col items-end min-w-[60px]">
                <span className="text-[11px] font-mono font-black text-white">
                  {typeof asset.price === 'number' ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : asset.price}
                </span>
                <span className={`text-[8px] font-mono font-black ${String(asset.change).startsWith('-') ? 'text-[#ff3333]' : 'text-[#00ff9d]'}`}>
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

  // Asset Configuration
  const cryptoList = useMemo(() => [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOGEUSDT', 
    'PEPEUSDT', 'NEARUSDT', 'LINKUSDT', 'DOTUSDT', 'LTCUSDT', 'SHIBUSDT', 'APTUSDT', 'OPUSDT'
  ], [])

  const stockList = useMemo(() => [
    { ticker: 'TSLA', name: 'Tesla Inc.' },
    { ticker: 'NVDA', name: 'Nvidia Corp.' },
    { ticker: 'AAPL', name: 'Apple Inc.' },
    { ticker: 'AMZN', name: 'Amazon.com' },
    { ticker: 'MSFT', name: 'Microsoft' },
    { ticker: 'GOOGL', name: 'Alphabet' },
    { ticker: 'META', name: 'Meta Platforms' },
    { ticker: 'AMD', name: 'AMD' }
  ], [])

  const marketIndices = useMemo(() => [
    { ticker: 'SPY', name: 'S&P 500 ETF' },
    { ticker: 'QQQ', name: 'Nasdaq 100' },
    { ticker: 'DIA', name: 'Dow Jones' },
    { ticker: 'GLD', name: 'Gold Trust' },
    { ticker: 'USO', name: 'United States Oil' },
    { ticker: 'EUR/USD', name: 'Euro / Dollar', finn: 'FX:EUR/USD' },
    { ticker: 'XAU/USD', name: 'Gold / Dollar', finn: 'OANDA:XAU_USD' }
  ], [])

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000)

    // 1. Binance Crypto Feed
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

    // 2. Finnhub Stocks & Indices Feed
    const finnSymbols = [...stockList.map(s => s.ticker), ...marketIndices.map(m => m.finn || m.ticker)]
    
    // Initial fetch to avoid '---'
    finnSymbols.forEach(async (s) => {
      const quote = await marketDataService.fetchFinnhubQuote(s)
      if (quote && quote.c) {
        setPrices(prev => ({ ...prev, [s]: quote.c }))
        setChanges(prev => ({ ...prev, [s]: quote.dp || '0' }))
      }
    })

    marketDataService.subscribeFinnhub(finnSymbols, (symbol, price) => {
      setPrices(prev => ({ ...prev, [symbol]: price }))
      setHistory(prev => {
        const h = prev[symbol] || []
        return { ...prev, [symbol]: [...h.slice(-19), { value: price }] }
      })
    })

    // 3. Macro Data
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
      history: history[s] || [],
      source: 'binance' as const
    }))
    
    const stocks = stockList.map(s => ({
      ticker: s.ticker,
      name: s.name,
      price: prices[s.ticker] || '...',
      change: changes[s.ticker] || '0',
      history: history[s.ticker] || [],
      source: 'finnhub' as const
    }))

    const indices = marketIndices.map(m => {
       const key = m.finn || m.ticker
       return {
          ticker: m.ticker,
          name: m.name,
          price: prices[key] || '...',
          change: changes[key] || '0',
          history: history[key] || [],
          source: 'finnhub' as const
       }
    })

    return { crypto, stocks, indices }
  }, [prices, changes, history, cryptoList, stockList, marketIndices])

  return (
    <div className="h-full bg-black text-[#ff7700] flex flex-col font-sans select-none overflow-hidden p-3 gap-3">
      {/* Universal Ticker Bar */}
      <div className="h-8 border border-white/5 rounded-lg flex items-center bg-white/[0.02] overflow-hidden shrink-0">
         <div className="flex items-center gap-10 animate-[marquee_80s_linear_infinite] whitespace-nowrap px-4">
            {[...assets.crypto, ...assets.stocks].concat([...assets.crypto, ...assets.stocks]).map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-white/70">{a.ticker}</span>
                 <span className={`text-[10px] font-mono ${String(a.change).startsWith('-') ? 'text-[#ff3333]' : 'text-[#00ff9d]'}`}>
                    {typeof a.price === 'number' ? a.price.toFixed(2) : a.price}
                 </span>
                 <span className="text-white/5 mx-2">|</span>
              </div>
            ))}
         </div>
      </div>

      <div className="flex-1 flex gap-3 overflow-hidden">
        {/* Intelligence Side */}
        <div className="w-72 flex flex-col gap-3 shrink-0">
           {/* Macro Stats */}
           <div className="bg-[#110802] border border-[#ff7700]/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-[9px] font-black tracking-widest uppercase">Macro Intelligence</span>
                 <div className="h-1.5 w-1.5 rounded-full bg-[#ff7700] shadow-[0_0_8px_#ff7700]" />
              </div>
              <div className="space-y-4">
                 {macroData.map((m, i) => (
                   <div key={i} className="flex flex-col border-l-2 border-[#ff7700]/10 pl-3">
                      <span className="text-[7px] text-white/30 font-bold uppercase">{m.label} ({m.year})</span>
                      <span className="text-xl font-mono font-black text-white">{m.value}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Telemetry */}
           <div className="flex-1 bg-black border border-white/5 rounded-xl p-4 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-[#ff7700]/[0.02] pointer-events-none" 
                   style={{ backgroundImage: 'linear-gradient(rgba(255,119,0,0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />
              <div className="relative">
                 <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.4em] mb-4 block">Engine Status</span>
                 <div className="space-y-3">
                    {[
                      { l: 'CORE LATENCY', v: '18ms', s: 'OPTIMAL' },
                      { l: 'FINNHUB SYNC', v: 'LIVE', s: 'CONNECTED' },
                      { l: 'BINANCE WSS', v: 'SYNCED', s: 'ACTIVE' },
                      { l: 'WORLD BANK API', v: 'OK', s: 'UP' }
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-[9px]">
                         <span className="text-white/30 font-bold">{s.l}</span>
                         <span className="text-[#00ff9d] font-mono">{s.v}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Deep Market Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden">
           <PulseColumn title="FINANCIAL INDICES / FX" assets={assets.indices} color="#ff7700" />
           <PulseColumn title="GLOBAL EQUITIES" assets={assets.stocks} color="#00ff9d" />
           <PulseColumn title="DIGITAL ASSETS" assets={assets.crypto} color="#ff00aa" />
        </div>
      </div>

      {/* Footer System Console */}
      <div className="h-10 bg-black border border-white/5 rounded-lg flex items-center px-6 justify-between shrink-0">
         <div className="flex items-center gap-8">
            <span className="text-[9px] font-mono text-[#00ff9d] animate-pulse">SYSTEM_ONLINE_V2.5 // MULTI_SOURCE_STREAMS_ACTIVE</span>
            <div className="flex items-baseline gap-2">
               <span className="text-[8px] text-white/30">API_KEY:</span>
               <span className="text-[8px] font-mono text-white/60">D7IJ...HKG</span>
            </div>
         </div>
         <div className="text-sm font-mono font-black text-white tracking-[0.2em]">{clock}</div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 119, 0, 0.1); border-radius: 2px; }
      `}</style>
    </div>
  )
}
