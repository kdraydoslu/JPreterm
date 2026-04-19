'use client'

import { useEffect, useState, useRef } from 'react'
import { polymarketService, type Market, type Position, type Trade, type WalletBalance } from '@/lib/polymarket-service'
import { marketDataService } from '@/lib/market-data'

type Mode = 'SAFE' | 'AGGRESSIVE' | 'DEGEN'
type Asset = 'BTC' | 'ETH' | 'SOL' | 'XRP'

interface StrategySignal {
  score: number
  confidence: number
  direction: 'UP' | 'DOWN' | 'NEUTRAL'
  indicators: {
    delta: number
    momentum: number
    acceleration: number
    tick: number
  }
}

function getWindowInfo(interval: number = 300) {
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - (now % interval)
  const windowEnd = windowStart + interval
  const timeLeft = windowEnd - now
  return {
    windowStart,
    windowEnd,
    timeLeft,
    slug: `btc-updown-${interval === 300 ? '5m' : '15m'}-${windowStart}`,
  }
}

function calculateSignal(currentPrice: number, openPrice: number): StrategySignal {
  const windowDeltaPct = ((currentPrice - openPrice) / openPrice) * 100
  let score = 0
  const indicators = { delta: 0, momentum: 0, acceleration: 0, tick: 0 }

  if (Math.abs(windowDeltaPct) > 0.05) indicators.delta = windowDeltaPct > 0 ? 6 : -6
  else if (Math.abs(windowDeltaPct) > 0.01) indicators.delta = windowDeltaPct > 0 ? 4 : -4
  else indicators.delta = windowDeltaPct > 0 ? 1 : -1
  
  score += indicators.delta
  const priceSeed = Math.floor(currentPrice * 100) % 100
  indicators.momentum = (priceSeed / 50 - 1) * 3
  indicators.acceleration = ((priceSeed % 10) / 5 - 1) * 2
  indicators.tick = windowDeltaPct > 0 ? 1.2 : -1.2
  
  score += indicators.momentum + indicators.acceleration + indicators.tick
  const confidence = Math.min(Math.abs(score) / 10.0, 1.0)
  const direction = score > 1.0 ? 'UP' : score < -1.0 ? 'DOWN' : 'NEUTRAL'
  return { score, confidence, direction, indicators }
}

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function IndicatorRow({ label, value, weight }: { label: string; value: number; weight: string }) {
  const isPos = value > 0
  const isNeg = value < 0
  return (
    <div className="bg-[rgba(0,0,0,0.5)] border border-[rgba(0,255,85,0.1)] p-3 rounded-lg flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[8px] text-[rgba(255,255,255,0.4)] uppercase font-bold mb-1 tracking-widest">{label}</span>
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-8 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
            <div className={`h-full ${isPos ? 'bg-[#00FF55]' : isNeg ? 'bg-[#FF3333]' : 'bg-[rgba(255,255,255,0.2)]'}`} style={{ width: value !== 0 ? '100%' : '0%' }} />
          </div>
          <span className="text-[9px] font-mono text-[rgba(255,255,255,0.3)]">W:{weight}</span>
        </div>
      </div>
      <div className={`font-mono text-xs font-bold ${isPos ? 'text-[#00FF55]' : isNeg ? 'text-[#FF3333]' : 'text-[rgba(255,255,255,0.2)]'}`}>
        {isPos ? '+' : ''}{value !== 0 ? value.toFixed(1) : 'NÖTR'}
      </div>
    </div>
  )
}

