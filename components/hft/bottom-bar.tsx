'use client'

import { useEffect, useState, useCallback } from 'react'

// Tab index mapping:
// 0=Overview, 1=Portfolio, 2=FinTerm, 3=CryptoHFT, 4=USMarkets, 5=BIST, 6=Prediction, 7=JarvisOS

interface BottomBarProps { activeTab?: number }

// ── Shared mini card ──────────────────────────────────────────────────────────
const MiniCard = ({ label, value, sub, color = '#ff7700' }: { label: string; value: string; sub?: string; color?: string }) => (
  <div className="flex-1 bg-[rgba(10,1,0,0.8)] border border-[rgba(255,119,0,0.15)] rounded-sm px-2 py-1 flex flex-col justify-between min-w-0">
    <div className="font-[var(--font-orbitron)] text-[7px] text-[rgba(255,119,0,0.5)] tracking-[1px] border-b border-[rgba(255,119,0,0.08)] pb-0.5 mb-0.5 truncate">{label}</div>
    <div className="font-[var(--font-orbitron)] text-[12px] font-black truncate" style={{ color }}>{value}</div>
    {sub && <div className="text-[7px] text-[rgba(255,119,0,0.4)] truncate">{sub}</div>}
  </div>
)

// ── Mini bar chart ────────────────────────────────────────────────────────────
const MiniBarChart = ({ label, bars, color }: { label: string; bars: number[]; color: string }) => (
  <div className="flex-1 bg-[rgba(10,1,0,0.8)] border border-[rgba(255,119,0,0.15)] rounded-sm px-2 py-1 flex flex-col min-w-0">
    <div className="font-[var(--font-orbitron)] text-[7px] text-[rgba(255,119,0,0.5)] tracking-[1px] border-b border-[rgba(255,119,0,0.08)] pb-0.5 mb-0.5">{label}</div>
    <div className="flex items-end gap-[1px] flex-1">
      {bars.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-[1px] transition-all duration-300"
          style={{ height: `${Math.max(4, Math.abs(v))}%`, backgroundColor: v >= 0 ? color : '#ff2244' }} />
      ))}
    </div>
  </div>
)

// ══════════════════════════════════════════════════════════════════════════════
// TAB-SPECIFIC BOTTOM BARS
// ══════════════════════════════════════════════════════════════════════════════

