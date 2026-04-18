'use client'

import { useEffect, useState } from 'react'

const POSITIONS = [
  { asset: 'BTC/USDT', pnl: 2967.36, pct: '+2.92%' },
  { asset: 'BTC/USDT', pnl: 2532.39, pct: '+2.83%' },
  { asset: 'ETH/USDT', pnl: -1285.6, pct: '-1.80%' },
  { asset: 'BTC/USDT', pnl: 995.29, pct: '-2.05%' },
  { asset: 'ETH/USDT', pnl: 500.23, pct: '-1.98%' },
]

const NEWS = [
  { src: 'Bloomberg', text: 'Bitcoin ETF sees $234M inflow', urgent: true },
  { src: 'Reuters', text: 'Fed signals rate cut in Q2 2026', urgent: true },
  { src: 'CoinDesk', text: 'Ethereum gas fees drop 40%', urgent: false },
  { src: 'WSJ', text: 'Major exchange reports security breach', urgent: true },
  { src: 'FT', text: 'SEC approves new crypto ETF applications', urgent: true },
  { src: 'Whale Alert', text: 'Whale moves 10,000 BTC to unknown wallet', urgent: false },
  { src: 'CryptoQuant', text: 'Exchange reserves hit 2-year low', urgent: false },
  { src: 'CNBC', text: 'Institutional adoption accelerates', urgent: false },
  { src: 'Decrypt', text: 'DeFi protocol exploited for $12M', urgent: true },
  { src: 'The Block', text: 'Layer 2 TVL surpasses $50B', urgent: false },
]

