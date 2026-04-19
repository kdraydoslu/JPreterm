function LiveGammaFeed({ markets }: { markets: Market[] }) {
  return (
    <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3 h-[300px] flex flex-col">
      <h3 className="text-[10px] font-[var(--font-orbitron)] text-[#ff7700] mb-2 border-b border-[rgba(255,119,0,0.2)] pb-1">
        LIVE GAMMA FEED
      </h3>
      <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
        {markets.slice(0, 15).map((m, i) => (
          <div key={i} className="flex items-center justify-between text-[9px] font-mono">
            <span className="text-[rgba(255,255,255,0.7)] truncate mr-2">» {m.question}</span>
            <span className="text-[#00ff9d] font-bold shrink-0">{m.yes.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SmartWalletActivity() {
  const [activity, setActivity] = useState<string[]>([])

  useEffect(() => {
    const messages = [
      "Whale 0x71a... bought 50k NO on 'BTC > 100k'",
      "Smart Wallet 0x22b... added 12k YES on 'SOL Pump'",
      "Gamma Insider sold 5k shares of 'ETH Merge'",
      "Institutional flow detected in 'US Election' market",
      "Whale dump: 200k shares liquidated in 'XRP' market",
      "New position: 0x99f... entered 'S&P 500' market",
      "High frequency activity detected: 0x11e..."
    ]
    setActivity(messages)
  }, [])

  return (
    <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3 h-[250px] flex flex-col">
      <h3 className="text-[10px] font-[var(--font-orbitron)] text-[#00ff9d] mb-2 border-b border-[rgba(0,255,157,0.2)] pb-1">
        SMART WALLET ACTIVITY
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {activity.map((msg, i) => (
          <div key={i} className="text-[8px] font-mono text-[rgba(0,255,157,0.8)] border-l border-[#00ff9d] pl-2 hover:bg-[rgba(0,255,157,0.05)] py-1">
             {msg}
          </div>
        ))}
      </div>
    </div>
  )
}

function ExecutionTerminal() {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const initialLogs = [
      `[${new Date().toLocaleTimeString()}] BOT_INITIALIZED: Polymarket Sniper v1.0.3`,
      `[${new Date().toLocaleTimeString()}] SCANNING_LIQUIDITY: 15 active markets found`,
      `[${new Date().toLocaleTimeString()}] SIGNAL_MATCH: BTC_UP_5M (Score: 8.4)`,
      `[${new Date().toLocaleTimeString()}] EXECUTION_PENDING: Waiting for window close...`,
      `[${new Date().toLocaleTimeString()}] TRADING_PAUSED: High volatility detected`,
      `[${new Date().toLocaleTimeString()}] ENGINE_STBY: Monitoring technical signals`,
    ]
    setLogs(initialLogs)
  }, [])

  return (
    <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3 h-full flex flex-col font-mono">
      <h3 className="text-[10px] font-[var(--font-orbitron)] text-[#ff3333] mb-2 border-b border-[rgba(255,51,51,0.2)] pb-1">
        EXECUTION TERMINAL
      </h3>
      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar text-[9px]">
        {logs.map((log, i) => (
          <div key={i} className="text-[rgba(255,255,255,0.6)]">
            <span className="text-[#ff3333] mr-2">»</span>
            {log}
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.1)]">
        <div className="flex justify-between items-center text-[8px] text-[rgba(255,255,255,0.4)]">
          <span>LATENCY: 14ms</span>
          <span>STATUS: SYNCED</span>
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
    polymarketService.fetchMarkets(selectedCategory).then(setMarkets)

    if (!isConfigured) return

    polymarketService.fetchPositions().then(setPositions)
    polymarketService.fetchTrades().then(setTrades)
    polymarketService.fetchBalance().then(setBalance)

    const interval = setInterval(() => {
      polymarketService.fetchMarkets(selectedCategory).then(setMarkets)
      polymarketService.fetchPositions().then(setPositions)
      polymarketService.fetchTrades().then(setTrades)
      polymarketService.fetchBalance().then(setBalance)
    }, 10000)

    return () => clearInterval(interval)
  }, [isConfigured, selectedCategory])

  // Update signal
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
    <div className="h-full bg-[rgba(10,3,0,0.95)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(255,119,0,0.1)] flex items-center justify-between shrink-0">
        <h1 className="font-[var(--font-orbitron)] text-2xl font-bold text-[#ff7700] [text-shadow:0_0_15px_rgba(255,119,0,0.5)]">
            PREDICTION MARKETS <span className="text-[10px] text-[rgba(255,119,0,0.4)] ml-2">v2.1 ULTRA-FLOW</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-[rgba(255,119,0,0.6)]">TOTAL PnL</span>
             <span className="text-[#00ff9d] font-mono font-bold">$1,240.42</span>
          </div>
          {isConfigured && (
            <div className="bg-[rgba(255,119,0,0.05)] border border-[rgba(255,119,0,0.2)] px-3 py-1 rounded">
              <span className="text-[#ff7700] text-sm font-mono font-bold">{balance.usdc.toFixed(2)} USDC</span>
            </div>
          )}
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        
        {/* LEFT COLUMN: Feed & Activity */}
        <div className="w-[300px] flex flex-col gap-4 shrink-0">
          <LiveGammaFeed markets={markets} />
          <SmartWalletActivity />
        </div>

        {/* CENTER COLUMN: Central Markets & Sniper */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Sniper Command Center */}
          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4 grid grid-cols-[1fr_200px] gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-[var(--font-orbitron)] text-sm font-bold text-[#00ff9d]">ULTRA SNIPE ENGINE</h2>
                <div className="bg-[#00ff9d] text-black text-[8px] font-bold px-1.5 py-0.5 rounded animate-pulse">ACTIVE</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[9px] text-[rgba(255,119,0,0.6)] uppercase">Mode Selection</span>
                  <div className="flex gap-1">
                    {(['SAFE', 'AGGRESSIVE', 'DEGEN'] as Mode[]).map((m) => (
                      <button key={m} onClick={() => setMode(m)} className={`flex-1 py-1.5 rounded text-[8px] font-bold ${mode === m ? 'bg-[#ff7700] text-black' : 'bg-black/50 text-[rgba(255,119,0,0.4)] border border-[rgba(255,119,0,0.1)]'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] text-[rgba(255,119,0,0.6)] uppercase">Asset</span>
                  <div className="flex gap-1">
                    {['BTC', 'ETH', 'SOL'].map((a) => (
                      <button key={a} onClick={() => setSelectedAsset(a as Asset)} className={`flex-1 py-1.5 rounded text-[8px] font-bold ${selectedAsset === a ? 'bg-[#00ff9d] text-black' : 'bg-black/50 text-[rgba(255,119,0,0.4)] border border-[rgba(255,119,0,0.1)]'}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-3 rounded border border-[rgba(255,119,0,0.1)]">
                   <div className="text-[8px] text-[rgba(255,119,0,0.6)] mb-1">SIGNAL SCAN</div>
                   <div className={`text-2xl font-bold font-mono ${currentSignal.direction === 'UP' ? 'text-[#00ff9d]' : 'text-[#ff3333]'}`}>
                      {currentSignal.direction} {((currentSignal.confidence || 0) * 100).toFixed(0)}%
                   </div>
                </div>
                <div className="bg-black/40 p-3 rounded border border-[rgba(255,119,0,0.1)]">
                   <div className="text-[8px] text-[rgba(255,119,0,0.6)] mb-1">T-MINUS WINDOW</div>
                   <div className={`text-2xl font-bold font-mono ${window5m.timeLeft < 30 ? 'text-[#ff3333]' : 'text-white'}`}>
                      {formatTimer(window5m.timeLeft)}
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-[rgba(255,119,0,0.03)] border-l border-[rgba(255,119,0,0.2)] pl-4 flex flex-col justify-center gap-2">
              <IndicatorRow label="WINDOW DELTA" value={currentSignal.indicators.delta} weight="7.0" />
              <IndicatorRow label="MOMENTUM" value={currentSignal.indicators.momentum} weight="2.0" />
              <IndicatorRow label="TICK TREND" value={currentSignal.indicators.tick} weight="1.5" />
            </div>
          </div>

          {/* Markets List */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(255,119,0,0.1)] pb-2">
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`text-[9px] font-bold uppercase tracking-wider ${selectedCategory === cat ? 'text-[#ff7700]' : 'text-[rgba(255,119,0,0.4)]'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-[rgba(255,119,0,0.4)]">{filteredMarkets.length} MARKETS SCOPED</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredMarkets.slice(0, 10).map((market) => (
                <div key={market.id} className="bg-black/40 border border-[rgba(255,119,0,0.1)] p-3 rounded-lg hover:border-[rgba(255,119,0,0.3)] transition-colors">
                  <div className="text-[10px] text-[#ff7700] font-bold mb-2 h-8 line-clamp-2">{market.question}</div>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between text-[8px] mb-1">
                        <span className="text-[#00ff9d]">YES</span>
                        <span className="text-white">{market.yes.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00ff9d]" style={{ width: `${market.yes}%` }} />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between text-[8px] mb-1">
                        <span className="text-[#ff3333]">NO</span>
                        <span className="text-white">{market.no.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#ff3333]" style={{ width: `${market.no}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handlePlaceTrade(market.id, 'YES', 10)} className="flex-1 py-1 rounded bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/30 text-[9px] font-bold">BUY YES</button>
                    <button onClick={() => handlePlaceTrade(market.id, 'NO', 10)} className="flex-1 py-1 rounded bg-[#ff3333]/10 text-[#ff3333] border border-[#ff3333]/30 text-[9px] font-bold">BUY NO</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Execution & Positions */}
        <div className="w-[300px] flex flex-col gap-4 shrink-0">
          <div className="flex-1">
            <ExecutionTerminal />
          </div>
          
          <div className="h-[250px] bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3 overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] font-[var(--font-orbitron)] text-[#ffcc00] mb-2 border-b border-[rgba(255,204,0,0.2)] pb-1">
              OPEN POSITIONS
            </h3>
            <div className="space-y-2">
               {positions.length > 0 ? (
                 positions.map((pos) => (
                   <div key={pos.id} className="bg-black/30 p-2 rounded border border-[rgba(255,204,0,0.1)] text-[9px]">
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-[#ff7700] truncate mr-2">{pos.marketId}</span>
                        <span className={pos.pnl >= 0 ? 'text-[#00ff9d]' : 'text-[#ff3333]'}>
                          {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[8px] text-white/50">
                        <span>{pos.outcome} @ ${pos.avgPrice.toFixed(2)}</span>
                        <span>{pos.shares.toFixed(0)} SHARES</span>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-10 text-[9px] text-white/20 italic">No open positions</div>
               )}
            </div>
          </div>
        </div>

      </div>

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#050100] border border-[#ff7700] p-6 max-w-sm w-full rounded-lg shadow-[0_0_30px_rgba(255,119,0,0.2)]">
            <h2 className="text-[#ff7700] font-[var(--font-orbitron)] mb-6 font-bold">SYSTEM AUTH REQUIRED</h2>
            <div className="space-y-4">
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-black border border-white/10 p-2 text-xs font-mono text-[#ff7700] outline-none" placeholder="POLYMARKET API KEY" />
              <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="w-full bg-black border border-white/10 p-2 text-xs font-mono text-[#ff7700] outline-none" placeholder="POLYMARKET SECRET" />
              <input type="text" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="w-full bg-black border border-white/10 p-2 text-xs font-mono text-[#ff7700] outline-none" placeholder="WALLET ADDRESS (0x...)" />
              <button onClick={handleSaveConfig} className="w-full bg-[#ff7700] text-black font-bold py-2 text-xs hover:bg-[#ffaa00] transition-colors">INITIATE CONNECTION</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