// ── Tab 0: Overview ───────────────────────────────────────────────────────────
function OverviewBar() {
  const [metrics, setMetrics] = useState({ spx: 5987.3, dxy: 104.2, vix: 18.4, gold: 2350.5, btc: 97200, oil: 82.3 })
  const tapeAssets = ['SPX', 'NDX', 'DXY', 'GOLD', 'BTC', 'OIL', 'EUR/USD', 'BIST100', 'NIKKEI', 'DAX', 'FTSE']

  useEffect(() => {
    const iv = setInterval(() => {
      setMetrics(p => ({
        spx: p.spx + (Math.random() - 0.5) * 3,
        dxy: p.dxy + (Math.random() - 0.5) * 0.05,
        vix: Math.max(10, p.vix + (Math.random() - 0.5) * 0.2),
        gold: p.gold + (Math.random() - 0.5) * 2,
        btc: p.btc + (Math.random() - 0.5) * 100,
        oil: p.oil + (Math.random() - 0.5) * 0.3,
      }))
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  const tape = tapeAssets.map(a => `${a} | ${(1000 + Math.random() * 9000).toFixed(2)} | ${(Math.random() - 0.5) > 0 ? '+' : '-'}${(Math.random() * 2).toFixed(2)}%`)

  return (
    <>
      <TickerTape items={tape} label="GLOBAL MARKETS" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="S&P 500" value={metrics.spx.toFixed(1)} color="#00ff9d" />
        <MiniCard label="DXY INDEX" value={metrics.dxy.toFixed(2)} color="#ffcc00" />
        <MiniCard label="VIX" value={metrics.vix.toFixed(2)} sub={metrics.vix > 25 ? 'HIGH VOL' : 'STABLE'} color={metrics.vix > 25 ? '#ff2244' : '#00ff9d'} />
        <MiniCard label="GOLD/oz" value={`$${metrics.gold.toFixed(0)}`} color="#ffcc00" />
        <MiniCard label="BTC/USD" value={`$${metrics.btc.toLocaleString()}`} color="#ff7700" />
        <MiniCard label="OIL (WTI)" value={`$${metrics.oil.toFixed(2)}`} color="#ff7700" />
        <MiniBarChart label="GLOBAL VOL" bars={Array.from({ length: 12 }, () => (Math.random() - 0.3) * 100)} color="#ff7700" />
      </div>
    </>
  )
}

// ── Tab 1: Portfolio ──────────────────────────────────────────────────────────
function PortfolioBar() {
  const [pnl, setPnl] = useState({ total: 58296, today: 1243, week: -892, month: 8421 })
  const [alloc, setAlloc] = useState([62, 22, 10, 6])
  useEffect(() => {
    const iv = setInterval(() => {
      setPnl(p => ({ total: p.total + (Math.random() - 0.48) * 50, today: p.today + (Math.random() - 0.5) * 10, week: p.week + (Math.random() - 0.5) * 5, month: p.month + (Math.random() - 0.48) * 20 }))
    }, 700)
    return () => clearInterval(iv)
  }, [])
  const tape = ['AAPL +1.2%', 'MSFT +0.8%', 'NVDA +3.4%', 'BTC +2.1%', 'ETH -0.5%', 'THYAO +1.9%', 'GARAN +0.4%', 'GOLD +0.3%']
  return (
    <>
      <TickerTape items={tape} label="PORTFOLIO FEED" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="TOTAL PnL" value={`+$${pnl.total.toFixed(0)}`} color="#00ff9d" />
        <MiniCard label="TODAY" value={`${pnl.today >= 0 ? '+' : ''}$${pnl.today.toFixed(0)}`} color={pnl.today >= 0 ? '#00ff9d' : '#ff2244'} />
        <MiniCard label="THIS WEEK" value={`${pnl.week >= 0 ? '+' : ''}$${pnl.week.toFixed(0)}`} color={pnl.week >= 0 ? '#00ff9d' : '#ff2244'} />
        <MiniCard label="THIS MONTH" value={`+$${pnl.month.toFixed(0)}`} color="#00ff9d" />
        <MiniCard label="CRYPTO" value={`${alloc[0]}%`} sub="of portfolio" color="#ff7700" />
        <MiniCard label="EQUITIES" value={`${alloc[1]}%`} sub="of portfolio" color="#ffcc00" />
        <MiniBarChart label="PnL HISTORY" bars={Array.from({ length: 12 }, () => (Math.random() - 0.4) * 100)} color="#00ff9d" />
      </div>
    </>
  )
}

// ── Tab 2: FinTerm ────────────────────────────────────────────────────────────
function FinTermBar() {
  const [rates, setRates] = useState({ usdtry: 34.25, eurtry: 37.10, gbptry: 43.20, tcmb: 50.0, cpi: 68.5, repo: 50.0 })
  useEffect(() => {
    const iv = setInterval(() => {
      setRates(p => ({
        ...p,
        usdtry: p.usdtry + (Math.random() - 0.5) * 0.03,
        eurtry: p.eurtry + (Math.random() - 0.5) * 0.04,
        gbptry: p.gbptry + (Math.random() - 0.5) * 0.05,
      }))
    }, 1200)
    return () => clearInterval(iv)
  }, [])
  const tape = ['USD/TRY', 'EUR/TRY', 'GBP/TRY', 'GOLD/TRY', 'XBANK', 'CPI TR', 'TCMB FAİZ', 'TR BONO 2Y', 'EUROBOND 2030'].map(a => `${a} | CANLI`)
  return (
    <>
      <TickerTape items={tape} label="FİNANSAL GÖSTERGELER" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="USD/TRY" value={`₺${rates.usdtry.toFixed(4)}`} color="#ffcc00" />
        <MiniCard label="EUR/TRY" value={`₺${rates.eurtry.toFixed(4)}`} color="#ffcc00" />
        <MiniCard label="GBP/TRY" value={`₺${rates.gbptry.toFixed(4)}`} color="#ffcc00" />
        <MiniCard label="TCMB FAİZ" value={`%${rates.tcmb.toFixed(2)}`} color="#ff00aa" />
        <MiniCard label="ENFLASYON" value={`%${rates.cpi.toFixed(1)}`} sub="Yıllık CPI" color="#ff2244" />
        <MiniCard label="REPO (O/N)" value={`%${rates.repo.toFixed(2)}`} color="#ff7700" />
        <MiniBarChart label="DÖVİZ TREND" bars={Array.from({ length: 12 }, () => (Math.random() - 0.4) * 100)} color="#ffcc00" />
      </div>
    </>
  )
}

// ── Tab 3: Crypto HFT ─────────────────────────────────────────────────────────
function CryptoHFTBar() {
  const [btcPrice, setBtcPrice] = useState(97200)
  const [ethPrice, setEthPrice] = useState(3250)
  const [funding, setFunding] = useState(0.0108)
  const [liq, setLiq] = useState({ long: 12.4, short: 8.7 })
  const [oi, setOi] = useState(18.4)
  const [volBars, setVolBars] = useState<number[]>(Array.from({ length: 12 }, () => 30 + Math.random() * 70))

  useEffect(() => {
    // Real Binance WebSocket for BTC price
    let ws: WebSocket | null = null
    try {
      ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade')
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data)
        if (d.p) setBtcPrice(parseFloat(d.p))
      }
    } catch {}

    const iv = setInterval(() => {
      setEthPrice(p => p + (Math.random() - 0.5) * 5)
      setFunding(0.008 + Math.random() * 0.008)
      setLiq({ long: 8 + Math.random() * 10, short: 5 + Math.random() * 8 })
      setOi(p => p + (Math.random() - 0.5) * 0.2)
      setVolBars(Array.from({ length: 12 }, () => 30 + Math.random() * 70))
    }, 500)
    return () => { clearInterval(iv); ws?.close() }
  }, [])

  const tape = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'DOGE/USDT', 'AVAX/USDT', 'LINK/USDT'].map(a => `${a} | ${(Math.random() - 0.5 > 0 ? '+' : '-')}${(Math.random() * 3).toFixed(2)}%`)
  return (
    <>
      <TickerTape items={tape} label="CRYPTO LIVE FEED" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="BTC/USDT" value={`$${btcPrice.toLocaleString()}`} color="#ff7700" sub="BINANCE LIVE" />
        <MiniCard label="ETH/USDT" value={`$${ethPrice.toFixed(1)}`} color="#ff7700" />
        <MiniCard label="FUNDING (8H)" value={`${funding.toFixed(4)}%`} color={funding > 0.01 ? '#00ff9d' : '#ff2244'} sub="BTC Perp" />
        <MiniCard label="OPEN INTEREST" value={`$${oi.toFixed(1)}B`} color="#ffcc00" />
        <MiniCard label="LIQ LONG" value={`$${liq.long.toFixed(1)}M`} color="#ff2244" />
        <MiniCard label="LIQ SHORT" value={`$${liq.short.toFixed(1)}M`} color="#00ff9d" />
        <MiniBarChart label="VOLUME" bars={volBars} color="#ff7700" />
      </div>
    </>
  )
}

// ── Tab 4: US Markets ─────────────────────────────────────────────────────────
function USMarketsBar() {
  const [idx, setIdx] = useState({ spx: 5987.3, ndx: 21234.5, dji: 43910.8, rut: 2285.4 })
  const [vix, setVix] = useState(18.4)
  const [dxy, setDxy] = useState(104.2)
  const [volBars, setVolBars] = useState<number[]>(Array.from({ length: 12 }, () => 30 + Math.random() * 70))

  useEffect(() => {
    const iv = setInterval(() => {
      setIdx(p => ({ spx: p.spx + (Math.random() - 0.48) * 3, ndx: p.ndx + (Math.random() - 0.48) * 8, dji: p.dji + (Math.random() - 0.48) * 15, rut: p.rut + (Math.random() - 0.48) * 2 }))
      setVix(p => Math.max(10, p + (Math.random() - 0.5) * 0.15))
      setDxy(p => p + (Math.random() - 0.5) * 0.04)
      setVolBars(Array.from({ length: 12 }, () => 30 + Math.random() * 70))
    }, 800)
    return () => clearInterval(iv)
  }, [])

  const tape = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'JPM', 'SPY', 'QQQ'].map(a => `${a} | $${(100 + Math.random() * 400).toFixed(2)} | ${(Math.random() - 0.4 > 0 ? '+' : '-')}${(Math.random() * 2.5).toFixed(2)}%`)
  return (
    <>
      <TickerTape items={tape} label="US MARKETS LIVE" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="S&P 500" value={idx.spx.toFixed(1)} color="#00ff9d" />
        <MiniCard label="NASDAQ" value={idx.ndx.toFixed(1)} color="#00ff9d" />
        <MiniCard label="DOW JONES" value={idx.dji.toFixed(0)} color="#ffcc00" />
        <MiniCard label="RUSSELL 2K" value={idx.rut.toFixed(1)} color="#ffcc00" />
        <MiniCard label="VIX" value={vix.toFixed(2)} sub={vix > 25 ? 'FEAR' : 'STABLE'} color={vix > 25 ? '#ff2244' : '#00ff9d'} />
        <MiniCard label="DXY" value={dxy.toFixed(3)} color="#ff7700" />
        <MiniBarChart label="NYSE VOLUME" bars={volBars} color="#00ff9d" />
      </div>
    </>
  )
}

