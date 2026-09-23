'use client'

import React, { useState } from 'react'
import { TerminalTicker } from './terminal-ticker'
import { TerminalNews } from './terminal-news'
import { TerminalCharts } from './terminal-charts'
import { TerminalStreams } from './terminal-streams'
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Volume2, VolumeX } from 'lucide-react'

export function LiveWorkstation() {
  const [showLeft, setShowLeft] = useState(true)
  const [showRight, setShowRight] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  return (
    <div className="flex flex-col h-full w-full bg-[#050100] text-[#ffeedd] overflow-hidden select-none">
      {/* Kayan TradingView Fiyat Bandı */}
      <div className="relative">
        <TerminalTicker />

        {/* Panel Toggle Bar Overlay */}
        <div className="absolute right-2 top-1.5 flex items-center space-x-1.5 z-20">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Sesli Flaş Alarmı Açık' : 'Sesli Flaş Alarmı Kapalı'}
            className={`p-1 rounded text-xs font-mono border transition flex items-center space-x-1 ${
              soundEnabled
                ? 'bg-[rgba(255,119,0,0.15)] border-[#ff7700] text-[#ff7700] shadow-[var(--glow-orange)]'
                : 'bg-black/60 border-[rgba(255,119,0,0.2)] text-[rgba(255,238,221,0.4)]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setShowLeft(!showLeft)}
            title={showLeft ? 'Haberler Panelini Gizle' : 'Haberler Panelini Göster'}
            className={`p-1 rounded text-xs font-mono border transition ${
              showLeft
                ? 'bg-[rgba(255,119,0,0.1)] border-[rgba(255,119,0,0.3)] text-[#ff7700]'
                : 'bg-[#ff7700] text-black border-[#ff7700]'
            }`}
          >
            {showLeft ? <PanelLeftClose className="w-3 h-3" /> : <PanelLeftOpen className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setShowRight(!showRight)}
            title={showRight ? 'TV Panelini Gizle' : 'TV Panelini Göster'}
            className={`p-1 rounded text-xs font-mono border transition ${
              showRight
                ? 'bg-[rgba(255,119,0,0.1)] border-[rgba(255,119,0,0.3)] text-[#ff7700]'
                : 'bg-[#ff7700] text-black border-[#ff7700]'
            }`}
          >
            {showRight ? <PanelRightClose className="w-3 h-3" /> : <PanelRightOpen className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 3-Sütunlu Çalışma Alanı */}
      <div className="flex-1 flex w-full overflow-hidden relative pb-7">
        {/* Sol Panel: Anlık Haberler & X Telgraf (320px - 360px) */}
        {showLeft && (
          <aside className="w-[320px] lg:w-[340px] xl:w-[370px] h-full shrink-0 z-10 transition-all duration-300">
            <TerminalNews soundEnabled={soundEnabled} />
          </aside>
        )}

        {/* Orta Panel: Modüler TradingView Grafikleri (Merkezi ve Geniş) */}
        <section className="flex-1 h-full min-w-0 bg-[#050100] z-0 overflow-hidden">
          <TerminalCharts />
        </section>

        {/* Sağ Panel: Canlı TV Akışları & 24/7 Medya (320px - 360px) */}
        {showRight && (
          <aside className="w-[320px] lg:w-[340px] xl:w-[370px] h-full shrink-0 z-10 transition-all duration-300">
            <TerminalStreams />
          </aside>
        )}
      </div>
    </div>
  )
}
