'use client'

import { useEffect, useState } from 'react'
import { SignalFeed } from './signal-feed'

const HEATMAP_ASSETS = [
  'BTC',
  'ETH',
  'SOL',
  'XRP',
  'BNB',
  'ADA',
  'DOT',
  'AVAX',
  'MATIC',
  'LINK',
  'UNI',
  'ATOM',
  'NEAR',
  'FTM',
  'ALGO',
  'GALA',
  'SAND',
  'MANA',
  'AXS',
  'DOGE',
  'SHIB',
]

export function RightSidebar() {
  const [heatmap, setHeatmap] = useState<{ bg: string; txt: string }[]>([])
  const [metrics, setMetrics] = useState({ tradesMin: 73, avgFill: 0.43, extremePct: 18.2 })
  const [microFills, setMicroFills] = useState<string[][]>([[], []])

  useEffect(() => {
    const updateHeatmap = () => {
      setHeatmap(
        HEATMAP_ASSETS.map(() => {
          const v = Math.random()
          if (v > 0.8) return { bg: '#00ff9d', txt: '+' }
          if (v > 0.6) return { bg: 'rgba(0,255,157,0.6)', txt: '↑' }
          if (v > 0.4) return { bg: 'rgba(255,204,0,0.6)', txt: '~' }
          if (v > 0.2) return { bg: 'rgba(255,34,68,0.6)', txt: '↓' }
          return { bg: '#ff2244', txt: '-' }
        })
      )
    }

    const updateMetrics = () => {
      setMetrics({
        tradesMin: 60 + Math.floor(Math.random() * 30),
        avgFill: 0.3 + Math.random() * 0.3,
        extremePct: 15 + Math.random() * 8,
      })
    }

    const updateMicroFills = () => {
      setMicroFills([
        Array.from({ length: 20 }, () => {
          const r = Math.random()
          return r > 0.55 ? 'buy' : r < 0.45 ? 'sell' : 'neutral'
        }),
        Array.from({ length: 20 }, () => {
          const r = Math.random()
          return r > 0.55 ? 'buy' : r < 0.45 ? 'sell' : 'neutral'
        }),
      ])
    }

    updateHeatmap()
    updateMicroFills()

    const heatmapInterval = setInterval(updateHeatmap, 1000)
    const metricsInterval = setInterval(updateMetrics, 500)
    const microFillInterval = setInterval(updateMicroFills, 300)

    return () => {
      clearInterval(heatmapInterval)
      clearInterval(metricsInterval)
      clearInterval(microFillInterval)
    }
  }, [])

  return (
    <aside className="flex flex-col overflow-hidden bg-[rgba(10,3,0,0.7)] border-l border-[rgba(255,119,0,0.15)]">
      <SignalFeed />

      {/* Capital Allocation */}
      <div className="border-t border-[rgba(255,119,0,0.15)] px-2 py-1.5 shrink-0">
        <div className="flex items-center justify-between pb-1 mb-1">
          <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#ff7700] tracking-[1.5px] [text-shadow:0_0_6px_rgba(255,119,0,0.5)]">
            CAPITAL ALLOCATION
          </span>
          <span className="bg-[rgba(255,34,68,0.15)] border border-[rgba(255,34,68,0.5)] text-[#ff2244] text-[8px] px-1.5 py-0.5 rounded-sm tracking-[2px] font-[var(--font-orbitron)] animate-[liveBlink_1s_step-end_infinite]">
            LIVE
          </span>
        </div>
        {[
          { label: 'CRYPTO', width: 65, gradient: 'from-[#ff7700] to-[#00ff9d]' },
          { label: 'EQUITIES', width: 25, gradient: 'from-[#ff00aa] to-[#ff6600]' },
          { label: 'RISK', width: 10, gradient: 'from-[#ff2244] to-[#ff6600]' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-[rgba(255,119,0,0.4)]">{item.label}</span>
            <div className="w-[85px] h-[6px] bg-[rgba(255,119,0,0.1)] rounded-sm overflow-hidden">
              <div className={`h-full rounded-sm bg-gradient-to-r ${item.gradient}`} style={{ width: `${item.width}%` }} />
            </div>
            <span className="text-[10px] text-[#ff7700] font-mono font-semibold">{item.width}%</span>
          </div>
        ))}
        <div className="flex justify-between text-[9px] text-[rgba(255,119,0,0.4)] mt-1">
          <span>
            Low <span className="text-[#ff7700]">279K</span>
          </span>
          <span>10.6X</span>
          <span>Risk</span>
        </div>
      </div>

      {/* HFT Metrics */}
      <div className="border-t border-[rgba(255,119,0,0.15)] px-2 py-1.5 shrink-0">
        <div className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#ff7700] tracking-[1.5px] mb-1">
          HFT METRICS ● LIVE
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-[9px] text-[rgba(255,119,0,0.4)]">Trades/min</span>
          <span className="font-mono text-[11px] text-[#00ff9d] font-semibold animate-[metricFlick_0.5s_ease-in-out_infinite]">
            {metrics.tradesMin}/min
          </span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-[9px] text-[rgba(255,119,0,0.4)]">Avg Fill Time</span>
          <span className="font-mono text-[11px] text-[#00ff9d] font-semibold animate-[metricFlick_0.5s_ease-in-out_infinite]">
            0:{metrics.avgFill.toFixed(2)} ms
          </span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-[9px] text-[rgba(255,119,0,0.4)]">Extreme %</span>
          <span className="font-mono text-[11px] text-[#ff00aa] font-semibold animate-[metricFlick_0.5s_ease-in-out_infinite]">
            {metrics.extremePct.toFixed(1)}%
          </span>
        </div>

        <div className="text-[8px] text-[rgba(255,119,0,0.4)] mb-1">MICRO-FILL STACK</div>
        {microFills.map((row, i) => (
          <div key={i} className="flex gap-[1px] mb-0.5">
            {row.map((type, j) => (
              <div
                key={j}
                className={`flex-1 h-2 rounded-[1px] transition-all duration-100 ${
                  type === 'buy'
                    ? 'bg-[#00ff9d] shadow-[0_0_3px_#00ff9d]'
                    : type === 'sell'
                      ? 'bg-[#ff2244] shadow-[0_0_3px_#ff2244]'
                      : 'bg-[rgba(255,119,0,0.2)]'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </aside>
  )
}
