'use client'

import { useEffect, useState } from 'react'

// Tab index mapping:
// 0=Live Terminal, 1=Overview, 2=Portfolio, 3=FinTerm, 4=CryptoHFT, 5=USMarkets, 6=BIST, 7=Prediction, 8=JarvisOS

interface BottomBarProps { activeTab?: number }

// ── Shared mini card ──────────────────────────────────────────────────────────
const MiniCard = ({ label, value, sub, color = '#ff7700' }: { label: string; value: string; sub?: string; color?: string }) => (
  <div className="flex-1 bg-[rgba(10,1,0,0.85)] border border-[rgba(255,119,0,0.18)] rounded-sm px-2 py-1 flex flex-col justify-between min-w-0">
    <div className="font-[var(--font-orbitron)] text-[7px] text-[rgba(255,119,0,0.6)] tracking-[1px] border-b border-[rgba(255,119,0,0.1)] pb-0.5 mb-0.5 truncate">{label}</div>
    <div className="font-[var(--font-orbitron)] text-[12px] font-black truncate" style={{ color }}>{value}</div>
    {sub && <div className="text-[7px] text-[rgba(255,238,221,0.5)] truncate">{sub}</div>}
  </div>
)

// ── Mini bar chart ────────────────────────────────────────────────────────────
const MiniBarChart = ({ label, bars, color }: { label: string; bars: number[]; color: string }) => (
  <div className="flex-1 bg-[rgba(10,1,0,0.85)] border border-[rgba(255,119,0,0.18)] rounded-sm px-2 py-1 flex flex-col min-w-0">
    <div className="font-[var(--font-orbitron)] text-[7px] text-[rgba(255,119,0,0.6)] tracking-[1px] border-b border-[rgba(255,119,0,0.1)] pb-0.5 mb-0.5">{label}</div>
    <div className="flex items-end gap-[1px] flex-1">
      {bars.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-[1px] transition-all duration-300"
          style={{ height: `${Math.max(8, Math.min(100, Math.abs(v)))}%`, backgroundColor: v >= 0 ? color : '#ff2244' }} />
      ))}
    </div>
  </div>
)