// ── Tab 5: BIST ───────────────────────────────────────────────────────────────
function BISTBar() {
  const [idx, setIdx] = useState({ bist100: 10234, bist30: 11456, bist50: 10890 })
  const [usdtry, setUsdtry] = useState(34.25)
  const [xbank, setXbank] = useState(1.24)
  const [viop, setViop] = useState(24.8)
  const [volBars, setVolBars] = useState<number[]>(Array.from({ length: 12 }, () => 30 + Math.random() * 70))

  useEffect(() => {
    const iv = setInterval(() => {
      setIdx(p => ({ bist100: p.bist100 + (Math.random() - 0.48) * 12, bist30: p.bist30 + (Math.random() - 0.48) * 15, bist50: p.bist50 + (Math.random() - 0.48) * 10 }))
      setUsdtry(p => Math.max(30, p + (Math.random() - 0.5) * 0.03))
      setXbank(p => p + (Math.random() - 0.5) * 0.1)
      setViop(p => Math.max(15, Math.min(45, p + (Math.random() - 0.5) * 0.3)))
      setVolBars(Array.from({ length: 12 }, () => 30 + Math.random() * 70))
    }, 900)
    return () => clearInterval(iv)
  }, [])

  const tape = ['THYAO', 'GARAN', 'AKBNK', 'EREGL', 'TUPRS', 'SAHOL', 'KCHOL', 'ASELS'].map(a => `${a} | ₺${(10 + Math.random() * 300).toFixed(2)} | ${(Math.random() - 0.4 > 0 ? '+' : '-')}${(Math.random() * 3).toFixed(2)}%`)
  return (
    <>
      <TickerTape items={tape} label="BIST CANLI" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="BIST 100" value={idx.bist100.toFixed(0)} color="#00ff9d" />
        <MiniCard label="BIST 30" value={idx.bist30.toFixed(0)} color="#00ff9d" />
        <MiniCard label="BIST 50" value={idx.bist50.toFixed(0)} color="#ffcc00" />
        <MiniCard label="USD/TRY" value={`₺${usdtry.toFixed(4)}`} color="#ffcc00" />
        <MiniCard label="XBANK" value={`${xbank > 0 ? '+' : ''}${xbank.toFixed(2)}%`} color={xbank >= 0 ? '#00ff9d' : '#ff2244'} />
        <MiniCard label="VİOP VOL" value={viop.toFixed(1)} sub={viop > 30 ? 'YÜKSEK' : 'NORMAL'} color={viop > 30 ? '#ff2244' : '#ffcc00'} />
        <MiniBarChart label="BIST HACİM" bars={volBars} color="#00ff9d" />
      </div>
    </>
  )
}