export function LeftSidebar() {
  const [netPnl, setNetPnl] = useState(58296)
  const [positions, setPositions] = useState(POSITIONS)
  const [news, setNews] = useState<{ src: string; text: string; urgent: boolean }[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setNetPnl((prev) => prev + (Math.random() - 0.45) * 50)
      setPositions((prev) =>
        prev.map((p) => ({
          ...p,
          pnl: p.pnl + (Math.random() - 0.5) * 20,
        }))
      )
    }, 800)

    // News feed
    const newsInterval = setInterval(() => {
      const item = NEWS[index % NEWS.length]
      setNews((prev) => {
        const newNews = [item, ...prev]
        return newNews.slice(0, 6)
      })
      setIndex((i) => i + 1)
    }, 1200)

    return () => {
      clearInterval(interval)
      clearInterval(newsInterval)
    }
  }, [index])

  const formatPnl = (val: number) => (val >= 0 ? '+' : '') + val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return (
    <aside className="flex flex-col overflow-hidden bg-[rgba(10,3,0,0.7)] border-r border-[rgba(255,119,0,0.15)]">
      {/* Net PnL Section */}
      <div className="px-2.5 py-1.5 border-b border-[rgba(255,119,0,0.15)] bg-[rgba(0,255,157,0.03)]">
        <div className="text-[9px] text-[rgba(0,255,157,0.5)] tracking-[2px] font-[var(--font-orbitron)]">● NET PnL</div>
        <div className="font-[var(--font-orbitron)] text-[20px] font-black text-[#00ff9d] [text-shadow:var(--glow-green)] animate-[pnlPulse_1.5s_ease-in-out_infinite]">
          {formatPnl(netPnl)}
        </div>
      </div>

      {/* News Scanner Section */}
      <div className="border-b border-[rgba(255,119,0,0.15)] flex flex-col overflow-hidden shrink-0" style={{ maxHeight: '150px' }}>
        <div className="flex items-center justify-between px-2 py-1 bg-[rgba(10,3,0,0.8)] border-b border-[rgba(255,119,0,0.15)] shrink-0">
          <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#ffcc00] tracking-[1.5px] [text-shadow:0_0_6px_rgba(255,204,0,0.5)]">
            NEWS SCANNER
          </span>
          <span className="bg-[rgba(255,34,68,0.15)] border border-[rgba(255,34,68,0.5)] text-[#ff2244] text-[8px] px-1.5 py-0.5 rounded-sm tracking-[2px] font-[var(--font-orbitron)] animate-[liveBlink_1s_step-end_infinite]">
            LIVE
          </span>
        </div>
        <div className="overflow-hidden flex-1">
          {news.map((item, i) => (
            <div
              key={i}
              className={`px-2 py-1 border-b border-[rgba(255,119,0,0.04)] text-[9px] overflow-hidden text-ellipsis whitespace-nowrap animate-[sigFade_0.3s_ease] cursor-pointer hover:bg-[rgba(255,119,0,0.05)] ${
                item.urgent ? 'text-[#ff7700]' : 'text-[rgba(255,238,221,0.6)]'
              }`}
            >
              <span className={`mr-1 text-[8px] font-bold ${item.urgent ? 'text-[#ff2244]' : 'text-[#ffcc00]'}`}>
                {item.src}
              </span>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Positions Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-2 py-1 border-b border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.6)] shrink-0">
          <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#00ff9d] tracking-[1.5px] [text-shadow:0_0_6px_rgba(0,255,157,0.5)]">
            OPEN POSITIONS
          </span>
        </div>
        <div className="grid grid-cols-[1fr_55px_40px] px-2 py-1 text-[9px] text-[rgba(255,119,0,0.4)] tracking-[1px] border-b border-[rgba(255,119,0,0.08)] shrink-0">
          <span>ASSET</span>
          <span className="text-right">NET PnL</span>
          <span className="text-right">VOL</span>
        </div>
        <div className="flex-1 overflow-hidden">
          {positions.map((p, i) => {
            const isPos = p.pnl > 0
            return (
              <div
                key={i}
                className="grid grid-cols-[1fr_55px_40px] px-2 py-1 border-b border-[rgba(255,119,0,0.04)] text-[10px] hover:bg-[rgba(255,119,0,0.05)]"
              >
                <span className="text-[#ff7700] font-mono text-[10px]">{p.asset}</span>
                <span className={`text-right font-semibold ${isPos ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
                  {isPos ? '+' : ''}
                  {p.pnl.toFixed(2)}
                </span>
                <span className={`text-right text-[9px] ${isPos ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>{p.pct}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Model Confidence Section */}
      <div className="border-t border-[rgba(255,119,0,0.15)] px-2 py-1.5 shrink-0">
        <div className="text-[9px] text-[rgba(255,119,0,0.4)] tracking-[1px] mb-1 font-[var(--font-orbitron)]">
          MODEL CONFIDENCE
        </div>
        {[
          { name: 'Mirofish', val: 100, color: 'cyan' },
          { name: 'OPUS', val: 100, color: 'cyan' },
          { name: 'PolyIntel', val: 100, color: 'cyan' },
          { name: 'Minfistai', val: 97, color: 'magenta' },
        ].map((model, i) => (
          <div key={i} className="mb-1">
            <div className="flex justify-between">
              <span className={`text-[10px] ${model.color === 'magenta' ? 'text-[#ff00aa]' : 'text-[#ff7700]'}`}>
                {model.name}
              </span>
              <span className={`text-[9px] ${model.color === 'magenta' ? 'text-[#ff00aa]' : 'text-[#00ff9d]'}`}>
                {model.val}%
              </span>
            </div>
            <div className="h-1 bg-[rgba(255,119,0,0.1)] rounded-sm overflow-hidden">
              <div
                className={`h-full rounded-sm animate-[confAnim_3s_ease-in-out_infinite] ${
                  model.color === 'magenta'
                    ? 'bg-gradient-to-r from-[#ff00aa] to-[#ff7700]'
                    : 'bg-gradient-to-r from-[#ff7700] to-[#00ff9d]'
                }`}
                style={{ width: `${model.val}%`, animationDelay: `${i * 0.3}s` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Risk Heatmap Section */}
      <div className="border-t border-[rgba(255,119,0,0.15)] px-2 py-1 shrink-0">
        <div className="font-[var(--font-orbitron)] text-[9px] font-bold text-[#ff7700] tracking-[1.5px] mb-0.5">
          RISK HEATMAP ● LIVE
        </div>
        <div className="grid grid-cols-7 gap-0.5 mt-0.5">
          {[
            { bg: '#00ff9d', txt: '+' }, { bg: 'rgba(0,255,157,0.6)', txt: '↑' }, { bg: 'rgba(255,204,0,0.6)', txt: '~' },
            { bg: 'rgba(255,34,68,0.6)', txt: '↓' }, { bg: '#ff2244', txt: '-' }, { bg: '#00ff9d', txt: '+' },
            { bg: 'rgba(0,255,157,0.6)', txt: '↑' }, { bg: 'rgba(255,204,0,0.6)', txt: '~' }, { bg: 'rgba(255,34,68,0.6)', txt: '↓' },
            { bg: '#ff2244', txt: '-' }, { bg: '#00ff9d', txt: '+' }, { bg: 'rgba(0,255,157,0.6)', txt: '↑' },
            { bg: 'rgba(255,204,0,0.6)', txt: '~' }, { bg: 'rgba(255,34,68,0.6)', txt: '↓' }, { bg: '#ff2244', txt: '-' },
          ].map((cell, i) => (
            <div
              key={i}
              className="h-[12px] rounded-sm text-[6px] flex items-center justify-center text-[rgba(0,0,0,0.8)] font-bold font-mono transition-all duration-500 cursor-pointer"
              style={{ backgroundColor: cell.bg }}
            >
              {cell.txt}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