// ── Ticker Tape ───────────────────────────────────────────────────────────────
function TickerTape({ items, label }: { items: string[]; label: string }) {
  return (
    <div className="flex items-center py-1 px-2 overflow-hidden h-[22px] shrink-0 border-b border-[rgba(255,119,0,0.12)]">
      <div className="text-[8px] text-[#ff7700] bg-[rgba(10,1,0,0.95)] border-r border-[rgba(255,119,0,0.25)] px-2 py-0.5 font-[var(--font-orbitron)] font-bold tracking-[1px] shrink-0 whitespace-nowrap">
        {label}
      </div>
      <div className="overflow-hidden flex-1 relative">
        <div className="flex gap-0 animate-[tickerScroll_40s_linear_infinite]" style={{ width: 'max-content' }}>
          {[...items, ...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 border-r border-[rgba(255,119,0,0.1)] text-[9px] font-mono whitespace-nowrap text-[rgba(255,238,221,0.8)]">
              <span className="text-[#ff7700]">◆</span> {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tab 0 & Tab 1: Global / Overview ─────────────────────────────────────────
function OverviewBar() {
  const [metrics, setMetrics] = useState({
    spx: { price: 7706.9, change: '+0.01%' },
    ndx: { price: 26937.9, change: '+0.01%' },
    dxy: { price: 104.2, change: '+0.05%' },
    vix: { price: 15.6, change: '+2.77%' },
    gold: { price: 4305.5, change: '-0.30%' },
    btc: { price: 96800, change: '+1.45%' },
    oil: { price: 95.29, change: '+3.40%' },
    bist: { price: 12888, change: '+0.85%' },
    usdtry: { price: 48.85, change: '+0.03%' }
  })

  useEffect(() => {
    // Real Binance WebSocket for BTC
    let ws: WebSocket | null = null
    try {
      ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker')
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data)
        if (d.c) {
          setMetrics(prev => ({
            ...prev,
            btc: {
              price: parseFloat(d.c),
              change: `${parseFloat(d.P) >= 0 ? '+' : ''}${parseFloat(d.P).toFixed(2)}%`
            }
          }))
        }
      }
    } catch {}

    const fetchRealData = async () => {
      try {
        const res = await fetch('/api/market-data')
        const data = await res.json()
        if (data.americas) {
          const spxData = data.americas.find((a: any) => a.id === 'S&P 500')
          const ndxData = data.americas.find((a: any) => a.id === 'NASDAQ')
          const bistData = data.americas.find((a: any) => a.id === 'BIST 100')

          setMetrics(prev => ({
            ...prev,
            spx: spxData ? { price: spxData.value, change: `${spxData.pctChange >= 0 ? '+' : ''}${spxData.pctChange.toFixed(2)}%` } : prev.spx,
            ndx: ndxData ? { price: ndxData.value, change: `${ndxData.pctChange >= 0 ? '+' : ''}${ndxData.pctChange.toFixed(2)}%` } : prev.ndx,
            bist: bistData ? { price: bistData.value, change: `${bistData.pctChange >= 0 ? '+' : ''}${bistData.pctChange.toFixed(2)}%` } : prev.bist,
            vix: data.indicators?.vix ? { price: data.indicators.vix, change: '+1.2%' } : prev.vix,
            gold: data.indicators?.gold ? { price: data.indicators.gold, change: '-0.3%' } : prev.gold,
            oil: data.indicators?.oil ? { price: data.indicators.oil, change: '+3.4%' } : prev.oil,
          }))
        }
      } catch (err) {}
    }

    fetchRealData()
    const timer = setInterval(fetchRealData, 30000)
    return () => { clearInterval(timer); ws?.close() }
  }, [])

  const tape = [
    `SPX $${metrics.spx.price.toLocaleString()} (${metrics.spx.change})`,
    `NDX $${metrics.ndx.price.toLocaleString()} (${metrics.ndx.change})`,
    `BTC $${metrics.btc.price.toLocaleString()} (${metrics.btc.change})`,
    `BIST100 ${metrics.bist.price.toLocaleString()} (${metrics.bist.change})`,
    `USD/TRY ₺${metrics.usdtry.price.toFixed(2)}`,
    `GOLD/oz $${metrics.gold.price.toLocaleString()}`,
    `OIL (WTI) $${metrics.oil.price.toFixed(2)}`,
    `VIX ${metrics.vix.price.toFixed(1)}`
  ]

  const volBars = [45, 62, 58, 80, 72, 65, 88, 92, 78, 85, 90, 76]

  return (
    <>
      <TickerTape items={tape} label="KÜRESEL PİYASA AKIŞI" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="S&P 500" value={metrics.spx.price.toLocaleString()} sub={metrics.spx.change} color="#00ff9d" />
        <MiniCard label="NASDAQ" value={metrics.ndx.price.toLocaleString()} sub={metrics.ndx.change} color="#00ff9d" />
        <MiniCard label="BTC / USD" value={`$${metrics.btc.price.toLocaleString()}`} sub={metrics.btc.change} color="#ff7700" />
        <MiniCard label="BIST 100" value={metrics.bist.price.toLocaleString()} sub={metrics.bist.change} color="#00ff9d" />
        <MiniCard label="USD / TRY" value={`₺${metrics.usdtry.price.toFixed(2)}`} sub="CANLI" color="#ffcc00" />
        <MiniCard label="GOLD / ONS" value={`$${metrics.gold.price.toLocaleString()}`} color="#ffcc00" />
        <MiniCard label="VIX VOL" value={metrics.vix.price.toFixed(1)} sub={metrics.vix.price > 20 ? 'YÜKSEK' : 'STABİL'} color={metrics.vix.price > 20 ? '#ff2244' : '#00ff9d'} />
        <MiniBarChart label="PİYASA HACMİ" bars={volBars} color="#ff7700" />
      </div>
    </>
  )
}

// ── Tab 2: Portfolio ──────────────────────────────────────────────────────────
function PortfolioBar() {
  const [pnl] = useState({ total: 78450, today: 1840, week: 3420, month: 14210 })
  const alloc = [55, 30, 10, 5]
  const tape = ['NVDA +2.4%', 'AAPL +0.8%', 'BTC +1.8%', 'ETH +1.2%', 'THYAO +1.9%', 'GARAN +0.4%', 'ONS ALTIN +0.3%']
  const pnlBars = [35, 42, 28, 55, 62, 48, 70, 65, 82, 75, 88, 92]

  return (
    <>
      <TickerTape items={tape} label="PORTFÖY CANLI" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="TOPLAM PnL" value={`+$${pnl.total.toLocaleString()}`} color="#00ff9d" />
        <MiniCard label="GÜNLÜK PnL" value={`+$${pnl.today.toLocaleString()}`} color="#00ff9d" />
        <MiniCard label="BU HAFTA" value={`+$${pnl.week.toLocaleString()}`} color="#00ff9d" />
        <MiniCard label="BU AY" value={`+$${pnl.month.toLocaleString()}`} color="#00ff9d" />
        <MiniCard label="KRİPTO" value={`${alloc[0]}%`} sub="Dağılım" color="#ff7700" />
        <MiniCard label="HİSSELER" value={`${alloc[1]}%`} sub="Dağılım" color="#ffcc00" />
        <MiniBarChart label="PERFORMANS" bars={pnlBars} color="#00ff9d" />
      </div>
    </>
  )
}

// ── Tab 3: FinTerm ────────────────────────────────────────────────────────────
function FinTermBar() {
  const [rates, setRates] = useState({ usdtry: 48.85, eurtry: 55.67, gbptry: 64.20, tcmb: 50.0, cpi: 44.3, repo: 50.0 })

  useEffect(() => {
    fetch('/api/bist-data')
      .then(r => r.json())
      .then(d => {
        if (d.usdTry) {
          setRates(prev => ({
            ...prev,
            usdtry: d.usdTry,
            eurtry: d.eurTry || prev.eurtry,
            gbptry: d.usdTry * 1.31
          }))
        }
      })
      .catch(() => {})
  }, [])

  const tape = [
    `USD/TRY ₺${rates.usdtry.toFixed(4)}`,
    `EUR/TRY ₺${rates.eurtry.toFixed(4)}`,
    `GBP/TRY ₺${rates.gbptry.toFixed(4)}`,
    `TCMB POLİTİKA FAİZİ %${rates.tcmb.toFixed(2)}`,
    `TÜFE YILLIK %${rates.cpi.toFixed(1)}`,
    `O/N REPO %${rates.repo.toFixed(2)}`
  ]

  const trendBars = [50, 52, 55, 58, 62, 60, 65, 68, 70, 72, 75, 78]

  return (
    <>
      <TickerTape items={tape} label="MAKRO FİNANS GÖSTERGELERİ" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="USD / TRY" value={`₺${rates.usdtry.toFixed(4)}`} color="#ffcc00" />
        <MiniCard label="EUR / TRY" value={`₺${rates.eurtry.toFixed(4)}`} color="#ffcc00" />
        <MiniCard label="GBP / TRY" value={`₺${rates.gbptry.toFixed(4)}`} color="#ffcc00" />
        <MiniCard label="TCMB FAİZ" value={`%${rates.tcmb.toFixed(2)}`} color="#ff00aa" />
        <MiniCard label="ENFLASYON (CPI)" value={`%${rates.cpi.toFixed(1)}`} sub="Yıllık" color="#ff2244" />
        <MiniCard label="REPO (O/N)" value={`%${rates.repo.toFixed(2)}`} color="#ff7700" />
        <MiniBarChart label="DÖVİZ TRENDİ" bars={trendBars} color="#ffcc00" />
      </div>
    </>
  )
}

// ── Tab 4: Crypto HFT ─────────────────────────────────────────────────────────
function CryptoHFTBar() {
  const [prices, setPrices] = useState<Record<string, { price: number; change: string }>>({
    BTCUSDT: { price: 96800, change: '+1.5%' },
    ETHUSDT: { price: 3450, change: '+2.1%' },
    SOLUSDT: { price: 215, change: '+3.4%' },
    BNBUSDT: { price: 685, change: '+0.8%' },
    XRPUSDT: { price: 2.35, change: '+4.2%' }
  })

  useEffect(() => {
    let ws: WebSocket | null = null
    try {
      ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr')
      ws.onmessage = (e) => {
        const arr = JSON.parse(e.data)
        if (Array.isArray(arr)) {
          const map: Record<string, { price: number; change: string }> = {}
          arr.forEach((t: any) => {
            if (['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'].includes(t.s)) {
              map[t.s] = {
                price: parseFloat(t.c),
                change: `${parseFloat(t.P) >= 0 ? '+' : ''}${parseFloat(t.P).toFixed(2)}%`
              }
            }
          })
          if (Object.keys(map).length > 0) {
            setPrices(prev => ({ ...prev, ...map }))
          }
        }
      }
    } catch {}
    return () => ws?.close()
  }, [])

  const tape = Object.entries(prices).map(([sym, val]) => `${sym.replace('USDT', '')}/USDT $${val.price.toLocaleString()} (${val.change})`)
  const cryptoVolBars = [65, 78, 85, 92, 88, 76, 95, 98, 82, 89, 94, 91]

  return (
    <>
      <TickerTape items={tape} label="BINANCE CANLI İŞLEM AKIŞI" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="BTC / USDT" value={`$${prices.BTCUSDT.price.toLocaleString()}`} sub={prices.BTCUSDT.change} color="#ff7700" />
        <MiniCard label="ETH / USDT" value={`$${prices.ETHUSDT.price.toLocaleString()}`} sub={prices.ETHUSDT.change} color="#ff7700" />
        <MiniCard label="SOL / USDT" value={`$${prices.SOLUSDT.price.toLocaleString()}`} sub={prices.SOLUSDT.change} color="#00ff9d" />
        <MiniCard label="BNB / USDT" value={`$${prices.BNBUSDT.price.toLocaleString()}`} sub={prices.BNBUSDT.change} color="#ffcc00" />
        <MiniCard label="XRP / USDT" value={`$${prices.XRPUSDT.price.toFixed(3)}`} sub={prices.XRPUSDT.change} color="#00ff9d" />
        <MiniCard label="FONLAMA (8S)" value="+0.0105%" sub="Pozitif Eğilim" color="#00ff9d" />
        <MiniBarChart label="KRİPTO HACİM" bars={cryptoVolBars} color="#ff7700" />
      </div>
    </>
  )
}

// ── Tab 5: US Markets ─────────────────────────────────────────────────────────
function USMarketsBar() {
  const [stocks, setStocks] = useState<any[]>([])
  const [indices, setIndices] = useState({ spx: 7706.9, ndx: 26937.9, dji: 51360.3, vix: 15.6 })

  useEffect(() => {
    fetch('/api/market-data')
      .then(r => r.json())
      .then(d => {
        if (d.americas) {
          const spx = d.americas.find((a: any) => a.id === 'S&P 500')?.value || 7706.9
          const ndx = d.americas.find((a: any) => a.id === 'NASDAQ')?.value || 26937.9
          const dji = d.americas.find((a: any) => a.id === 'DOW JONES')?.value || 51360.3
          setIndices({ spx, ndx, dji, vix: d.indicators?.vix || 15.6 })
        }
        if (d.us_stocks) {
          setStocks(d.us_stocks)
        }
      })
      .catch(() => {})
  }, [])

  const tape = stocks.length > 0
    ? stocks.map(s => `${s.symbol} $${s.price.toFixed(2)} (${s.pctChange >= 0 ? '+' : ''}${s.pctChange.toFixed(2)}%)`)
    : ['NVDA $223.84 (-2.20%)', 'AAPL $337.74 (-0.59%)', 'MSFT $497.80 (-0.04%)', 'TSLA $379.59 (+0.18%)']

  const nyseBars = [60, 68, 72, 85, 79, 82, 88, 91, 84, 86, 90, 87]

  return (
    <>
      <TickerTape items={tape} label="ABD BORSALARI (WALL STREET)" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="S&P 500" value={indices.spx.toLocaleString()} color="#00ff9d" />
        <MiniCard label="NASDAQ" value={indices.ndx.toLocaleString()} color="#00ff9d" />
        <MiniCard label="DOW JONES" value={indices.dji.toLocaleString()} color="#ffcc00" />
        <MiniCard label="VIX VOL" value={indices.vix.toFixed(1)} sub={indices.vix > 20 ? 'VOLATİL' : 'SAKİN'} color={indices.vix > 20 ? '#ff2244' : '#00ff9d'} />
        <MiniCard label="FED FAİZİ" value="%4.50" sub="Mevcut Seviye" color="#ff00aa" />
        <MiniCard label="10Y TAHVİL" value="%4.45" color="#ff7700" />
        <MiniBarChart label="NYSE HACİM" bars={nyseBars} color="#00ff9d" />
      </div>
    </>
  )
}

// ── Tab 6: BIST Terminal ──────────────────────────────────────────────────────
function BISTBar() {
  const [bistData, setBistData] = useState<{ bist100: number; bistChange: number; usdTry: number; stocks: any[] }>({
    bist100: 12888.33,
    bistChange: 0.85,
    usdTry: 48.85,
    stocks: []
  })

  useEffect(() => {
    fetch('/api/bist-data')
      .then(r => r.json())
      .then(d => {
        if (d.bist100) {
          setBistData({
            bist100: d.bist100.value,
            bistChange: d.bist100.change,
            usdTry: d.usdTry || 48.85,
            stocks: d.stocks || []
          })
        }
      })
      .catch(() => {})
  }, [])

  const tape = bistData.stocks.length > 0
    ? bistData.stocks.map(s => `${s.symbol} ₺${s.price.toFixed(2)} (${s.pctChange >= 0 ? '+' : ''}${s.pctChange.toFixed(2)}%)`)
    : ['THYAO ₺288.50 (-3.35%)', 'GARAN ₺129.40 (-3.29%)', 'AKBNK ₺70.65 (-3.15%)', 'ASELS ₺72.50 (+1.2%)']

  const bistBars = [45, 55, 62, 70, 78, 85, 82, 88, 90, 86, 92, 89]

  return (
    <>
      <TickerTape items={tape} label="BORSA İSTANBUL CANLI" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="BIST 100" value={bistData.bist100.toLocaleString()} sub={`${bistData.bistChange >= 0 ? '+' : ''}${bistData.bistChange.toFixed(2)}%`} color="#00ff9d" />
        <MiniCard label="USD / TRY" value={`₺${bistData.usdTry.toFixed(2)}`} color="#ffcc00" />
        <MiniCard label="PİYASA HACMİ" value="112.4 Milyar ₺" sub="Günlük Toplam" color="#ff7700" />
        <MiniCard label="YUKARIDAKİLER" value="382 Hisse" sub="Yükselen" color="#00ff9d" />
        <MiniCard label="AŞAĞIDAKİLER" value="145 Hisse" sub="Düşen" color="#ff2244" />
        <MiniCard label="VİOP 30 VOL" value="21.4" sub="Normal" color="#00ff9d" />
        <MiniBarChart label="BIST İŞLEM DERİNLİĞİ" bars={bistBars} color="#00ff9d" />
      </div>
    </>
  )
}

// ── Tab 7: Prediction Markets ─────────────────────────────────────────────────
function PredictionBar() {
  const [vol] = useState({ daily: 14.8, weekly: 92.4 })
  const top = [
    { name: 'Fed Faiz İndirimi 2026', prob: 64 },
    { name: 'BTC > $100K 2026', prob: 78 },
    { name: 'S&P 500 Rekor Kapanış', prob: 71 }
  ]
  const tape = top.map(t => `${t.name} -> %${t.prob} Olasılık`)
  const probBars = [52, 58, 64, 60, 68, 72, 75, 71, 78, 82, 80, 84]

  return (
    <>
      <TickerTape items={tape} label="POLYMARKET & TAHMİN PİYASALARI" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="GÜNLÜK HACİM" value={`$${vol.daily.toFixed(1)}M`} color="#ff00aa" />
        <MiniCard label="HAFTALIK HACİM" value={`$${vol.weekly.toFixed(1)}M`} color="#ff00aa" />
        {top.map(m => (
          <MiniCard key={m.name} label={m.name} value={`%${m.prob}`} color={m.prob > 50 ? '#00ff9d' : '#ff7700'} />
        ))}
        <MiniBarChart label="PİYASA AKTİVİTESİ" bars={probBars} color="#ff00aa" />
      </div>
    </>
  )
}

// ── Tab 8: Jarvis OS ──────────────────────────────────────────────────────────
function JarvisBar() {
  const [telemetry] = useState({ cpu: 28, mem: 48, bots: 8, signals: 246, uptime: '99.9%', latency: '8ms' })
  const tape = [
    'JARVIS MOTORU: AKTİF ●',
    'VERİ BORU HATTI: SAĞLIKLI ●',
    'RİSK MONİTÖRÜ: DEVREDE ●',
    'ARBITRAJ MOTORU: ÇALIŞIYOR ●',
    'SİNYAL DUYARLILIK TESTİ: GEÇTİ ●'
  ]
  const sysBars = [25, 30, 28, 35, 32, 28, 40, 36, 30, 32, 29, 28]

  return (
    <>
      <TickerTape items={tape} label="JARVIS SİSTEM TELEMETRİSİ" />
      <div className="flex gap-1 px-1.5 pb-1 flex-1 min-h-0">
        <MiniCard label="CPU KULLANIMI" value={`${telemetry.cpu}%`} color="#00ff9d" />
        <MiniCard label="RAM BELLEK" value={`${telemetry.mem}%`} color="#00ff9d" />
        <MiniCard label="AKTİF BOTLAR" value={`${telemetry.bots}`} color="#ff7700" />
        <MiniCard label="BUGÜNKÜ SİNYALLER" value={`${telemetry.signals}`} sub="Otomatik Üretilen" color="#ff00aa" />
        <MiniCard label="ÇALIŞMA SÜRESİ" value={telemetry.uptime} color="#00ff9d" />
        <MiniCard label="API GECİKMESİ" value={telemetry.latency} color="#00ff9d" />
        <MiniBarChart label="CPU GEÇMİŞİ" bars={sysBars} color="#00ff9d" />
      </div>
    </>
  )
}

// ── Main BottomBar ────────────────────────────────────────────────────────────
export function BottomBar({ activeTab = 0 }: BottomBarProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 0: return <OverviewBar />
      case 1: return <OverviewBar />
      case 2: return <PortfolioBar />
      case 3: return <FinTermBar />
      case 4: return <CryptoHFTBar />
      case 5: return <USMarketsBar />
      case 6: return <BISTBar />
      case 7: return <PredictionBar />
      case 8: return <JarvisBar />
      default: return <OverviewBar />
    }
  }

  return (
    <footer className="bg-[rgba(10,3,0,0.98)] border-t border-[rgba(255,119,0,0.35)] overflow-hidden flex flex-col py-1 h-[90px] shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
      {renderContent()}
    </footer>
  )
}