// ── Tab 6: Prediction Markets ─────────────────────────────────────────────────
function PredictionBar() {
  const [vol, setVol] = useState({ daily: 4.2, weekly: 28.5 })
  const [top, setTop] = useState([{ name: 'US Election 2026', prob: 54 }, { name: 'Fed Rate Cut Q2', prob: 68 }, { name: 'BTC >100K', prob: 42 }])
  useEffect(() => {
    const iv = setInterval(() => {
      setVol(p => ({ daily: p.daily + (Math.random() - 0.5) * 0.1, weekly: p.weekly + (Math.random() - 0.5) * 0.3 }))
      setTop(p => p.map(m => ({ ...m, prob: Math.max(5, Math.min(95, m.prob + (Math.random() - 0.5) * 0.5)) })))
    }, 1500)
    return () => clearInterval(iv)
  }, [])
  const tape = ['Polymarket', 'Kalshi', 'Metaculus', 'PredictIt'].map(a => `${a} | ${(1 + Math.random() * 5).toFixed(1)}M Vol`)
  return (
    <>
      <TickerTape items={tape} label="PREDICTION MARKETS" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="DAILY VOL" value={`$${vol.daily.toFixed(1)}M`} color="#ff00aa" />
        <MiniCard label="WEEKLY VOL" value={`$${vol.weekly.toFixed(1)}M`} color="#ff00aa" />
        {top.map(m => (
          <MiniCard key={m.name} label={m.name} value={`${m.prob.toFixed(1)}%`} color={m.prob > 50 ? '#00ff9d' : '#ff7700'} />
        ))}
        <MiniBarChart label="MARKET ACTIVITY" bars={Array.from({ length: 12 }, () => 20 + Math.random() * 80)} color="#ff00aa" />
      </div>
    </>
  )
}