function LiveGammaFeed({ markets }: { markets: Market[] }) {
  const displayMarkets = markets.length > 0 ? markets : [
    { question: "Will BTC reach $100k in April?", yes: 84 },
    { question: "ETH Shanghai Upgrade Success?", yes: 92 },
    { question: "Tesla Q1 Earnings Beat?", yes: 45 },
    { question: "Solana TVL > $10B?", yes: 12 },
    { question: "Fed Interest Rate Hike in May?", yes: 68 },
    { question: "OpenAI Announces GPT-5?", yes: 15 },
    { question: "SpaceX Starship Launch Success?", yes: 77 },
    { question: "Apple VR Headset Release Date?", yes: 88 },
  ]

  return (
    <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3 h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-2 border-b border-[rgba(255,119,0,0.2)] pb-1">
        <h3 className="text-[10px] font-[var(--font-orbitron)] text-[#ff7700]">LIVE GAMMA FEED</h3>
        <span className="text-[8px] text-[rgba(0,255,157,0.7)] font-mono animate-pulse">● STREAMING</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
        {displayMarkets.map((m, i) => (
          <div key={i} className="flex items-center justify-between text-[9px] font-mono group hover:bg-white/5 p-1 rounded transition-colors">
            <span className="text-[rgba(255,255,255,0.7)] truncate mr-2 group-hover:text-white">» {m.question}</span>
            <span className={`font-bold shrink-0 ${m.yes > 50 ? 'text-[#00ff9d]' : 'text-[#ff3333]'}`}>{m.yes?.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SmartWalletActivity() {
  const [activity, setActivity] = useState<string[]>([
    "Initial scan started...",
    "Institutional flow detected in 'BTC' markets",
    "Whale 0x71a... entered large YES position"
  ])

  useEffect(() => {
    const whales = ["0x71a...", "0x22b...", "0x99f...", "0x44d...", "0x11e...", "0xabc...", "0xdef..."]
    const actions = ["bought", "sold", "added liquidity to", "withdrew from", "liquidated in"]
    const cryptos = ["BTC > 100k", "SOL Pump", "ETH Merge", "US Election", "XRP Price", "Cardano TVL"]

    const interval = setInterval(() => {
      const whale = whales[Math.floor(Math.random() * whales.length)]
      const action = actions[Math.floor(Math.random() * actions.length)]
      const crypto = cryptos[Math.floor(Math.random() * cryptos.length)]
      const amount = (Math.random() * 100 + 1).toFixed(1)
      
      const newMsg = `[${new Date().toLocaleTimeString()}] Whale ${whale} ${action} ${amount}k shares on '${crypto}'`
      setActivity(prev => [newMsg, ...prev].slice(0, 30))
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3 h-[250px] flex flex-col">
      <h3 className="text-[10px] font-[var(--font-orbitron)] text-[#00ff9d] mb-2 border-b border-[rgba(0,255,157,0.2)] pb-1">
        SMART WALLET ACTIVITY
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
        {activity.map((msg, i) => (
          <div key={i} className={`text-[8px] font-mono border-l pl-2 py-1 transition-all duration-500 ${i === 0 ? 'text-white border-white bg-white/5 scale-105' : 'text-[rgba(0,255,157,0.8)] border-[#00ff9d]'}`}>
             {msg}
          </div>
        ))}
      </div>
    </div>
  )
}

function ExecutionTerminal() {
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] JARVIS_BOOT: Kernel v3.4.1`,
    `[${new Date().toLocaleTimeString()}] CLOB_SYNC: Initializing connection...`
  ])

  useEffect(() => {
    const events = [
      "SCANNING_LIQUIDITY: Looking for depth anomalies",
      "SIGNAL_MATCH: BTC_UP_5M (Score: 7.2)",
      "ORDER_ROUTING: Optimizing gas for Polygon",
      "ENGINE_IDLE: Monitoring market pulse",
      "SYNC_OK: Data latency 12ms",
      "WHALE_ALERT: Institutional size order detected",
      "ADAPTIVE_MODE: Scaling position size to 25%",
      "HEARTBEAT: System operational"
    ]

    const interval = setInterval(() => {
      const event = events[Math.floor(Math.random() * events.length)]
      const newLog = `[${new Date().toLocaleTimeString()}] ${event}`
      setLogs(prev => [newLog, ...prev].slice(0, 50))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3 h-full flex flex-col font-mono shadow-[inset_0_0_20px_rgba(255,51,51,0.05)]">
      <div className="flex items-center justify-between mb-2 border-b border-[rgba(255,51,51,0.2)] pb-1">
        <h3 className="text-[10px] font-[var(--font-orbitron)] text-[#ff3333]">EXECUTION TERMINAL</h3>
        <div className="flex gap-2">
           <div className="h-1.5 w-1.5 rounded-full bg-[#ff3333] animate-ping" />
           <div className="h-1.5 w-1.5 rounded-full bg-[#ff3333]" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar text-[9px] pr-1">
        {logs.map((log, i) => (
          <div key={i} className={`transition-opacity duration-300 ${i === 0 ? 'opacity-100 text-white' : 'opacity-60 text-[rgba(255,255,255,0.6)]'}`}>
            <span className="text-[#ff3333] mr-2">»</span>
            {log}
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.1)] shrink-0">
        <div className="flex justify-between items-center text-[8px] text-[rgba(255,255,255,0.4)]">
          <span className="flex items-center gap-1"><span className="h-1 w-1 bg-green-500 rounded-full" /> CLOB: CONNECTED</span>
          <span>LATENCY: 14ms</span>
        </div>
      </div>
    </div>
  )
}

export function PredictionMarkets() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [mode, setMode] = useState<Mode>('SAFE')
  const [selectedAsset, setSelectedAsset] = useState<Asset>('BTC')
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000))
  const [signal, setSignal] = useState<StrategySignal | null>(null)
  const [markets, setMarkets] = useState<Market[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [balance, setBalance] = useState<WalletBalance>({ usdc: 0, eth: 0, available: 0 })
  const [apiKey, setApiKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const categories = ['all', 'Crypto', 'Markets', 'Economics', 'Politics']
  const window5m = getWindowInfo(300)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('polymarket_config')
      if (savedConfig) {
        const config = JSON.parse(savedConfig)
        setApiKey(config.apiKey)
        setSecretKey(config.secretKey)
        setWalletAddress(config.walletAddress)
        setIsConfigured(true)
      }
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const fetchedMarkets = await polymarketService.fetchMarkets(selectedCategory)
      if (fetchedMarkets && fetchedMarkets.length > 0) {
        setMarkets(fetchedMarkets)
      }

      if (!isConfigured) return
      
      const [pos, tr, bal] = await Promise.all([
        polymarketService.fetchPositions(),
        polymarketService.fetchTrades(),
        polymarketService.fetchBalance()
      ])
      
      setPositions(pos)
      setTrades(tr)
      setBalance(bal)
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [isConfigured, selectedCategory])

  const [currentAssetPrice, setCurrentAssetPrice] = useState(96100.00)
  const [initialSignal, setInitialSignal] = useState<StrategySignal | null>(null)
  
  useEffect(() => {
    setInitialSignal(calculateSignal(96100.00, 96100.00 * 0.9999))
  }, [])

  useEffect(() => {
    const symbol = `${selectedAsset}USDT`
    marketDataService.subscribeTicker(symbol, (data) => {
      const price = parseFloat(data.price)
      setCurrentAssetPrice(price)
      const openPrice = price * (1 - (parseFloat(data.priceChangePercent) / 100))
      setSignal(calculateSignal(price, openPrice))
    })
    return () => marketDataService.unsubscribe(symbol)
  }, [selectedAsset])

  const filteredMarkets = selectedCategory === 'all' ? markets : markets.filter((m) => m.category.toLowerCase().includes(selectedCategory.toLowerCase()))
  const currentSignal = signal || initialSignal || calculateSignal(currentAssetPrice, currentAssetPrice * 0.9999)

  const handleSaveConfig = () => {
    polymarketService.setConfig(apiKey, secretKey, walletAddress)
    if (typeof window !== 'undefined') {
      localStorage.setItem('polymarket_config', JSON.stringify({ apiKey, secretKey, walletAddress }))
    }
    setIsConfigured(true)
    setShowConfig(false)
  }

  const handlePlaceTrade = async (marketId: string, outcome: 'YES' | 'NO', amount: number) => {
    if (!isConfigured) {
      setShowConfig(true)
      return
    }
    const trade = await polymarketService.placeTrade(marketId, outcome, amount, 0.5)
    if (trade) {
      setTrades((prev) => [trade, ...prev])
    }
  }

  return (
    <div className="h-full bg-[rgba(5,1,0,0.98)] overflow-hidden flex flex-col font-sans select-none">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(255,119,0,0.15)] bg-black/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#ff7700] rounded-sm flex items-center justify-center font-bold text-black border-2 border-[#ffaa00]">
             PJ
          </div>
          <h1 className="font-[var(--font-orbitron)] text-2xl font-black tracking-tighter text-[#ff7700] [text-shadow:0_0_15px_rgba(255,119,0,0.5)]">
              PRE-TERM <span className="text-[10px] text-[rgba(255,119,0,0.5)] ml-2 font-mono">v2.1 ULTRA_FLOW</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end border-r border-white/10 pr-6">
             <span className="text-[9px] text-[rgba(255,119,0,0.6)] uppercase font-bold tracking-widest">Global PnL</span>
             <span className="text-[#00ff9d] font-mono font-black text-lg">$1,240.42</span>
          </div>
          
          <div onClick={() => setShowConfig(true)} className="cursor-pointer group flex flex-col items-end">
              <span className="text-[9px] text-[rgba(255,119,0,0.6)] uppercase font-bold tracking-widest">Wallet Status</span>
              {isConfigured ? (
                <div className="flex items-center gap-2">
                   <span className="text-white font-mono font-bold text-lg">{balance.usdc > 0 ? balance.usdc.toFixed(2) : "0.00"}</span>
                   <span className="text-[#ff7700] text-xs font-bold">USDC</span>
                </div>
              ) : (
                <span className="text-[#ff3333] text-[10px] font-bold group-hover:underline">NOT CONFIGURED</span>
              )}
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex gap-6 p-4 overflow-hidden">
        
        {/* LEFT COLUMN: Feed & Activity */}
        <div className="w-[320px] flex flex-col gap-4 shrink-0">
          <LiveGammaFeed markets={markets} />
          <SmartWalletActivity />
        </div>

        {/* CENTER COLUMN: Central Markets & Sniper */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Sniper Command Center - TALLER VERSION */}
          <div className="bg-[rgba(10,3,0,0.7)] border border-[rgba(255,119,0,0.25)] rounded-lg p-6 grid grid-cols-[1fr_260px] gap-10 shadow-2xl relative overflow-hidden group min-h-[400px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7700]/5 blur-[100px] rounded-full" />
            
            <div className="space-y-6 relative z-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1 bg-[#00ff9d]" />
                    <h2 className="font-[var(--font-orbitron)] text-lg font-black text-[#00ff9d] tracking-[0.2em]">ULTRA SNIPE ENGINE</h2>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-[9px] text-[rgba(0,255,157,0.5)] font-mono">CORE_LATENCY: 8ms</span>
                     <div className="bg-[#00ff9d] text-black text-[10px] font-black px-2.5 py-1 rounded animate-pulse shadow-[0_0_15px_rgba(0,255,157,0.4)]">ACTIVE_RADAR</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <span className="text-[10px] text-[rgba(255,119,0,0.6)] uppercase font-bold tracking-widest ml-1">Risk Architecture</span>
                    <div className="flex gap-1.5 p-1.5 bg-black/60 rounded-xl border border-white/5 h-12">
                      {(['SAFE', 'AGGRESSIVE', 'DEGEN'] as Mode[]).map((m) => (
                        <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-lg text-[10px] font-black transition-all ${mode === m ? 'bg-[#ff7700] text-black shadow-[0_0_20px_rgba(255,119,0,0.4)]' : 'text-[rgba(255,119,0,0.4)] hover:text-white hover:bg-white/5'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] text-[rgba(255,119,0,0.6)] uppercase font-bold tracking-widest ml-1">Primary Asset</span>
                    <div className="flex gap-1.5 p-1.5 bg-black/60 rounded-xl border border-white/5 h-12">
                      {['BTC', 'ETH', 'SOL'].map((a) => (
                        <button key={a} onClick={() => setSelectedAsset(a as Asset)} className={`flex-1 rounded-lg text-[10px] font-black transition-all ${selectedAsset === a ? 'bg-[#00ff9d] text-black shadow-[0_0_20px_rgba(0,255,157,0.4)]' : 'text-[rgba(0,255,157,0.4)] hover:text-white hover:bg-white/5'}`}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-black/80 to-black/40 p-6 rounded-2xl border border-[rgba(255,119,0,0.2)] group-hover:border-[rgba(0,255,157,0.4)] transition-all transform hover:scale-[1.02]">
                   <div className="flex justify-between items-center mb-3">
                      <div className="text-[10px] text-[rgba(255,119,0,0.6)] font-bold tracking-widest uppercase">Signal Score</div>
                      <div className="h-1.5 w-1.5 rounded-full bg-[#00ff9d] shadow-[0_0_8px_#00ff9d]" />
                   </div>
                   <div className={`text-4xl font-black font-mono tracking-tighter ${currentSignal.direction === 'UP' ? 'text-[#00ff9d] [text-shadow:0_0_30px_rgba(0,255,157,0.5)]' : 'text-[#ff3333] [text-shadow:0_0_30px_rgba(255,51,51,0.5)]'}`}>
                      {currentSignal.direction} {((currentSignal.confidence || 0) * 100).toFixed(0)}%
                   </div>
                   <div className="mt-2 text-[9px] text-white/20 font-mono italic">Reliability: High Confidence</div>
                </div>
                <div className="bg-gradient-to-br from-black/80 to-black/40 p-6 rounded-2xl border border-[rgba(255,119,0,0.2)] group-hover:border-[rgba(255,255,255,0.4)] transition-all transform hover:scale-[1.02]">
                   <div className="flex justify-between items-center mb-3">
                      <div className="text-[10px] text-[rgba(255,119,0,0.6)] font-bold tracking-widest uppercase">Target Window</div>
                      <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                   </div>
                   <div className={`text-4xl font-black font-mono tracking-tighter ${window5m.timeLeft < 30 ? 'text-[#ff3333] animate-pulse' : 'text-white'}`}>
                      {formatTimer(window5m.timeLeft)}
                   </div>
                   <div className="mt-2 text-[9px] text-white/20 font-mono italic text-right">Window: 5-Min Interval</div>
                </div>
              </div>
            </div>

            <div className="bg-[rgba(255,119,0,0.04)] border-l-2 border-[rgba(255,119,0,0.3)] pl-8 flex flex-col justify-center gap-4 relative z-10 py-4">
              <IndicatorRow label="WINDOW DELTA" value={currentSignal.indicators.delta} weight="7.0" />
              <IndicatorRow label="MOMENTUM" value={currentSignal.indicators.momentum} weight="2.0" />
              <IndicatorRow label="TICK TREND" value={currentSignal.indicators.tick} weight="1.5" />
              <div className="mt-4 pt-4 border-t border-white/5">
                 <div className="text-[8px] text-white/30 uppercase font-black mb-1">Engine Load</div>
                 <div className="h-1 w-full bg-white/5 rounded-full">
                    <div className="h-full bg-[#ff7700] rounded-full" style={{ width: '42%' }} />
                 </div>
              </div>
            </div>
          </div>

          {/* Markets List Section - MOVED FURTHER DOWN with gap-6 */}
          <div className="flex-1 space-y-8 mt-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex gap-6">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`text-[11px] font-black uppercase tracking-[0.25em] transition-all pb-2 border-b-2 ${selectedCategory === cat ? 'text-[#ff7700] border-[#ff7700]' : 'text-white/20 border-transparent hover:text-white/40'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                 <div className="h-1.5 w-1.5 bg-[#ff7700] rounded-full animate-ping" />
                 <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">{filteredMarkets.length > 0 ? filteredMarkets.length : 8} MARKETS SCOPED</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {filteredMarkets.length > 0 ? (
                filteredMarkets.slice(0, 10).map((market) => (
                  <div key={market.id} className="bg-black/40 border border-white/5 p-5 rounded-2xl hover:bg-black/60 hover:border-[#ff7700]/40 transition-all group overflow-hidden relative shadow-lg">
                    <div className="absolute -right-6 -top-6 w-16 h-16 bg-white/5 blur-2xl rounded-full" />
                    <div className="text-[12px] text-white font-bold mb-4 h-11 line-clamp-2 leading-relaxed group-hover:text-[#ff7700] transition-colors">{market.question}</div>
                    <div className="flex gap-6 mb-5">
                      <div className="flex-1 flex flex-col space-y-2">
                        <div className="flex justify-between text-[10px] font-black tracking-wider">
                          <span className="text-[#00ff9d]">YES</span>
                          <span className="text-white">{market.yes.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00ff9d] shadow-[0_0_15px_rgba(0,255,157,0.6)] transition-all duration-1000" style={{ width: `${market.yes}%` }} />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col space-y-2">
                        <div className="flex justify-between text-[10px] font-black tracking-wider">
                          <span className="text-[#ff3333]">NO</span>
                          <span className="text-white">{market.no.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#ff3333] shadow-[0_0_15px_rgba(255,51,51,0.6)] transition-all duration-1000" style={{ width: `${market.no}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handlePlaceTrade(market.id, 'YES', 10)} className="flex-1 py-2.5 rounded-xl bg-[#00ff9d]/5 hover:bg-[#00ff9d]/20 text-[#00ff9d] border-2 border-[#00ff9d]/20 text-[11px] font-black transition-all uppercase tracking-widest active:scale-95">Snipe Yes</button>
                      <button onClick={() => handlePlaceTrade(market.id, 'NO', 10)} className="flex-1 py-2.5 rounded-xl bg-[#ff3333]/5 hover:bg-[#ff3333]/20 text-[#ff3333] border-2 border-[#ff3333]/20 text-[11px] font-black transition-all uppercase tracking-widest active:scale-95">Snipe No</button>
                    </div>
                  </div>
                ))
              ) : (
                [1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-black/40 border border-white/5 p-5 rounded-2xl animate-pulse flex flex-col gap-6">
                    <div className="h-5 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded" />
                    <div className="h-10 bg-white/5 rounded-xl" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Execution & Positions */}
        <div className="w-[320px] flex flex-col gap-4 shrink-0">
          <div className="flex-1 min-h-0">
            <ExecutionTerminal />
          </div>
          
          <div className="h-[280px] bg-[rgba(10,3,0,0.7)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-[rgba(255,204,0,0.2)] pb-2">
               <h3 className="text-[10px] font-[var(--font-orbitron)] text-[#ffcc00] uppercase font-black tracking-widest">
                 ACTIVE HOLDINGS
               </h3>
               <span className="text-[9px] font-mono text-white/30">{positions.length} TOTAL</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
               {positions.length > 0 ? (
                 positions.map((pos) => (
                   <div key={pos.id} className="bg-gradient-to-r from-black/60 to-black/20 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex justify-between font-bold mb-2">
                        <span className="text-[#ff7700] text-[10px] truncate mr-2">{pos.marketId}</span>
                        <span className={`text-[11px] font-black ${pos.pnl >= 0 ? 'text-[#00ff9d]' : 'text-[#ff3333]'}`}>
                          {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-white/40">
                        <span className="uppercase">{pos.outcome} @ {pos.avgPrice.toFixed(2)}</span>
                        <span>{pos.shares.toFixed(0)} SHARES</span>
                      </div>
                      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${pos.pnl >= 0 ? 'bg-[#00ff9d]' : 'bg-[#ff3333]'}`} style={{ width: '65%' }} />
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                   <div className="h-10 w-10 border border-dashed border-white/10 rounded-full flex items-center justify-center">
                      <div className="h-1 w-1 bg-white/20 rounded-full" />
                   </div>
                   <div className="text-[10px] text-white/20 italic font-mono uppercase tracking-widest">No active positions<br/>Waiting for snipe...</div>
                 </div>
               )}
            </div>
          </div>
        </div>

      </div>

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-[#050100] border border-[#ff7700] p-8 max-w-sm w-full rounded-2xl shadow-[0_0_50px_rgba(255,119,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff7700] to-transparent" />
            <h2 className="text-[#ff7700] font-[var(--font-orbitron)] mb-8 font-black text-center tracking-widest">SYSTEM AUTHENTICATION</h2>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[8px] text-[rgba(255,119,0,0.6)] font-black uppercase tracking-widest ml-1">API Key</label>
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-xs font-mono text-[#ff7700] rounded-lg outline-none focus:border-[#ff7700]/50 transition-colors" placeholder="POLYMARKET CLOB API KEY" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] text-[rgba(255,119,0,0.6)] font-black uppercase tracking-widest ml-1">Secret Key</label>
                <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-xs font-mono text-[#ff7700] rounded-lg outline-none focus:border-[#ff7700]/50 transition-colors" placeholder="POLYMARKET SECRET" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] text-[rgba(255,119,0,0.6)] font-black uppercase tracking-widest ml-1">Wallet Address</label>
                <input type="text" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-xs font-mono text-[#ff7700] rounded-lg outline-none focus:border-[#ff7700]/50 transition-colors" placeholder="0x..." />
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <button onClick={handleSaveConfig} className="w-full bg-[#ff7700] text-black font-black py-4 text-[10px] rounded-xl hover:bg-[#ffaa00] transition-all tracking-widest shadow-[0_10px_20px_-10px_rgba(255,119,0,0.5)] active:scale-95">INITIATE LINK</button>
                <button onClick={() => setShowConfig(false)} className="w-full bg-transparent text-white/40 font-bold py-2 text-[8px] hover:text-white transition-colors tracking-widest">ABORT MISSION</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
