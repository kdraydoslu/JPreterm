'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  TrendingUp,
  Plus,
  Zap,
  Square,
  Columns,
  LayoutGrid,
  Search,
  Check
} from 'lucide-react'

export interface ChartConfig {
  id: string
  symbol: string
  name: string
  interval?: string
}

const POPULAR_SYMBOLS = [
  // Serbest Canlı Varlıklar
  { id: 'tur-etf', symbol: 'AMEX:TUR', name: 'iShares Türkiye BIST ETF', category: 'bist', exchange: 'AMEX', desc: 'Türk Hisseleri Borsa Fonu (Canlı)' },
  { id: 'btcusdt', symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin', category: 'crypto', exchange: 'BINANCE', desc: 'BTC / Tether US' },
  { id: 'ethusdt', symbol: 'BINANCE:ETHUSDT', name: 'Ethereum', category: 'crypto', exchange: 'BINANCE', desc: 'ETH / Tether US' },
  { id: 'solusdt', symbol: 'BINANCE:SOLUSDT', name: 'Solana', category: 'crypto', exchange: 'BINANCE', desc: 'SOL / Tether US' },
  { id: 'xauusd', symbol: 'OANDA:XAUUSD', name: 'Ons Altın', category: 'commodities', exchange: 'OANDA', desc: 'Spot Gold / USD' },
  { id: 'usdtry', symbol: 'FX:USDTRY', name: 'Dolar / TL', category: 'forex', exchange: 'FX', desc: 'USD / Turkish Lira' },
  { id: 'eurtry', symbol: 'FX:EURTRY', name: 'Euro / TL', category: 'forex', exchange: 'FX', desc: 'EUR / Turkish Lira' },
  { id: 'eurusd', symbol: 'FX:EURUSD', name: 'EUR / USD', category: 'forex', exchange: 'FX', desc: 'Euro / US Dollar' },
  { id: 'spx', symbol: 'FOREXCOM:SPXUSD', name: 'S&P 500 Endeksi', category: 'indices', exchange: 'FOREXCOM', desc: 'S&P 500 Spot' },
  { id: 'ndx', symbol: 'FOREXCOM:NSXUSD', name: 'Nasdaq 100 Endeksi', category: 'indices', exchange: 'FOREXCOM', desc: 'US Tech 100 Spot' },
  { id: 'nvda', symbol: 'NASDAQ:NVDA', name: 'Nvidia Corp', category: 'indices', exchange: 'NASDAQ', desc: 'NVIDIA Corporation' },
  { id: 'aapl', symbol: 'NASDAQ:AAPL', name: 'Apple Inc', category: 'indices', exchange: 'NASDAQ', desc: 'Apple Inc.' },
  { id: 'tsla', symbol: 'NASDAQ:TSLA', name: 'Tesla Inc', category: 'indices', exchange: 'NASDAQ', desc: 'Tesla Inc.' },
  // BIST Doğrudan Semboller
  { id: 'bist100_direct', symbol: 'BIST:XU100', name: 'BIST 100 Endeksi', category: 'bist', exchange: 'BIST', desc: 'Borsa İstanbul 100 (TradingView Açılır)' },
  { id: 'thyao_direct', symbol: 'BIST:THYAO', name: 'Türk Hava Yolları', category: 'bist', exchange: 'BIST', desc: 'THY (TradingView Açılır)' },
  { id: 'garan_direct', symbol: 'BIST:GARAN', name: 'Garanti BBVA', category: 'bist', exchange: 'BIST', desc: 'Garanti Bankası (TradingView Açılır)' },
  { id: 'asels_direct', symbol: 'BIST:ASELS', name: 'Aselsan', category: 'bist', exchange: 'BIST', desc: 'Aselsan Elektronik (TradingView Açılır)' }
]

const TIMEFRAMES = [
  { label: '5D', value: '5' },
  { label: '15D', value: '15' },
  { label: '1S', value: '60' },
  { label: '4S', value: '240' },
  { label: 'GÜN', value: 'D' },
  { label: 'HAFTA', value: 'W' }
]

function SingleChart({
  id,
  symbol,
  name,
  interval = 'D',
  canRemove,
  onRemove,
  onSymbolClick,
  onSwitchToSymbol,
  onTimeframeChange
}: {
  id: string
  symbol: string
  name: string
  interval?: string
  canRemove?: boolean
  onRemove?: () => void
  onSymbolClick?: () => void
  onSwitchToSymbol?: (newSym: string, newName: string) => void
  onTimeframeChange?: (newInterval: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isBistDirect = symbol.toUpperCase().startsWith('BIST:')
  const tradingViewUrl = `https://tr.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`

  useEffect(() => {
    if (!containerRef.current) return
    if (isBistDirect) {
      containerRef.current.innerHTML = ''
      return
    }

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: 'Europe/Istanbul',
      theme: 'dark',
      style: '1',
      locale: 'tr',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      backgroundColor: '#050100',
      gridColor: 'rgba(255, 119, 0, 0.08)',
      studies: ['STD;SMA', 'STD;RSI'],
      support_host: 'https://www.tradingview.com'
    })

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    widgetDiv.style.width = '100%'
    widgetDiv.style.height = 'calc(100% - 36px)'

    containerRef.current.appendChild(widgetDiv)
    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, interval, isBistDirect])

  const handleRefresh = () => {
    if (isBistDirect) return
    if (!containerRef.current) return
    const oldContent = containerRef.current.innerHTML
    containerRef.current.innerHTML = ''
    setTimeout(() => {
      if (containerRef.current) containerRef.current.innerHTML = oldContent
    }, 50)
  }

  return (
    <div className="relative flex flex-col h-full w-full bg-[#050100] border border-[rgba(255,119,0,0.25)] rounded-lg overflow-hidden group shadow-lg">
      {/* Header Bar */}
      <div className="h-[36px] bg-[rgba(15,5,1,0.95)] border-b border-[rgba(255,119,0,0.2)] px-2.5 flex items-center justify-between z-10 select-none">
        <div className="flex items-center space-x-2">
          <button
            onClick={onSymbolClick}
            title="Sembol Değiştir"
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[rgba(255,119,0,0.15)] border border-[#ff7700]/50 text-[#ff7700] text-xs font-mono font-bold hover:bg-[#ff7700] hover:text-black transition cursor-pointer"
          >
            <span>{symbol}</span>
            <span className="text-[9px]">▼</span>
          </button>
          <span className="text-xs font-bold text-[#ffeedd] truncate max-w-[140px] hidden sm:inline font-[var(--font-rajdhani)]">
            {name}
          </span>

          {/* Timeframe quick switches */}
          <div className="hidden md:flex items-center space-x-1 bg-black/60 border border-[rgba(255,119,0,0.2)] rounded px-1 py-0.5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => onTimeframeChange?.(tf.value)}
                className={`text-[9px] font-mono px-1 py-0.2 rounded transition cursor-pointer ${
                  interval === tf.value
                    ? 'bg-[#ff7700] text-black font-black'
                    : 'text-[rgba(255,238,221,0.5)] hover:text-[#ff7700]'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <a
            href={tradingViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="TradingView'da Tam Ekran Aç"
            className="p-1 rounded text-[rgba(255,238,221,0.5)] hover:text-[#ff7700] transition flex items-center space-x-1 text-[11px] font-mono"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">TradingView ↗</span>
          </a>

          {!isBistDirect && (
            <button
              onClick={handleRefresh}
              title="Yenile"
              className="p-1 rounded text-[rgba(255,238,221,0.5)] hover:text-[#ff7700] transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {canRemove && onRemove && (
            <button
              onClick={onRemove}
              title="Grafiği Kapat"
              className="p-1 rounded text-[rgba(255,238,221,0.5)] hover:text-[#ff2244] transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* BIST Guard Card */}
      {isBistDirect ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#0f0501] to-[#050100] overflow-y-auto">
          <div className="w-12 h-12 rounded-xl bg-[rgba(255,119,0,0.15)] border border-[#ff7700]/50 flex items-center justify-center text-[#ff7700] mb-3 shadow-[var(--glow-orange)]">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-[rgba(255,119,0,0.15)] border border-[#ff7700]/40 text-[#ff7700] text-[11px] font-mono font-bold mb-2">
            BORSA İSTANBUL LİSANSLI VARLIK
          </span>

          <h3 className="text-sm font-black text-[#ffeedd] font-mono mb-2">
            {symbol} • {name}
          </h3>

          <p className="text-xs text-[rgba(255,238,221,0.6)] max-w-sm leading-relaxed mb-5 font-sans">
            Borsa İstanbul veri lisansı kuralları gereği, yerli hisseler doğrudan harici iframe'lerde TradingView tarafından kısıtlanmaktadır.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md">
            <a
              href={tradingViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded bg-gradient-to-r from-[#ff7700] to-[#ff4400] text-black font-black text-xs shadow-[var(--glow-orange)] transition transform active:scale-95 font-mono"
            >
              <span>TradingView'da Tam Aç</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {onSwitchToSymbol && (
              <button
                onClick={() => onSwitchToSymbol('AMEX:TUR', 'iShares Türkiye BIST ETF')}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded bg-[rgba(255,119,0,0.1)] border border-[#ff7700]/40 text-[#ff7700] font-bold text-xs hover:bg-[rgba(255,119,0,0.2)] transition font-mono cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-[#00ff9d]" />
                <span>TUR BIST ETF'e Geç (Açık)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          id={`chart-container-${id}`}
          ref={containerRef}
          className="tradingview-widget-container flex-1 w-full h-[calc(100%-36px)]"
        />
      )}
    </div>
  )
}

export function TerminalCharts() {
  const [layout, setLayout] = useState<'single' | 'split' | 'quad'>('split')
  const [charts, setCharts] = useState<ChartConfig[]>([
    { id: 'c-1', symbol: 'AMEX:TUR', name: 'iShares Türkiye BIST ETF', interval: 'D' },
    { id: 'c-2', symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin / Tether US', interval: 'D' },
    { id: 'c-3', symbol: 'OANDA:XAUUSD', name: 'Ons Altın', interval: 'D' },
    { id: 'c-4', symbol: 'FX:USDTRY', name: 'Dolar / TL', interval: 'D' }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingChartId, setEditingChartId] = useState<string | null>(null)
  const [customSymbol, setCustomSymbol] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const visibleCharts =
    layout === 'single'
      ? charts.slice(0, 1)
      : layout === 'split'
      ? charts.slice(0, 2)
      : charts.slice(0, 4)

  const quickPills = [
    { label: 'BIST ETF (TUR)', symbol: 'AMEX:TUR' },
    { label: 'BTC/USDT', symbol: 'BINANCE:BTCUSDT' },
    { label: 'ETH/USDT', symbol: 'BINANCE:ETHUSDT' },
    { label: 'SOL/USDT', symbol: 'BINANCE:SOLUSDT' },
    { label: 'ONS ALTIN', symbol: 'OANDA:XAUUSD' },
    { label: 'USD/TRY', symbol: 'FX:USDTRY' },
    { label: 'S&P 500', symbol: 'FOREXCOM:SPXUSD' },
    { label: 'NASDAQ', symbol: 'FOREXCOM:NSXUSD' },
    { label: 'NVIDIA', symbol: 'NASDAQ:NVDA' },
    { label: 'BIST 100 ↗', symbol: 'BIST:XU100' }
  ]

  const handleSelectSymbol = (symbol: string, name: string) => {
    if (editingChartId) {
      setCharts((prev) =>
        prev.map((c) => (c.id === editingChartId ? { ...c, symbol, name } : c))
      )
      setEditingChartId(null)
    } else {
      setCharts((prev) => [
        ...prev,
        { id: `c-${Date.now()}`, symbol, name, interval: 'D' }
      ])
      if (layout === 'single') setLayout('split')
    }
    setIsModalOpen(false)
  }

  const handleRemoveChart = (id: string) => {
    if (charts.length <= 1) return
    setCharts((prev) => prev.filter((c) => c.id !== id))
  }

  const handleTimeframeChange = (chartId: string, newInterval: string) => {
    setCharts((prev) =>
      prev.map((c) => (c.id === chartId ? { ...c, interval: newInterval } : c))
    )
  }

  const filteredSymbols = POPULAR_SYMBOLS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full w-full bg-[#050100] overflow-hidden p-2">
      {/* Top Controls & Quick Pills */}
      <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,119,0,0.2)] mb-2 gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-1.5 min-w-max">
          <span className="text-[10px] font-mono text-[#ff7700] font-bold uppercase flex items-center space-x-1">
            <Zap className="w-3 h-3 text-[#ff7700]" />
            <span>HIZLI VARLIK:</span>
          </span>
          {quickPills.map((p) => (
            <button
              key={p.symbol}
              onClick={() => {
                setCharts((prev) => {
                  const updated = [...prev]
                  if (updated.length > 0) updated[0] = { ...updated[0], symbol: p.symbol, name: p.label }
                  return updated
                })
              }}
              className="px-2 py-0.5 rounded bg-[rgba(10,3,0,0.9)] hover:bg-[rgba(255,119,0,0.2)] border border-[rgba(255,119,0,0.25)] hover:border-[#ff7700] text-[11px] font-mono text-[rgba(255,238,221,0.8)] hover:text-[#ff7700] transition cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Layout Switcher & Add Button */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center bg-[#0a0301] border border-[rgba(255,119,0,0.2)] rounded p-0.5">
            <button
              onClick={() => setLayout('single')}
              title="1x Tek Büyük Ekran"
              className={`p-1 rounded cursor-pointer ${layout === 'single' ? 'bg-[#ff7700] text-black' : 'text-[rgba(255,238,221,0.5)] hover:text-[#ff7700]'}`}
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayout('split')}
              title="2x İkili Bölünmüş"
              className={`p-1 rounded cursor-pointer ${layout === 'split' ? 'bg-[#ff7700] text-black' : 'text-[rgba(255,238,221,0.5)] hover:text-[#ff7700]'}`}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayout('quad')}
              title="4x Dörtlü Izgara"
              className={`p-1 rounded cursor-pointer ${layout === 'quad' ? 'bg-[#ff7700] text-black' : 'text-[rgba(255,238,221,0.5)] hover:text-[#ff7700]'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingChartId(null)
              setIsModalOpen(true)
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-gradient-to-r from-[#ff7700] to-[#ff4400] text-black text-xs font-black font-mono shadow-[var(--glow-orange)] transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>GRAFİK EKLE</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div
        className={`flex-1 w-full h-[calc(100%-42px)] gap-2 grid ${
          visibleCharts.length === 1
            ? 'grid-cols-1 grid-rows-1'
            : visibleCharts.length === 2
            ? 'grid-cols-1 lg:grid-cols-2 grid-rows-1'
            : 'grid-cols-1 sm:grid-cols-2 grid-rows-2'
        }`}
      >
        {visibleCharts.map((chart) => (
          <SingleChart
            key={chart.id}
            id={chart.id}
            symbol={chart.symbol}
            name={chart.name}
            interval={chart.interval || 'D'}
            canRemove={charts.length > 1}
            onRemove={() => handleRemoveChart(chart.id)}
            onSymbolClick={() => {
              setEditingChartId(chart.id)
              setIsModalOpen(true)
            }}
            onSwitchToSymbol={(newSym, newName) => {
              setCharts((prev) =>
                prev.map((c) => (c.id === chart.id ? { ...c, symbol: newSym, name: newName } : c))
              )
            }}
            onTimeframeChange={(newInterval) => handleTimeframeChange(chart.id, newInterval)}
          />
        ))}
      </div>

      {/* Modal for adding/editing symbols */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0a0301] border border-[#ff7700]/50 rounded-xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[rgba(255,119,0,0.2)] flex items-center justify-between bg-[#070200]">
              <h3 className="text-sm font-bold text-[#ff7700] font-[var(--font-orbitron)] tracking-wider">
                {editingChartId ? 'GRAFİK SEMBOLÜNÜ DEĞİŞTİR' : 'YENİ GRAFİK EKLE'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-[rgba(255,238,221,0.5)] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!customSymbol.trim()) return
                handleSelectSymbol(customSymbol.toUpperCase().trim(), customSymbol.toUpperCase().trim())
                setCustomSymbol('')
              }}
              className="p-3 border-b border-[rgba(255,119,0,0.2)] flex gap-2 bg-[#050100]"
            >
              <input
                type="text"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                placeholder="Özel TradingView Sembolü (Örn: BINANCE:SOLUSDT, NASDAQ:TSLA)..."
                className="flex-1 bg-[rgba(15,5,1,0.9)] border border-[rgba(255,119,0,0.3)] rounded px-3 py-1.5 text-xs text-[#ffeedd] focus:outline-none focus:border-[#ff7700] font-mono"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#ff7700] text-black font-black text-xs rounded font-mono cursor-pointer"
              >
                UYGULA
              </button>
            </form>

            {/* Search */}
            <div className="p-3 border-b border-[rgba(255,119,0,0.15)] bg-[#070200]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#ff7700]/50 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Popüler listede filtrele..."
                  className="w-full bg-[rgba(15,5,1,0.9)] border border-[rgba(255,119,0,0.2)] rounded pl-8 pr-2 py-1.5 text-xs text-[#ffeedd] focus:outline-none focus:border-[#ff7700]"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredSymbols.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSymbol(item.symbol, item.name)}
                  className="flex items-center justify-between p-2.5 rounded bg-[rgba(15,5,1,0.8)] border border-[rgba(255,119,0,0.15)] hover:border-[#ff7700] hover:bg-[rgba(255,119,0,0.1)] cursor-pointer transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-16 text-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 border border-[rgba(255,119,0,0.3)] text-[#ff7700]">
                      {item.exchange}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-[#ffeedd] font-[var(--font-rajdhani)]">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[rgba(255,238,221,0.5)] font-mono">
                        {item.symbol} • {item.desc}
                      </div>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-[#00ff9d]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
