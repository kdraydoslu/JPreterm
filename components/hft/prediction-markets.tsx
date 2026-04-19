'use client'

import { useEffect, useState, useRef } from 'react'
import { polymarketService, type Market, type Position, type Trade, type WalletBalance } from '@/lib/polymarket-service'
import { marketDataService } from '@/lib/market-data'
import { MarketChart } from './market-chart'
import { MiniOrderBook } from './mini-order-book'

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
    <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3 h-[300px] flex flex-col shadow-inner">
      <div className="flex items-center justify-between mb-2 border-b border-[rgba(255,119,0,0.2)] pb-1">
        <h3 className="text-[10px] font-[var(--font-orbitron)] text-[#ff7700] tracking-widest font-black uppercase">LIVE GAMMA FEED</h3>
        <span className="text-[8px] text-[rgba(0,255,157,0.7)] font-mono animate-pulse">● STREAMING</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
        {displayMarkets.map((m, i) => (
          <div key={i} className="flex items-center justify-between text-[9px] font-mono group hover:bg-white/5 p-1 rounded transition-colors border-b border-white/5 pb-1">
            <span className="text-[rgba(255,255,255,0.7)] truncate mr-2 group-hover:text-white uppercase">» {m.question}</span>
            <span className={`font-black shrink-0 ${m.yes > 50 ? 'text-[#00ff9d]' : 'text-[#ff3333]'}`}>{m.yes?.toFixed(0)}%</span>
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
      <h3 className="text-[10px] font-[var(--font-orbitron)] text-[#00ff9d] mb-2 border-b border-[rgba(0,255,157,0.2)] pb-1 tracking-widest font-black uppercase">
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
        <h3 className="text-[10px] font-[var(--font-orbitron)] text-[#ff3333] tracking-widest font-black uppercase">EXECUTION TERMINAL</h3>
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
  const [chartVisible, setChartVisible] = useState<string | null>(null)
  const [markets, setMarkets] = useState<Market[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [balance, setBalance] = useState<WalletBalance & { binance: number; okx: number }>({ 
    usdc: 0, eth: 0, available: 0, binance: 14250.22, okx: 8420.15 
  })
  
  const [apiKey, setApiKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  
  const categories = ['all', 'Crypto', 'Markets', 'Economics', 'Politics']
  const window5m = getWindowInfo(300)

  // Mock chart data
  const mockChartData = Array(50).fill(0).map((_, i) => ({
    time: Math.floor(Date.now() / 1000) - (50 - i) * 3600,
    value: 0.82 + Math.sin(i / 5) * 0.05 + Math.random() * 0.02
  }))

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
      
      const bal = await polymarketService.fetchBalance()
      const pos = await polymarketService.fetchPositions()
      setBalance(prev => ({ ...prev, ...bal }))
      setPositions(pos)
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [isConfigured, selectedCategory])

  const [currentAssetPrice, setCurrentAssetPrice] = useState(96100.00)
  const [signal, setSignal] = useState<StrategySignal | null>(null)
  
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

  const handleSaveConfig = () => {
    polymarketService.setConfig(apiKey, secretKey, walletAddress)
    if (typeof window !== 'undefined') {
      localStorage.setItem('polymarket_config', JSON.stringify({ apiKey, secretKey, walletAddress }))
    }
    setIsConfigured(true)
    setShowConfig(false)
  }

  return (
    <div className="h-full bg-[rgba(5,1,0,0.98)] overflow-hidden flex flex-col font-sans select-none">
      {/* Header with Multi-Exchange Status */}
      <div className="p-4 border-b border-[rgba(255,119,0,0.15)] bg-black/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-[#ff7700] rounded-lg flex items-center justify-center font-bold text-black border-2 border-[#ffaa00] shadow-[0_0_20px_rgba(255,119,0,0.3)]">
             <span className="text-lg font-black">PT</span>
          </div>
          <h1 className="font-[var(--font-orbitron)] text-2xl font-black tracking-tighter text-[#ff7700] [text-shadow:0_0_15px_rgba(255,119,0,0.5)]">
              PRE-TERM HUB <span className="text-[10px] text-white/40 ml-2 font-mono uppercase tracking-widest">v2.5_ELITE</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex gap-4 border-r border-white/10 pr-6">
             <div className="text-right">
                <span className="text-[8px] text-white/30 uppercase font-black tracking-widest">Binance</span>
                <div className="text-[14px] text-white font-mono font-black">${balance.binance.toLocaleString()}</div>
             </div>
             <div className="text-right">
                <span className="text-[8px] text-white/30 uppercase font-black tracking-widest">OKX</span>
                <div className="text-[14px] text-white font-mono font-black">${balance.okx.toLocaleString()}</div>
             </div>
             <div className="text-right">
                <span className="text-[8px] text-white/30 uppercase font-black tracking-widest">Poly Wallet</span>
                <div className="text-[14px] text-[#00ff9d] font-mono font-black">${balance.usdc.toLocaleString()}</div>
             </div>
          </div>
          
          <div onClick={() => setShowConfig(true)} className="cursor-pointer group bg-[#ff7700]/10 border border-[#ff7700]/30 px-4 py-2 rounded-lg hover:bg-[#ff7700]/20 transition-all">
              <span className="text-[9px] text-[#ff7700] uppercase font-black tracking-[0.2em] block">Status: {isConfigured ? 'ON-CHAIN' : 'OFFLINE'}</span>
              <span className="text-white font-mono font-bold text-[10px]">{walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : 'SET AUTH KEYS'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-4 overflow-hidden">
        
        {/* LEFT COLUMN */}
        <div className="w-[340px] flex flex-col gap-4 shrink-0">
          <LiveGammaFeed markets={markets} />
          <SmartWalletActivity />
        </div>

        {/* CENTER COLUMN: Central Markets & Snipe Hub */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Sniper Command Center */}
          <div className="bg-[rgba(10,3,0,0.8)] border border-[rgba(255,119,0,0.25)] rounded-2xl p-6 shadow-2xl relative overflow-hidden group min-h-[380px]">
             <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff7700]/5 blur-[120px] rounded-full" />
             
             <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="h-6 w-1 bg-[#00ff9d]" />
                   <h2 className="font-[var(--font-orbitron)] text-lg font-black text-white tracking-[0.2em]">ULTRA SNIPE ENGINE</h2>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Lat: 8ms</span>
                   <div className="bg-[#00ff9d] text-black text-[10px] font-black px-3 py-1 rounded shadow-[0_0_20px_rgba(0,255,157,0.4)]">ACTIVE SCAN</div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-10 relative z-10">
                <div className="space-y-6">
                   <div className="bg-black/60 p-6 rounded-2xl border border-white/5 shadow-inner">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] text-white/30 font-black uppercase tracking-widest font-mono">Signal Score</span>
                         <span className={`text-[10px] font-black ${signal?.direction === 'UP' ? 'text-[#00ff9d]' : 'text-[#ff3333]'}`}>{signal?.direction} TREND</span>
                      </div>
                      <div className={`text-5xl font-black font-mono tracking-tighter ${signal?.direction === 'UP' ? 'text-[#00ff9d] [text-shadow:0_0_40px_rgba(0,255,157,0.4)]' : 'text-[#ff3333] [text-shadow:0_0_40px_rgba(255,51,51,0.4)]'}`}>
                         {((signal?.confidence || 0.84) * 100).toFixed(0)}%
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                         <span className="text-[9px] text-white/30 font-black uppercase tracking-widest block mb-2">T-Window</span>
                         <span className="text-2xl font-black font-mono text-white tracking-widest">{formatTimer(window5m.timeLeft)}</span>
                      </div>
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                         <span className="text-[9px] text-white/30 font-black uppercase tracking-widest block mb-2">Risk Mode</span>
                         <span className="text-2xl font-black font-mono text-[#ff7700] tracking-widest">{mode}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-black/40 p-6 rounded-2xl border border-white/5 flex flex-col justify-center gap-6">
                   <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                   {[
                      { label: "Gamma Delta", val: "8.42", sign: "+" },
                      { label: "Tick Accel", val: "1.12", sign: "-" },
                      { label: "Whale Alpha", val: "0.89", sign: "+" }
                   ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                         <span className="text-white/40 uppercase font-black">{item.label}</span>
                         <span className={item.sign === "+" ? 'text-[#00ff9d]' : 'text-[#ff3333]'}>{item.sign}{item.val}</span>
                      </div>
                   ))}
                   <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
             </div>
          </div>

          {/* Market List with Mini-Order-Books */}
          <div className="flex-1 space-y-10 mt-6 pb-20">
             <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex gap-8">
                   {categories.map((cat) => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`text-[12px] font-black uppercase tracking-[0.3em] transition-all pb-2 border-b-2 ${selectedCategory === cat ? 'text-[#ff7700] border-[#ff7700]' : 'text-white/20 border-transparent hover:text-white/40'}`}>
                         {cat}
                      </button>
                   ))}
                </div>
                <span className="text-[11px] font-mono text-white/30 font-black uppercase tracking-widest">{filteredMarkets.length} ASSETS MONITORED</span>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {filteredMarkets.length > 0 ? (
                  filteredMarkets.slice(0, 10).map((market) => (
                    <div key={market.id} className="bg-black/60 border border-white/5 rounded-3xl p-6 hover:border-[#ff7700]/30 transition-all group flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                       {/* Chart Toggle Overlay */}
                       {chartVisible === market.id && (
                         <div className="absolute inset-0 bg-black/90 p-6 z-20 animate-fadeIn">
                            <div className="flex items-center justify-between mb-4">
                               <h4 className="text-[10px] text-[#ff7700] font-black uppercase tracking-[0.3em]">Price History (24H)</h4>
                               <button onClick={() => setChartVisible(null)} className="text-white/40 hover:text-white text-[10px] font-black underline uppercase">Close Chart</button>
                            </div>
                            <MarketChart data={mockChartData} />
                         </div>
                       )}

                       <div className="flex items-start justify-between">
                          <div className="space-y-1 max-w-[70%]">
                             <span className="text-[8px] text-[#ff7700] font-black uppercase tracking-[0.4em]">{market.category}</span>
                             <h4 className="text-[13px] text-white font-black leading-tight uppercase group-hover:text-[#ff7700] transition-colors">{market.question}</h4>
                          </div>
                          <button onClick={() => setChartVisible(market.id)} className="bg-white/5 px-3 py-1 rounded text-[8px] font-black text-white/40 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">Show Chart</button>
                       </div>

                       <div className="grid grid-cols-2 gap-6 bg-black/40 p-4 rounded-2xl border border-white/5">
                          {/* YES COLUMN */}
                          <div className="space-y-3">
                             <div className="flex items-center justify-between px-1">
                                <span className="text-[#00ff9d] text-[10px] font-black uppercase">Bid Space</span>
                                <span className="text-white font-mono font-black text-[14px]">{market.yes.toFixed(0)}%</span>
                             </div>
                             <MiniOrderBook tokenId={market.id} side="YES" />
                             <button className="w-full py-2 bg-[#00ff9d]/5 border border-[#00ff9d]/20 text-[#00ff9d] text-[11px] font-black rounded-lg hover:bg-[#00ff9d]/20 transition-all uppercase tracking-widest active:scale-95">Limit Buy YES</button>
                          </div>
                          {/* NO COLUMN */}
                          <div className="space-y-3">
                             <div className="flex items-center justify-between px-1">
                                <span className="text-[#ff3333] text-[10px] font-black uppercase">Ask Space</span>
                                <span className="text-white font-mono font-black text-[14px]">{market.no.toFixed(0)}%</span>
                             </div>
                             <MiniOrderBook tokenId={market.id} side="NO" />
                             <button className="w-full py-2 bg-[#ff3333]/5 border border-[#ff3333]/20 text-[#ff3333] text-[11px] font-black rounded-lg hover:bg-[#ff3333]/20 transition-all uppercase tracking-widest active:scale-95">Limit Buy NO</button>
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                  [1,2,3,4].map(i => (
                    <div key={i} className="h-[300px] bg-black/40 border border-white/5 rounded-3xl animate-pulse" />
                  ))
                )}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-[340px] flex flex-col gap-4 shrink-0">
          <ExecutionTerminal />
          
          <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-5 overflow-hidden flex flex-col shadow-2xl">
              <h3 className="text-[10px] font-black text-[#ffcc00] uppercase tracking-[0.3em] mb-4 border-b border-white/5 pb-2">Active Positions</h3>
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                 {positions.map(pos => (
                   <div key={pos.id} className="bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-[#ff7700]/30 transition-all">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] text-white/40 font-black uppercase truncate max-w-[150px]">{pos.marketId}</span>
                         <span className={`text-[12px] font-black ${pos.pnl >= 0 ? 'text-[#00ff9d]' : 'text-[#ff3333]'}`}>{pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[9px] text-white/60">
                         <span>{pos.outcome} @ ${pos.avgPrice.toFixed(2)}</span>
                         <span>{pos.shares} QTY</span>
                      </div>
                   </div>
                 ))}
                 {positions.length === 0 && <div className="h-full flex items-center justify-center text-white/20 text-[10px] font-black uppercase tracking-widest italic">Monitoring Liquidity...</div>}
              </div>
          </div>
        </div>

      </div>

      {showConfig && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-6">
          <div className="bg-[#050100] border border-[#ff7700] p-10 max-w-sm w-full rounded-3xl shadow-[0_0_60px_rgba(255,119,0,0.4)] relative">
            <h2 className="text-[#ff7700] font-[var(--font-orbitron)] mb-10 font-black text-center tracking-[0.3em] text-xl">ELITE_AUTH_V2</h2>
            <div className="space-y-6">
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-black/60 border border-white/10 p-4 text-xs font-mono text-[#ff7700] rounded-xl outline-none focus:border-[#ff7700]/60" placeholder="CLOB API KEY" />
              <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="w-full bg-black/60 border border-white/10 p-4 text-xs font-mono text-[#ff7700] rounded-xl outline-none focus:border-[#ff7700]/60" placeholder="CLOB SECRET" />
              <input type="text" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="w-full bg-black/60 border border-white/10 p-4 text-xs font-mono text-[#ff7700] rounded-xl outline-none focus:border-[#ff7700]/60" placeholder="WALLET ADDRESS" />
              <button onClick={handleSaveConfig} className="w-full bg-[#ff7700] text-black font-black py-5 text-[11px] rounded-xl shadow-lg active:scale-95 transition-all tracking-[0.2em] uppercase">Connect Core Hub</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
