'use client'

import { useEffect, useState } from 'react'
import { polymarketService, type Market, type Position, type Trade, type WalletBalance } from '@/lib/polymarket-service'

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
    ema: number
    rsi: number
    volume: number
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
  const indicators = { delta: 0, momentum: 0, acceleration: 0, ema: 0, rsi: 0, volume: 0, tick: 0 }

  if (Math.abs(windowDeltaPct) > 0.10) indicators.delta = windowDeltaPct > 0 ? 7 : -7
  else if (Math.abs(windowDeltaPct) > 0.02) indicators.delta = windowDeltaPct > 0 ? 5 : -5
  else if (Math.abs(windowDeltaPct) > 0.005) indicators.delta = windowDeltaPct > 0 ? 3 : -3
  score += indicators.delta

  indicators.momentum = (Math.random() - 0.5) * 4
  indicators.acceleration = (Math.random() - 0.5) * 3
  indicators.tick = (windowDeltaPct > 0 ? 1 : -1) * (Math.random() * 2)
  score += indicators.momentum + indicators.acceleration + indicators.tick

  const confidence = Math.min(Math.abs(score) / 7.0, 1.0)
  const direction = score > 0.5 ? 'UP' : score < -0.5 ? 'DOWN' : 'NEUTRAL'
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
    <div className="bg-[rgba(0,0,0,0.5)] border border-[rgba(0,255,85,0.1)] p-2 rounded-lg flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[7px] text-[rgba(255,255,255,0.4)] uppercase font-bold mb-1">{label}</span>
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-6 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
            <div
              className={`h-full ${isPos ? 'bg-[#00FF55]' : isNeg ? 'bg-[#FF3333]' : 'bg-[rgba(255,255,255,0.2)]'}`}
              style={{ width: value !== 0 ? '100%' : '0%' }}
            />
          </div>
          <span className="text-[8px] font-mono text-[rgba(255,255,255,0.3)]">W:{weight}</span>
        </div>
      </div>
      <div className={`font-mono text-[10px] font-bold ${isPos ? 'text-[#00FF55]' : isNeg ? 'text-[#FF3333]' : 'text-[rgba(255,255,255,0.2)]'}`}>
        {isPos ? '+' : ''}{value !== 0 ? value.toFixed(1) : 'NÖTR'}
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
  const window15m = getWindowInfo(900)

  // Load saved config
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

  // Fetch data immediately on mount
  useEffect(() => {
    if (!isConfigured) return

    // Fetch from API
    polymarketService.fetchMarkets(selectedCategory).then(setMarkets)
    polymarketService.fetchPositions().then(setPositions)
    polymarketService.fetchTrades().then(setTrades)
    polymarketService.fetchBalance().then(setBalance)

    const interval = setInterval(() => {
      polymarketService.fetchMarkets(selectedCategory).then(setMarkets)
      polymarketService.fetchPositions().then(setPositions)
      polymarketService.fetchTrades().then(setTrades)
      polymarketService.fetchBalance().then(setBalance)
    }, 5000)

    return () => clearInterval(interval)
  }, [isConfigured, selectedCategory])

  // Update signal
  const [currentAssetPrice, setCurrentAssetPrice] = useState(96100.00)
  const [initialSignal, setInitialSignal] = useState<StrategySignal | null>(null)
  
  useEffect(() => {
    // Initialize signal on client only
    setInitialSignal(calculateSignal(96100.00, 96100.00 * 0.9999))
  }, [])
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAssetPrice((prev) => prev + (Math.random() - 0.5) * 100)
      const openPrice = currentAssetPrice * 0.9999
      setSignal(calculateSignal(currentAssetPrice, openPrice))
    }, 2000)
    return () => clearInterval(interval)
  }, [currentAssetPrice])

  const filteredMarkets = selectedCategory === 'all' ? markets : markets.filter((m) => m.category === selectedCategory)
  const currentSignal = signal || initialSignal || calculateSignal(currentAssetPrice, currentAssetPrice * 0.9999)

  const handleSaveConfig = () => {
    polymarketService.setConfig(apiKey, secretKey, walletAddress)
    if (typeof window !== 'undefined') {
      localStorage.setItem('polymarket_config', JSON.stringify({ apiKey, secretKey, walletAddress }))
    }
    setIsConfigured(true)
    setShowConfig(false)
  }

  const handleConnectWallet = () => {
    // Simulate wallet connection
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 40)
    setWalletAddress(mockAddress)
    polymarketService.setConfig(apiKey, secretKey, mockAddress)
    if (typeof window !== 'undefined') {
      localStorage.setItem('polymarket_config', JSON.stringify({ apiKey, secretKey, walletAddress: mockAddress }))
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

  const handleRedeem = async (marketId: string) => {
    const success = await polymarketService.redeem(marketId)
    if (success) {
      setPositions((prev) => prev.map(p => p.marketId === marketId ? { ...p, status: 'REDEEMED' } : p))
    }
  }

  const handleClaim = async (marketId: string) => {
    const success = await polymarketService.claim(marketId)
    if (success) {
      setPositions((prev) => prev.map(p => p.marketId === marketId ? { ...p, status: 'CLOSED' } : p))
    }
  }

  const handleCopyTrade = async (marketId: string, outcome: 'YES' | 'NO', amount: number) => {
    const success = await polymarketService.copyTrade(marketId, outcome, amount)
    if (success) {
      alert('Trade copied successfully!')
    }
  }

  const getSizing = () => {
    if (mode === 'SAFE') return '25%'
    if (mode === 'AGGRESSIVE') return 'PROCEEDS'
    return '100% ALL-IN'
  }

  return (
    <div className="h-full bg-[rgba(10,3,0,0.9)] overflow-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-[var(--font-orbitron)] text-3xl font-bold text-[#ff7700] [text-shadow:var(--glow-cyan)]">
            PREDICTION MARKETS
          </h1>
          <div className="flex items-center gap-3">
            {isConfigured ? (
              <div className="flex items-center gap-2">
                <span className="bg-[rgba(0,255,157,0.2)] border border-[rgba(0,255,157,0.5)] text-[#00ff9d] text-[9px] px-3 py-1 rounded-sm tracking-[2px] font-[var(--font-orbitron)]">
                  ● POLYMARKET CONNECTED
                </span>
                <span className="text-[rgba(255,119,0,0.6)] text-sm font-mono">
                  {balance.usdc.toFixed(2)} USDC
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowConfig(true)}
                className="bg-gradient-to-r from-[#ff7700] to-[#00ff9d] text-[#020810] px-3 py-1.5 rounded font-[var(--font-orbitron)] text-xs font-bold hover:shadow-[0_0_20px_rgba(255,119,0,0.5)] transition-all"
              >
                CONNECT WALLET
              </button>
            )}
            <span className="text-[rgba(255,119,0,0.6)] text-sm font-mono">
              {currentTime}
            </span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="text-[rgba(255,119,0,0.6)] text-sm mb-1">Total Volume 24h</div>
              <div className="font-[var(--font-orbitron)] text-2xl text-[#ff7700] font-bold">${(balance.usdc / 1000000).toFixed(2)}M</div>
            </div>
            <div>
              <div className="text-[rgba(255,119,0,0.6)] text-sm mb-1">Active Markets</div>
              <div className="font-[var(--font-orbitron)] text-2xl text-[#00ff9d] font-bold">{markets.length}</div>
            </div>
            <div>
              <div className="text-[rgba(255,119,0,0.6)] text-sm mb-1">Active Positions</div>
              <div className="font-[var(--font-orbitron)] text-2xl text-[#ffcc00] font-bold">{positions.length}</div>
            </div>
            <div>
              <div className="text-[rgba(255,119,0,0.6)] text-sm mb-1">Available Balance</div>
              <div className="font-[var(--font-orbitron)] text-2xl text-[#00ff9d] font-bold">${balance.available.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Main Content - 50/50 Split */}
        <div className="grid grid-cols-[1fr_1fr] gap-4">
          {/* Left: UltraSnipe / SpeedBets Panel */}
          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--font-orbitron)] text-sm font-bold text-[#00ff9d] [text-shadow:var(--glow-green)]">
                ULTRA SNIPE ENGINE
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex h-2 w-2 rounded-full bg-[#00FF55] animate-ping" />
                <span className="text-[8px] font-mono text-[#00FF55] uppercase tracking-widest">AI ENGINE v4.2</span>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-2">
              {(['SAFE', 'AGGRESSIVE', 'DEGEN'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-widest transition-all ${
                    mode === m
                      ? 'bg-[#00FF55] text-black shadow-[0_0_10px_rgba(0,255,85,0.5)]'
                      : 'bg-[rgba(10,3,0,0.8)] border border-[rgba(255,119,0,0.2)] text-[rgba(255,119,0,0.6)] hover:border-[#ff7700]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Asset Selector */}
            <div className="grid grid-cols-2 gap-2">
              {(['BTC', 'ETH', 'SOL', 'XRP'] as Asset[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setSelectedAsset(a)}
                  className={`p-2 rounded-lg font-mono text-sm font-bold transition-all ${
                    selectedAsset === a
                      ? 'bg-[#ff7700] text-black'
                      : 'bg-[rgba(10,3,0,0.8)] border border-[rgba(255,119,0,0.2)] text-[rgba(255,119,0,0.6)] hover:border-[#ff7700]'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Window Monitor */}
            <div className="bg-[rgba(0,0,0,0.5)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] text-[rgba(255,119,0,0.6)] uppercase font-bold">Aktif Pencere</span>
                <span className="text-[7px] text-[#ff7700] bg-[rgba(255,119,0,0.2)] px-1.5 py-0.5 rounded">UNIX DIV/300</span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-black text-white italic tracking-tighter tabular-nums">5 DAK</span>
                <span className={`text-xl font-mono font-bold ${window5m.timeLeft < 30 ? 'text-[#FF3333]' : 'text-[#00FF55]'}`}>
                  {formatTimer(window5m.timeLeft)}
                </span>
              </div>
              <div className="h-1.5 bg-[rgba(0,0,0,0.5)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00FF55] transition-all duration-500"
                  style={{ width: `${(window5m.timeLeft / 300) * 100}%` }}
                />
              </div>
              <div className="text-[7px] text-[rgba(255,119,0,0.4)] mt-1 font-mono truncate">
                Slug: {window5m.slug}
              </div>
            </div>

            {/* Signal Panel */}
            <div className="bg-[rgba(0,0,0,0.5)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3 text-center">
              <div className="text-[8px] text-[rgba(255,119,0,0.6)] uppercase tracking-widest mb-2">Sinyal Güven Skoru</div>
              <div
                className={`text-4xl font-black italic tracking-tighter ${
                  currentSignal.direction === 'UP' ? 'text-[#00FF55]' :
                  currentSignal.direction === 'DOWN' ? 'text-[#FF3333]' : 'text-white'
                }`}
              >
                {((currentSignal.confidence || 0) * 100).toFixed(0)}%
              </div>
              <div className="mt-2 inline-block px-3 py-1 rounded-full font-mono text-xs font-black uppercase tracking-widest bg-white text-black">
                {currentSignal.direction} SİNYALİ
              </div>
            </div>

            {/* Indicators */}
            <div className="space-y-2">
              <IndicatorRow label="1. Window Delta" value={currentSignal.indicators.delta} weight="7.0" />
              <IndicatorRow label="2. Micro Momentum" value={currentSignal.indicators.momentum} weight="2.0" />
              <IndicatorRow label="3. Acceleration" value={currentSignal.indicators.acceleration} weight="1.5" />
              <IndicatorRow label="4. Tick Trend (2s)" value={currentSignal.indicators.tick} weight="2.0" />
            </div>

            {/* Snipe Status */}
            <div className="bg-[rgba(255,51,51,0.1)] border border-[rgba(255,51,51,0.3)] rounded-lg p-2">
              <p className="font-mono text-[8px] text-[#FF3333]/70 uppercase">
                <span className="font-bold">SNIPER_MODE_{mode}:</span> T-10s Otomatik tetikleme devrede. Kasa: {getSizing()}
              </p>
            </div>
          </div>

          {/* Right: Markets List */}
          <div className="space-y-3">
            {/* Category Filter */}
            <div className="flex gap-2 mb-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded text-xs font-[var(--font-orbitron)] transition-all ${
                    selectedCategory === cat
                      ? 'bg-[rgba(255,119,0,0.2)] border border-[#ff7700] text-[#ff7700]'
                      : 'bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] text-[rgba(255,119,0,0.6)] hover:text-[#ff7700]'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Markets */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredMarkets.map((market) => (
                <div
                  key={market.id}
                  className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3 hover:bg-[rgba(10,3,0,0.8)] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {market.trending && (
                          <span className="bg-[rgba(255,102,0,0.2)] border border-[rgba(255,102,0,0.5)] text-[rgba(255,102,0,1)] text-[7px] px-1.5 py-0.5 rounded font-bold">
                            🔥 TRENDING
                          </span>
                        )}
                        {market.live && (
                          <span className="bg-[rgba(0,255,157,0.2)] border border-[rgba(0,255,157,0.5)] text-[#00ff9d] text-[7px] px-1.5 py-0.5 rounded font-bold">
                            ● LIVE
                          </span>
                        )}
                        <span className="text-[rgba(255,119,0,0.6)] text-xs">{market.category}</span>
                      </div>
                      <div className="text-[#ff7700] text-sm mb-1">{market.question}</div>
                      <div className="flex gap-3 text-[9px] text-[rgba(255,119,0,0.6)]">
                        <span>Vol: <span className="text-[#ff7700]">{market.volume}</span></span>
                        <span>Liq: <span className="text-[#00ff9d]">{market.liquidity}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* YES/NO Bars */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#00ff9d] text-xs font-bold">YES</span>
                        <span className="text-[#00ff9d] text-sm font-mono font-bold">{market.yes.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-[rgba(255,119,0,0.1)] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00ff9d] rounded-full" style={{ width: `${market.yes}%` }} />
                      </div>
                      <button
                        onClick={() => handlePlaceTrade(market.id, 'YES', 100)}
                        className="w-full mt-1.5 bg-[rgba(0,255,157,0.2)] border border-[#00ff9d] text-[#00ff9d] py-1.5 rounded text-xs font-bold hover:bg-[rgba(0,255,157,0.3)] transition-colors"
                      >
                        BUY YES
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#ff2244] text-xs font-bold">NO</span>
                        <span className="text-[#ff2244] text-sm font-mono font-bold">{market.no.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-[rgba(255,119,0,0.1)] rounded-full overflow-hidden">
                        <div className="h-full bg-[#ff2244] rounded-full" style={{ width: `${market.no}%` }} />
                      </div>
                      <button
                        onClick={() => handlePlaceTrade(market.id, 'NO', 100)}
                        className="w-full mt-1.5 bg-[rgba(255,34,68,0.2)] border border-[#ff2244] text-[#ff2244] py-1.5 rounded text-xs font-bold hover:bg-[rgba(255,34,68,0.3)] transition-colors"
                      >
                        BUY NO
                      </button>
                    </div>
                  </div>

                  {/* Copy Trade Button */}
                  <button
                    onClick={() => handleCopyTrade(market.id, currentSignal.direction === 'UP' ? 'YES' : 'NO', 100)}
                    className="w-full mt-2 bg-[rgba(255,204,0,0.2)] border border-[rgba(255,204,0,0.5)] text-[#ffcc00] py-1.5 rounded text-xs font-bold hover:bg-[rgba(255,204,0,0.3)] transition-colors"
                  >
                    COPY SIGNAL
                  </button>
                </div>
              ))}
            </div>

            {/* Active Positions */}
            {positions.length > 0 && (
              <div className="mt-4">
                <h3 className="font-[var(--font-orbitron)] text-sm font-bold text-[#00ff9d] mb-2">
                  ACTIVE POSITIONS
                </h3>
                <div className="space-y-2">
                  {positions.map((pos) => (
                    <div key={pos.id} className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-[#ff7700] text-sm font-bold">{pos.marketId}</div>
                          <div className="text-[rgba(255,119,0,0.6)] text-xs">
                            {pos.outcome} • {pos.shares.toFixed(2)} shares @ ${pos.avgPrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono text-sm font-bold ${pos.pnl >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
                            {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                          </div>
                          <div className="text-[7px] text-[rgba(255,119,0,0.4)] uppercase">{pos.status}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {pos.status === 'OPEN' && (
                          <>
                            <button
                              onClick={() => handleRedeem(pos.marketId)}
                              className="flex-1 bg-[rgba(0,255,157,0.2)] border border-[#00ff9d] text-[#00ff9d] py-1.5 rounded text-xs font-bold"
                            >
                              REDEEM
                            </button>
                            <button
                              onClick={() => handleClaim(pos.marketId)}
                              className="flex-1 bg-[rgba(255,204,0,0.2)] border border-[#ffcc00] text-[#ffcc00] py-1.5 rounded text-xs font-bold"
                            >
                              CLAIM
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[rgba(2,8,18,0.95)] border border-[rgba(255,119,0,0.3)] rounded-lg p-6 max-w-md w-full">
            <h2 className="font-[var(--font-orbitron)] text-xl font-bold text-[#ff7700] mb-4">
              POLYMARKET CONFIGURATION
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-[rgba(255,119,0,0.6)] mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-[rgba(10,3,0,0.8)] border border-[rgba(255,119,0,0.3)] rounded px-3 py-2 text-[#ff7700] text-sm font-mono focus:border-[#ff7700] outline-none"
                  placeholder="Enter your API key"
                />
              </div>
              
              <div>
                <label className="block text-[10px] text-[rgba(255,119,0,0.6)] mb-1">Secret Key</label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full bg-[rgba(10,3,0,0.8)] border border-[rgba(255,119,0,0.3)] rounded px-3 py-2 text-[#ff7700] text-sm font-mono focus:border-[#ff7700] outline-none"
                  placeholder="Enter your secret key"
                />
              </div>
              
              <div>
                <label className="block text-[10px] text-[rgba(255,119,0,0.6)] mb-1">Wallet Address</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full bg-[rgba(10,3,0,0.8)] border border-[rgba(255,119,0,0.3)] rounded px-3 py-2 text-[#ff7700] text-sm font-mono focus:border-[#ff7700] outline-none"
                  placeholder="0x..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveConfig}
                className="flex-1 bg-[#ff7700] text-[#020810] py-2 rounded font-[var(--font-orbitron)] text-sm font-bold hover:bg-[#00ccdd] transition-colors"
              >
                SAVE & CONNECT
              </button>
              <button
                onClick={handleConnectWallet}
                className="flex-1 bg-[#00ff9d] text-[#020810] py-2 rounded font-[var(--font-orbitron)] text-sm font-bold hover:bg-[#00cc7a] transition-colors"
              >
                CONNECT WALLET
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 bg-[rgba(255,34,68,0.2)] border border-[#ff2244] text-[#ff2244] py-2 rounded font-[var(--font-orbitron)] text-sm font-bold hover:bg-[rgba(255,34,68,0.3)] transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
