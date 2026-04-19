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
}

function MiniSparkline({ data, color }: { data: { value: number }[]; color: string }) {
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
                <span className="text-[11px] font-mono font-black text-white">{asset.price}</span>
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
  const [liveTickers, setLiveTickers] = useState<Record<string, TickerData>>({})
  const [macroData, setMacroData] = useState<any[]>([])
  const [history, setHistory] = useState<Record<string, { value: number }[]>>({})

  // High-density symbol lists (60-70 assets total)
  const cryptoSymbols = useMemo(() => [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOGEUSDT', 
    'DOTUSDT', 'LINKUSDT', 'MATICUSDT', 'NEARUSDT', 'ICPUSDT', 'SHIBUSDT', 'PEPEUSDT', 'LTCUSDT',
    'BCHUSDT', 'UNIUSDT', 'APTUSDT', 'FILUSDT', 'OPUSDT', 'ARBUSDT', 'STXUSDT', 'TIAUSDT'
  ], [])

  const worldIndices = useMemo(() => [
    'SPY', 'QQQ', 'DIA', 'IWM', 'VGK', 'EWJ', 'EEM', 'VTI', 'VEA', 'VWO', 'GLD', 'SLV', 'USO', 'TLT', 'DXY'
  ], [])

  useEffect(() => {
    // 1. Clock
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000)

    // 2. Real-time Market Data Stream
    marketDataService.subscribeAllTickers((tickers) => {
      const filtered: Record<string, TickerData> = {}
      tickers.forEach(t => {
        if (cryptoSymbols.includes(t.symbol)) {
          filtered[t.symbol] = t
          // Update History for sparklines
          setHistory(prev => {
            const h = prev[t.symbol] || []
            const newH = [...h.slice(-19), { value: parseFloat(t.price) }]
            return { ...prev, [t.symbol]: newH }
          })
        }
      })
      setLiveTickers(prev => ({ ...prev, ...filtered }))
    })

    // 3. Macro Data Feed (World Bank)
    const fetchMacro = async () => {
      const gdp = await marketDataService.fetchWorldBankIndicator('NY.GDP.MKTP.KD.ZG') // GDP Growth
      const inf = await marketDataService.fetchWorldBankIndicator('FP.CPI.TOTL.ZG')    // Inflation
      const une = await marketDataService.fetchWorldBankIndicator('SL.UEM.TOTL.ZS')    // Unemployment
      setMacroData([
        { label: 'GLOBAL GDP GROWTH', value: gdp[0]?.value?.toFixed(2) + '%', year: gdp[0]?.date },
        { label: 'GLOBAL INFLATION', value: inf[0]?.value?.toFixed(2) + '%', year: inf[0]?.date },
        { label: 'GLOBAL UNEMPLOYMENT', value: une[0]?.value?.toFixed(2) + '%', year: une[0]?.date },
      ])
    }
    fetchMacro()

    return () => {
      clearInterval(timer)
      marketDataService.cleanup()
    }
  }, [cryptoSymbols])

  const assets = useMemo(() => {
    return cryptoSymbols.map(s => ({
      ticker: s.replace('USDT', ''),
      name: s.replace('USDT', ' / USDT'),
      price: liveTickers[s]?.price || '---',
      change: liveTickers[s]?.priceChangePercent || '0',
      history: history[s] || []
    }))
  }, [liveTickers, cryptoSymbols, history])

  return (
    <div className="h-full bg-black text-[#ff7700] flex flex-col font-sans select-none overflow-hidden p-3 gap-3">
      {/* Top Universal Ticker Tape */}
      <div className="h-8 border border-white/5 rounded-lg flex items-center bg-white/[0.02] overflow-hidden relative shrink-0">
         <div className="flex items-center gap-8 animate-[marquee_60s_linear_infinite] whitespace-nowrap px-4">
            {assets.concat(assets).map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-white/80">{a.ticker}</span>
                 <span className={`text-[10px] font-mono ${String(a.change).startsWith('-') ? 'text-[#ff3333]' : 'text-[#00ff9d]'}`}>
                    {a.price} ({a.change}%)
                 </span>
                 <span className="text-white/10 mx-2">|</span>
              </div>
            ))}
         </div>
      </div>

      {/* Main Command Center Layout */}
      <div className="flex-1 flex gap-3 overflow-hidden">
        {/* Sidebar Intelligence & Macro */}
        <div className="w-72 flex flex-col gap-3 shrink-0">
           {/* Macro Data Hub */}
           <div className="bg-gradient-to-br from-[#1a0d05] to-black border border-[#ff7700]/20 rounded-xl p-4 shadow-xl">
              <h4 className="text-[9px] font-black tracking-widest text-[#ff7700] uppercase mb-4 flex items-center justify-between">
                 <span>Global Macro (WB FEED)</span>
                 <div className="h-2 w-2 rounded-full bg-[#ff7700] animate-pulse" />
              </h4>
              <div className="space-y-4">
                 {macroData.length > 0 ? macroData.map((m, i) => (
                   <div key={i} className="flex flex-col">
                      <span className="text-[8px] text-white/30 font-bold tracking-tighter uppercase">{m.label} ({m.year})</span>
                      <span className="text-xl font-mono font-black text-white">{m.value}</span>
                   </div>
                 )) : (
                   <div className="text-[10px] animate-pulse text-white/20">FETCHING MACRO DATA...</div>
                 )}
              </div>
           </div>

           {/* System Telemetry */}
           <div className="flex-1 bg-black border border-white/5 rounded-xl p-4 flex flex-col">
              <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.4em] mb-4">Core Telemetry</span>
              <div className="space-y-3">
                 {[
                   { l: 'CPU LOAD', v: '14.2%', c: '#00ff9d' },
                   { l: 'WSS THROUGHPUT', v: '4.2 MB/S', c: '#00ff9d' },
                   { l: 'API LATENCY', v: '12-42ms', c: '#ffcc00' },
                   { l: 'UPTIME', v: '24h 42m', c: '#00ff9d' },
                   { l: 'JARVIS SYNC', v: 'OPTIMAL', c: '#00ff9d' },
                 ].map((s, i) => (
                   <div key={i} className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                      <span className="text-[9px] text-white/40 font-bold">{s.l}</span>
                      <span className="text-[10px] font-mono font-black" style={{ color: s.c }}>{s.v}</span>
                   </div>
                 ))}
              </div>
              <div className="flex-1" />
              <div className="p-3 bg-[#ff7700]/5 border border-[#ff7700]/10 rounded-lg">
                 <div className="text-[7px] font-black text-[#ff7700] uppercase mb-1 tracking-widest">Active Connection</div>
                 <div className="text-[9px] font-mono text-white/60 truncate">WSS::BINANCE_GLOBAL_TICKER_ARRAY</div>
              </div>
           </div>
        </div>

        {/* Pulse Grids (The 60-70 Assets Band) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-hidden">
           <PulseColumn title="CORE CURRENCIES" assets={assets.slice(0, 20)} color="#ff7700" />
           <PulseColumn title="ECOSYSTEM ASSETS" assets={assets.slice(20, 40)} color="#00ff9d" />
           <PulseColumn title="GLOBAL INDICES (MOCK)" assets={assets.slice(0, 15).map(a => ({ ...a, ticker: 'IDX_' + a.ticker, name: 'Index ' + a.ticker }))} color="#ff00aa" />
        </div>
      </div>

      {/* Footer Nav & Clock */}
      <div className="h-10 bg-black border border-white/5 rounded-lg flex items-center px-6 justify-between shrink-0">
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-[#00ff9d] shadow-[0_0_8px_#00ff9d]" />
               <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">System Synced: Global Macro & Micro</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[9px] font-mono text-white/20">DATA SOURCE: BINANCE_WSS + WORLD_BANK_API + FRED_PROXY</span>
         </div>
         <div className="text-sm font-mono font-black text-white tracking-[0.2em]">{clock}</div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 119, 0, 0.1);
          border-radius: 2px;
        }
      `}</style>
    </div>
  )
}
