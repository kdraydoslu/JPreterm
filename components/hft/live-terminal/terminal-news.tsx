'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Flame,
  Search,
  RefreshCw,
  ExternalLink,
  Radio,
  Zap,
  CheckCircle2,
  TrendingUp,
  Rss
} from 'lucide-react'

export type NewsCategory = 'all' | 'tr' | 'world' | 'economy' | 'crypto' | 'x'

export interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  category: NewsCategory
  importance: 'breaking' | 'high' | 'normal'
  timestamp: string
  timeAgo: string
  url: string
  authorHandle?: string
  badge: string
}

function TradingViewTimelineWidget() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      feedMode: 'all_symbols',
      isTransparent: true,
      displayMode: 'regular',
      width: '100%',
      height: '100%',
      colorTheme: 'dark',
      locale: 'tr'
    })

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    widgetDiv.style.width = '100%'
    widgetDiv.style.height = '100%'

    containerRef.current.appendChild(widgetDiv)
    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="w-full h-full bg-[#050100] overflow-hidden p-1">
      <div ref={containerRef} className="tradingview-widget-container w-full h-full" />
    </div>
  )
}

export function TerminalNews({ soundEnabled }: { soundEnabled: boolean }) {
  const [feedMode, setFeedMode] = useState<'realtime' | 'tradingview'>('realtime')
  const [news, setNews] = useState<NewsItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const loadRealNews = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/terminal-news', { cache: 'no-cache' })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      if (data.status === 'ok' && Array.isArray(data.items)) {
        setNews(data.items)
        setLastUpdated(data.updatedAt || new Date().toLocaleTimeString('tr-TR'))
      }
    } catch (e) {
      console.error('Error fetching live news:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRealNews()
    const timer = setInterval(loadRealNews, 45000)
    return () => clearInterval(timer)
  }, [loadRealNews])

  const filteredNews = news.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'x'
        ? item.category === 'x'
        : item.category === selectedCategory

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const categories = [
    { id: 'all' as NewsCategory, label: 'TÜMÜ' },
    { id: 'tr' as NewsCategory, label: 'TR GÜNDEM' },
    { id: 'world' as NewsCategory, label: 'DÜNYA' },
    { id: 'economy' as NewsCategory, label: 'EKONOMİ' },
    { id: 'crypto' as NewsCategory, label: 'KRİPTO' },
    { id: 'x' as NewsCategory, label: 'X TELGRAF', icon: <Zap className="w-3 h-3 text-[#ff7700] fill-[#ff7700]" /> }
  ]

  return (
    <div className="flex flex-col h-full bg-[#080301]/95 border-r border-[rgba(255,119,0,0.2)] w-full overflow-hidden">
      {/* Panel Top Header */}
      <div className="p-3 bg-[rgba(15,5,1,0.9)] border-b border-[rgba(255,119,0,0.25)] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-[rgba(255,119,0,0.1)] border border-[rgba(255,119,0,0.3)] text-[#ff7700]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-[12px] font-black uppercase tracking-[1.5px] text-[#ff7700] font-[var(--font-orbitron)] [text-shadow:var(--glow-orange)]">
                ANLIK HABER & TELGRAF
              </h2>
              <span className="w-2 h-2 rounded-full bg-[#ff2244] animate-ping" />
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d]" />
              <p className="text-[10px] text-[#00ff9d] font-mono">
                CANLI GERÇEK AKIŞ (AA, TRT, CNBC, FOREX)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => loadRealNews()}
          disabled={isLoading}
          title="Verileri Yenile"
          className="p-1.5 px-2 rounded bg-[rgba(255,119,0,0.1)] border border-[rgba(255,119,0,0.4)] text-[#ff7700] hover:bg-[rgba(255,119,0,0.2)] transition flex items-center space-x-1 text-[10px] font-mono cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline font-bold">YENİLE</span>
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex border-b border-[rgba(255,119,0,0.2)] bg-[#050100]">
        <button
          onClick={() => setFeedMode('realtime')}
          className={`flex-1 py-1.5 text-[11px] font-[var(--font-rajdhani)] font-bold tracking-[1px] border-b-2 transition flex items-center justify-center space-x-1.5 cursor-pointer ${
            feedMode === 'realtime'
              ? 'border-[#ff7700] text-[#ff7700] bg-[rgba(255,119,0,0.08)] [text-shadow:var(--glow-orange)]'
              : 'border-transparent text-[rgba(255,238,221,0.5)] hover:text-[#ff7700]'
          }`}
        >
          <Rss className="w-3.5 h-3.5 text-[#ff7700]" />
          <span>CANLI RSS & X</span>
        </button>
        <button
          onClick={() => setFeedMode('tradingview')}
          className={`flex-1 py-1.5 text-[11px] font-[var(--font-rajdhani)] font-bold tracking-[1px] border-b-2 transition flex items-center justify-center space-x-1.5 cursor-pointer ${
            feedMode === 'tradingview'
              ? 'border-[#ff7700] text-[#ff7700] bg-[rgba(255,119,0,0.08)] [text-shadow:var(--glow-orange)]'
              : 'border-transparent text-[rgba(255,238,221,0.5)] hover:text-[#ff7700]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#00ff9d]" />
          <span>TRADINGVIEW AKIŞI</span>
        </button>
      </div>

      {feedMode === 'tradingview' ? (
        <div className="flex-1 w-full h-[calc(100%-80px)] overflow-hidden">
          <TradingViewTimelineWidget />
        </div>
      ) : (
        <>
          {/* Categories */}
          <div className="px-2.5 py-1.5 border-b border-[rgba(255,119,0,0.15)] bg-[#070200] overflow-x-auto scrollbar-none">
            <div className="flex space-x-1 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-[var(--font-rajdhani)] font-bold tracking-[0.5px] transition flex items-center space-x-1 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[rgba(255,119,0,0.2)] text-[#ff7700] border border-[#ff7700]/60 shadow-[var(--glow-orange)]'
                      : 'text-[rgba(255,238,221,0.5)] hover:text-[#ff7700] hover:bg-[rgba(255,119,0,0.05)]'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-2 border-b border-[rgba(255,119,0,0.15)] bg-[#060201]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#ff7700]/50 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Haber veya kaynak filtrele..."
                className="w-full bg-[rgba(10,3,0,0.8)] border border-[rgba(255,119,0,0.2)] rounded pl-8 pr-2 py-1 text-xs text-[#ffeedd] placeholder-[rgba(255,238,221,0.3)] focus:outline-none focus:border-[#ff7700] font-sans"
              />
            </div>
          </div>

          {/* News List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {filteredNews.length === 0 ? (
              <div className="text-center py-12 text-[rgba(255,238,221,0.4)] text-xs font-mono">
                {isLoading ? 'Canlı haber akışı bağlanıyor...' : 'Arama kriterine uygun aktif haber bulunamadı.'}
              </div>
            ) : (
              filteredNews.map((item) => {
                const isX = item.category === 'x'
                const isBreaking = item.importance === 'breaking'

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border transition duration-150 ${
                      isBreaking
                        ? 'bg-gradient-to-r from-[rgba(255,34,68,0.15)] via-[#0d0401] to-[#0d0401] border-[rgba(255,34,68,0.5)] shadow-[0_0_15px_rgba(255,34,68,0.1)]'
                        : isX
                        ? 'bg-[rgba(255,119,0,0.04)] border-[rgba(255,119,0,0.25)] hover:border-[#ff7700]/60'
                        : 'bg-[#0a0301] border-[rgba(255,119,0,0.15)] hover:border-[rgba(255,119,0,0.4)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        {isBreaking && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-[rgba(255,34,68,0.2)] border border-[#ff2244] text-[#ff2244] animate-pulse flex items-center space-x-1">
                            <Flame className="w-2.5 h-2.5 fill-current" />
                            <span>SON DAKİKA</span>
                          </span>
                        )}
                        {isX && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-[rgba(255,119,0,0.15)] border border-[#ff7700]/60 text-[#ff7700] flex items-center space-x-1">
                            <Zap className="w-2.5 h-2.5 fill-[#ff7700]" />
                            <span>X TELGRAF</span>
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-[#ffeedd] font-mono truncate max-w-[170px]">
                          {isX ? item.authorHandle : item.source}
                        </span>
                      </div>
                      <span className="text-[10px] text-[rgba(255,238,221,0.5)] font-mono shrink-0">
                        {item.timeAgo || item.timestamp}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-[#ffeedd] leading-snug hover:text-[#ff7700] transition">
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </h3>

                    {item.summary && (
                      <p className="text-[11px] text-[rgba(255,238,221,0.6)] mt-1 line-clamp-3 leading-relaxed">
                        {item.summary}
                      </p>
                    )}

                    <div className="mt-2 pt-1.5 border-t border-[rgba(255,119,0,0.15)] flex items-center justify-between text-[10px] text-[rgba(255,238,221,0.4)]">
                      <span className="px-1.5 py-0.2 rounded bg-[#050100] border border-[rgba(255,119,0,0.2)] text-[rgba(255,119,0,0.8)] font-mono text-[9px] uppercase">
                        {item.badge || item.category}
                      </span>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-[rgba(255,238,221,0.5)] hover:text-[#ff7700] transition font-mono"
                        >
                          <span>Haberi Oku</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Bottom Bar */}
          <div className="p-2 bg-[#050100] border-t border-[rgba(255,119,0,0.2)] flex items-center justify-between text-[10px] text-[rgba(255,119,0,0.7)] font-mono">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#00ff9d]" />
              <span>Canlı Akış: {filteredNews.length} Haber</span>
            </div>
            <span className="text-[rgba(255,238,221,0.4)]">
              {lastUpdated ? `Güncelleme: ${lastUpdated}` : 'Canlı Senkronize'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
