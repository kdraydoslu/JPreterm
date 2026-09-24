'use client'

import React, { useState } from 'react'
import {
  Tv,
  Play,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Globe,
  Radio,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'

export interface TVChannel {
  id: string
  name: string
  region: 'tr' | 'world'
  category: 'economy' | 'news'
  youtubeId: string
  channelUrl: string
  officialWebUrl: string
  currentShow: string
  resolution: string
  badgeColor: string
  logoText: string
  description: string
}

const CHANNELS: TVChannel[] = [
  {
    id: 'bloomberg-ht',
    name: 'Bloomberg HT',
    region: 'tr',
    category: 'economy',
    youtubeId: 'j7B_zsL11Pw',
    channelUrl: 'https://www.youtube.com/BloombergHT/live',
    officialWebUrl: 'https://www.bloomberght.com/canli-yayin',
    currentShow: 'Canlı Borsa & Finans Masası',
    resolution: '1080p HD Canlı',
    badgeColor: 'bg-[rgba(255,119,0,0.15)] text-[#ff7700] border-[#ff7700]/40',
    logoText: 'BHT',
    description: 'Borsa İstanbul, döviz kurları, şirket bilançoları ve küresel makro ekonomi canlı yayını.'
  },
  {
    id: 'trt-haber',
    name: 'TRT Haber Canlı',
    region: 'tr',
    category: 'news',
    youtubeId: 'GefoJ-LXYfc',
    channelUrl: 'https://www.youtube.com/@trthaber/live',
    officialWebUrl: 'https://www.trthaber.com/canli-yayin-izle.html',
    currentShow: 'Son Dakika & Sıcak Gündem',
    resolution: '1080p HD Canlı',
    badgeColor: 'bg-[rgba(255,34,68,0.15)] text-[#ff2244] border-[#ff2244]/40',
    logoText: 'TRT',
    description: 'Türkiye ve dünyadan en son dakika gelişmeleri, sıcak bağlantılar ve resmi haber bültenleri.'
  },
  {
    id: 'haberturk',
    name: 'Habertürk TV',
    region: 'tr',
    category: 'news',
    youtubeId: 'VAnpvJhclwM',
    channelUrl: 'https://www.youtube.com/haberturk/live',
    officialWebUrl: 'https://www.haberturk.com/canli-yayin',
    currentShow: 'Habertürk Canlı Yayın Masası',
    resolution: '1080p HD Canlı',
    badgeColor: 'bg-[rgba(255,119,0,0.15)] text-[#ff7700] border-[#ff7700]/40',
    logoText: 'HT',
    description: 'Günün manşetleri, ekonomi bültenleri, piyasa analizleri ve canlı açık oturumlar.'
  },
  {
    id: 'cnnturk',
    name: 'CNN Türk',
    region: 'tr',
    category: 'news',
    youtubeId: 'KPGjG2vQ-eo',
    channelUrl: 'https://www.youtube.com/@cnnturk/live',
    officialWebUrl: 'https://www.cnnturk.com/canli-yayin',
    currentShow: 'CNN Türk Canlı Haber Masası',
    resolution: '1080p HD Canlı',
    badgeColor: 'bg-[rgba(255,34,68,0.15)] text-[#ff2244] border-[#ff2244]/40',
    logoText: 'CNN',
    description: 'Türkiye ve küresel gündem, canlı saha bağlantıları ve son dakika haber bülteni.'
  },
  {
    id: 'ntv',
    name: 'NTV Canlı',
    region: 'tr',
    category: 'news',
    youtubeId: 'pqq5c6k70kk',
    channelUrl: 'https://www.youtube.com/@NTV/live',
    officialWebUrl: 'https://www.ntv.com.tr/canli-yayin',
    currentShow: 'NTV Gün Ortası & Piyasa',
    resolution: '1080p HD Canlı',
    badgeColor: 'bg-[rgba(0,240,255,0.15)] text-[#00f0ff] border-[#00f0ff]/40',
    logoText: 'NTV',
    description: 'Doğrudan ekonomi, piyasalar, teknoloji ve sıcak haber akışı.'
  },
  {
    id: 'sky-news',
    name: 'Sky News Live',
    region: 'world',
    category: 'news',
    youtubeId: 'NPOiE1iqOO8',
    channelUrl: 'https://www.youtube.com/@SkyNews/live',
    officialWebUrl: 'https://news.sky.com/watch-live',
    currentShow: 'Sky News Global Live Wire',
    resolution: '1080p HD Canlı',
    badgeColor: 'bg-[rgba(0,240,255,0.15)] text-[#00f0ff] border-[#00f0ff]/40',
    logoText: 'SKY',
    description: '24/7 International news wire from London bureau covering world events and markets.'
  },
  {
    id: 'al-jazeera',
    name: 'Al Jazeera English',
    region: 'world',
    category: 'news',
    youtubeId: 'gCNeDWCI0vo',
    channelUrl: 'https://www.youtube.com/@aljazeeraenglish/live',
    officialWebUrl: 'https://www.aljazeera.com/live',
    currentShow: 'Al Jazeera Live Stream 24/7',
    resolution: '1080p HD Canlı',
    badgeColor: 'bg-[rgba(255,204,0,0.15)] text-[#ffcc00] border-[#ffcc00]/40',
    logoText: 'AJE',
    description: 'Global geopolitical coverage, Middle East wire and international investigative journalism.'
  },
  {
    id: 'euronews',
    name: 'Euronews Live',
    region: 'world',
    category: 'news',
    youtubeId: 'u83CH08-vsk',
    channelUrl: 'https://www.youtube.com/@euronews/live',
    officialWebUrl: 'https://tr.euronews.com/live',
    currentShow: 'Euronews International Wire',
    resolution: '1080p HD Canlı',
    badgeColor: 'bg-[rgba(0,255,157,0.15)] text-[#00ff9d] border-[#00ff9d]/40',
    logoText: 'EURO',
    description: 'European economy, central banking policies, and cross-border developments.'
  },
  {
    id: 'dw-news',
    name: 'DW News',
    region: 'world',
    category: 'news',
    youtubeId: 'LuKwFajn37U',
    channelUrl: 'https://www.youtube.com/@dwnews/live',
    officialWebUrl: 'https://www.dw.com/en/live-tv/s-100825',
    currentShow: 'DW Live News & Analysis',
    resolution: '1080p HD Canlı',
    badgeColor: 'bg-[rgba(0,255,157,0.15)] text-[#00ff9d] border-[#00ff9d]/40',
    logoText: 'DW',
    description: 'In-depth German and European global perspectives with business and tech segments.'
  },
  {
    id: 'reuters-live',
    name: 'Reuters Live',
    region: 'world',
    category: 'economy',
    youtubeId: 'vZ6Bgd9487s',
    channelUrl: 'https://www.youtube.com/@Reuters/live',
    officialWebUrl: 'https://www.reuters.com/video/',
    currentShow: 'Reuters Global Markets Wire',
    resolution: '1080p HD Canlı',
    badgeColor: 'bg-[rgba(255,119,0,0.15)] text-[#ff7700] border-[#ff7700]/40',
    logoText: 'RT',
    description: 'Wall Street opening bells, macroeconomic briefings, and corporate earnings analysis.'
  }
]

export function TerminalStreams() {
  const [selectedChannel, setSelectedChannel] = useState<TVChannel>(CHANNELS[0])
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'tr' | 'world' | 'economy'>('all')
  const [activeTab, setActiveTab] = useState<'channels' | 'info'>('channels')
  const [customStreamId, setCustomStreamId] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  const filteredChannels = CHANNELS.filter((channel) => {
    if (selectedRegion === 'all') return true
    if (selectedRegion === 'tr') return channel.region === 'tr'
    if (selectedRegion === 'world') return channel.region === 'world'
    if (selectedRegion === 'economy') return channel.category === 'economy'
    return true
  })

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let videoId = customStreamId.trim()
    if (videoId.includes('v=')) {
      videoId = videoId.split('v=')[1]?.split('&')[0] || videoId
    } else if (videoId.includes('youtu.be/')) {
      videoId = videoId.split('youtu.be/')[1]?.split('?')[0] || videoId
    } else if (videoId.includes('live/')) {
      videoId = videoId.split('live/')[1]?.split('?')[0] || videoId
    }

    if (!videoId) return

    const customChannel: TVChannel = {
      id: `custom-${Date.now()}`,
      name: 'Özel Canlı Yayın',
      region: 'tr',
      category: 'news',
      youtubeId: videoId,
      channelUrl: `https://www.youtube.com/watch?v=${videoId}`,
      officialWebUrl: `https://www.youtube.com/watch?v=${videoId}`,
      currentShow: 'Kullanıcı Canlı Akışı',
      resolution: 'Canlı Yayın',
      badgeColor: 'bg-[rgba(255,119,0,0.15)] text-[#ff7700] border-[#ff7700]/40',
      logoText: 'CANLI',
      description: 'Kullanıcı tarafından girilen özel canlı yayın bağlantısı.'
    }

    setSelectedChannel(customChannel)
    setShowCustomInput(false)
    setCustomStreamId('')
    setIframeKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col h-full bg-[#080301]/95 border-l border-[rgba(255,119,0,0.2)] w-full overflow-hidden">
      {/* Panel Top Header */}
      <div className="p-3 bg-[rgba(15,5,1,0.9)] border-b border-[rgba(255,119,0,0.25)] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-[rgba(255,119,0,0.1)] border border-[rgba(255,119,0,0.3)] text-[#ff7700]">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-[12px] font-black uppercase tracking-[1.5px] text-[#ff7700] font-[var(--font-orbitron)] [text-shadow:var(--glow-orange)]">
                CANLI YAYIN & TV
              </h2>
              <span className="w-2 h-2 rounded-full bg-[#ff2244] animate-ping" />
            </div>
            <p className="text-[10px] text-[rgba(255,238,221,0.5)] font-mono">
              TR & KÜRESEL 24/7 CANLI YAYINLAR
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          title="Özel Canlı Yayın Linki Gir"
          className="p-1 px-2 rounded bg-[rgba(255,119,0,0.1)] border border-[rgba(255,119,0,0.4)] text-[10px] font-mono text-[#ff7700] hover:bg-[rgba(255,119,0,0.2)] flex items-center space-x-1 transition cursor-pointer"
        >
          <PlusCircle className="w-3 h-3" />
          <span>ÖZEL LİNK</span>
        </button>
      </div>

      {showCustomInput && (
        <form onSubmit={handleCustomSubmit} className="p-2.5 bg-[#050100] border-b border-[rgba(255,119,0,0.2)] flex gap-1.5">
          <input
            type="text"
            value={customStreamId}
            onChange={(e) => setCustomStreamId(e.target.value)}
            placeholder="YouTube Live Video ID veya URL..."
            className="flex-1 bg-[rgba(10,3,0,0.8)] border border-[rgba(255,119,0,0.3)] rounded px-2.5 py-1 text-xs text-[#ffeedd] placeholder-[rgba(255,238,221,0.3)] focus:outline-none focus:border-[#ff7700]"
          />
          <button
            type="submit"
            className="px-2.5 py-1 bg-[#ff7700] hover:bg-[#ff8800] text-black text-xs font-black rounded font-mono cursor-pointer"
          >
            YÜKLE
          </button>
        </form>
      )}

      {/* Main Video Stream Player */}
      <div className="relative w-full aspect-video bg-black border-b border-[rgba(255,119,0,0.2)] shrink-0 group">
        <iframe
          key={`${selectedChannel.id}-${iframeKey}`}
          src={`https://www.youtube.com/embed/${selectedChannel.youtubeId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`}
          title={selectedChannel.name}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <div className="absolute top-2 left-2 flex items-center space-x-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-[#ff2244] text-white text-[9px] font-black tracking-wider font-mono flex items-center space-x-1 shadow-md animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>CANLI</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[#ff7700] text-[10px] font-mono border border-[#ff7700]/30">
            {selectedChannel.name}
          </span>
        </div>
      </div>

      {/* Currently Playing Info */}
      <div className="p-2.5 bg-[#090301] border-b border-[rgba(255,119,0,0.2)] flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-[#ffeedd] truncate font-[var(--font-rajdhani)]">
              {selectedChannel.currentShow}
            </span>
          </div>
          <div className="text-[10px] text-[rgba(255,238,221,0.5)] truncate flex items-center space-x-2 mt-0.5 font-mono">
            <span>{selectedChannel.name}</span>
            <span>•</span>
            <span className="text-[#00ff9d]">{selectedChannel.resolution}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => setIframeKey((prev) => prev + 1)}
            title="Yeniden Başlat"
            className="p-1 rounded text-[rgba(255,238,221,0.5)] hover:text-[#ff7700] transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={selectedChannel.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="YouTube Canlı Yayınında Aç"
            className="px-2 py-0.5 rounded bg-[rgba(255,34,68,0.15)] border border-[#ff2244]/50 text-[#ff2244] hover:bg-[rgba(255,34,68,0.3)] transition flex items-center space-x-1 text-[10px] font-mono font-bold"
          >
            <span>YouTube ↗</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={selectedChannel.officialWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Resmi Web Sitesinde Canlı İzle"
            className="px-2 py-0.5 rounded bg-[rgba(255,119,0,0.15)] border border-[#ff7700]/50 text-[#ff7700] hover:bg-[rgba(255,119,0,0.3)] transition flex items-center space-x-1 text-[10px] font-mono font-bold"
          >
            <span>Web ↗</span>
            <Globe className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(255,119,0,0.2)] bg-[#050100]">
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 py-1.5 text-[11px] font-[var(--font-rajdhani)] font-bold tracking-[1px] border-b-2 transition cursor-pointer ${
            activeTab === 'channels'
              ? 'border-[#ff7700] text-[#ff7700] bg-[rgba(255,119,0,0.08)] [text-shadow:var(--glow-orange)]'
              : 'border-transparent text-[rgba(255,238,221,0.5)] hover:text-[#ff7700]'
          }`}
        >
          KANAL LİSTESİ ({filteredChannels.length})
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-1.5 text-[11px] font-[var(--font-rajdhani)] font-bold tracking-[1px] border-b-2 transition cursor-pointer ${
            activeTab === 'info'
              ? 'border-[#ff7700] text-[#ff7700] bg-[rgba(255,119,0,0.08)] [text-shadow:var(--glow-orange)]'
              : 'border-transparent text-[rgba(255,238,221,0.5)] hover:text-[#ff7700]'
          }`}
        >
          YAYIN BİLGİSİ
        </button>
      </div>

      {/* Region Filter */}
      {activeTab === 'channels' && (
        <div className="px-2.5 py-1.5 border-b border-[rgba(255,119,0,0.15)] bg-[#070200] flex space-x-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'TÜMÜ' },
            { id: 'tr', label: 'TR KANALLARI' },
            { id: 'world', label: 'DÜNYA' },
            { id: 'economy', label: 'EKONOMİ/FİNANS' }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRegion(r.id as typeof selectedRegion)}
              className={`px-2 py-0.5 rounded text-[10px] font-[var(--font-rajdhani)] font-bold tracking-[0.5px] transition cursor-pointer ${
                selectedRegion === r.id
                  ? 'bg-[rgba(255,119,0,0.2)] text-[#ff7700] border border-[#ff7700]/60'
                  : 'text-[rgba(255,238,221,0.5)] hover:text-[#ff7700]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {activeTab === 'channels' ? (
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {filteredChannels.map((channel) => {
            const isPlaying = selectedChannel.id === channel.id

            return (
              <div
                key={channel.id}
                onClick={() => {
                  setSelectedChannel(channel)
                  setIframeKey((prev) => prev + 1)
                }}
                className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                  isPlaying
                    ? 'bg-[rgba(255,119,0,0.15)] border-[#ff7700] shadow-[0_0_12px_rgba(255,119,0,0.2)]'
                    : 'bg-[#0c0502] border-[rgba(255,119,0,0.15)] hover:border-[rgba(255,119,0,0.4)]'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className={`w-9 h-9 rounded flex items-center justify-center font-black text-xs font-mono shrink-0 border ${channel.badgeColor}`}>
                    {channel.logoText}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-[#ffeedd] truncate font-[var(--font-rajdhani)]">
                        {channel.name}
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-black/60 text-[#ff7700] font-mono uppercase border border-[rgba(255,119,0,0.2)]">
                        {channel.region}
                      </span>
                    </div>
                    <div className="text-[11px] text-[rgba(255,238,221,0.5)] truncate font-sans">
                      {channel.currentShow}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  {isPlaying ? (
                    <span className="flex items-center space-x-1 text-[10px] font-mono text-[#00ff9d] font-bold px-1.5 py-0.5 rounded bg-[rgba(0,255,157,0.1)] border border-[#00ff9d]/40">
                      <Play className="w-2.5 h-2.5 fill-[#00ff9d]" />
                      <span>AKTİF</span>
                    </span>
                  ) : (
                    <button className="p-1.5 rounded bg-[rgba(255,119,0,0.1)] text-[#ff7700] hover:bg-[#ff7700] hover:text-black transition">
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="p-3 rounded-lg bg-[#0c0502] border border-[rgba(255,119,0,0.25)] space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#00ff9d]" />
              <span className="font-[var(--font-orbitron)] text-xs font-bold text-[#ff7700]">
                {selectedChannel.name}
              </span>
            </div>
            <p className="text-xs text-[rgba(255,238,221,0.7)] leading-relaxed font-sans">
              {selectedChannel.description}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#090301] border border-[rgba(255,119,0,0.2)] space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center text-[rgba(255,238,221,0.6)]">
              <span>Yayın Formatı:</span>
              <span className="text-[#00ff9d] font-bold">24/7 Canlı Akış</span>
            </div>
            <div className="flex justify-between items-center text-[rgba(255,238,221,0.6)]">
              <span>Çözünürlük:</span>
              <span className="text-[#ff7700] font-bold">{selectedChannel.resolution}</span>
            </div>
            <div className="flex justify-between items-center text-[rgba(255,238,221,0.6)]">
              <span>Bölge:</span>
              <span className="uppercase text-[#ffeedd]">{selectedChannel.region === 'tr' ? 'Türkiye' : 'Küresel (Global)'}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <a
              href={selectedChannel.officialWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded bg-[rgba(255,119,0,0.15)] hover:bg-[rgba(255,119,0,0.3)] border border-[#ff7700]/50 text-[#ff7700] text-xs font-bold font-mono transition"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Resmi Web Sitesinde Canlı İzle ↗</span>
            </a>
            <a
              href={selectedChannel.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded bg-[rgba(255,34,68,0.15)] hover:bg-[rgba(255,34,68,0.3)] border border-[#ff2244]/50 text-[#ff2244] text-xs font-bold font-mono transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>YouTube Sayfasında Canlı İzle ↗</span>
            </a>
          </div>
        </div>
      )}

      {/* Bottom Status */}
      <div className="p-2 bg-[#050100] border-t border-[rgba(255,119,0,0.2)] flex items-center justify-between text-[10px] text-[rgba(255,119,0,0.7)] font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2244] animate-pulse" />
          <span>Yayın: {selectedChannel.name}</span>
        </div>
        <span className="text-[#00ff9d]">HD 1080p Canlı</span>
      </div>
    </div>
  )
}