// ── Tab 7: Jarvis OS ──────────────────────────────────────────────────────────
function JarvisBar() {
  const [cpu, setCpu] = useState(34)
  const [mem, setMem] = useState(62)
  const [bots, setBots] = useState(7)
  const [signals, setSignals] = useState(142)
  useEffect(() => {
    const iv = setInterval(() => {
      setCpu(p => Math.max(5, Math.min(95, p + (Math.random() - 0.5) * 5)))
      setMem(p => Math.max(20, Math.min(90, p + (Math.random() - 0.5) * 2)))
      setSignals(p => p + Math.floor(Math.random() * 3))
    }, 800)
    return () => clearInterval(iv)
  }, [])
  const tape = ['JARVIS ONLINE', 'AI MODEL ACTIVE', 'MARKET SCANNER RUNNING', 'SIGNAL ENGINE ●', 'RISK MONITOR OK', 'DATA PIPELINE STABLE']
  return (
    <>
      <TickerTape items={tape} label="JARVIS SYSTEM" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="CPU USAGE" value={`${cpu.toFixed(0)}%`} color={cpu > 70 ? '#ff2244' : '#00ff9d'} />
        <MiniCard label="MEMORY" value={`${mem.toFixed(0)}%`} color={mem > 75 ? '#ffcc00' : '#00ff9d'} />
        <MiniCard label="ACTIVE BOTS" value={`${bots}`} color="#ff7700" />
        <MiniCard label="SIGNALS" value={`${signals}`} sub="total today" color="#ff00aa" />
        <MiniCard label="UPTIME" value="99.8%" color="#00ff9d" />
        <MiniCard label="LATENCY" value="12ms" color="#00ff9d" />
        <MiniBarChart label="CPU HISTORY" bars={Array.from({ length: 12 }, () => 20 + Math.random() * 80)} color="#00ff9d" />
      </div>
    </>
  )
}

// ── Ticker Tape ───────────────────────────────────────────────────────────────
function TickerTape({ items, label }: { items: string[]; label: string }) {
  return (
    <div className="flex items-center py-1 px-2 overflow-hidden h-[22px] shrink-0">
      <div className="text-[8px] text-[rgba(255,119,0,0.4)] bg-[rgba(10,1,0,0.9)] border-r border-[rgba(255,119,0,0.15)] px-2 py-0.5 font-[var(--font-orbitron)] tracking-[1px] shrink-0 whitespace-nowrap">
        {label}
      </div>
      <div className="overflow-hidden flex-1 relative">
        <div className="flex gap-0 animate-[tickerScroll_40s_linear_infinite]" style={{ width: 'max-content' }}>
          {[...items, ...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 border-r border-[rgba(255,119,0,0.1)] text-[9px] whitespace-nowrap text-[rgba(255,238,221,0.7)]">
              <span className="text-[#ff7700]">◆</span> {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main BottomBar ────────────────────────────────────────────────────────────
export function BottomBar({ activeTab = 0 }: BottomBarProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 0: return <OverviewBar />
      case 1: return <PortfolioBar />
      case 2: return <FinTermBar />
      case 3: return <CryptoHFTBar />
      case 4: return <USMarketsBar />
      case 5: return <BISTBar />
      case 6: return <PredictionBar />
      case 7: return <JarvisBar />
      default: return <OverviewBar />
    }
  }

  return (
    <footer className="bg-[rgba(10,3,0,0.97)] border-t border-[rgba(255,119,0,0.4)] overflow-hidden flex flex-col py-1 h-[90px]">
      {renderContent()}
    </footer>
  )
}
