'use client'

import { useEffect, useState, useCallback } from 'react'

const SECTORS = ['TECH', 'FIN', 'ENE', 'HLT', 'CONS', 'IND', 'MAT']

export function BottomBar() {
  const [tape, setTape] = useState<string[]>([])
  const [gainers, setGainers] = useState([
    { sym: 'High', val: 1.25, up: true },
    { sym: '↑ High', val: 1.36, up: true },
    { sym: 'Gamers', val: -16.75, up: false },
    { sym: '↓ Losers', val: -56.25, up: false },
  ])
  const [liqGrid, setLiqGrid] = useState<{ bg: string; txt: string }[]>([])
  const [fundingRate, setFundingRate] = useState(0.0108)
  const [sectors, setSectors] = useState<{ s: string; v: number }[]>([])
  const [volBars, setVolBars] = useState<number[]>([])
  const [activePos, setActivePos] = useState(7929.78)
  const [profitToday, setProfitToday] = useState(-5.5)
  const [riskExposure, setRiskExposure] = useState(-65.3)

  const buildTape = useCallback(() => {
    const assets = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'NVDA', 'AAPL', 'TSLA', 'THYAO', 'GARAN', 'SPX', 'BIST', 'BNB/USDT']
    const now = new Date()
    const ts = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`

    return Array.from({ length: 40 }, () => {
      const asset = assets[Math.floor(Math.random() * assets.length)]
      const side = Math.random() > 0.45 ? 'BUY' : 'SELL'
      const price = (10 + Math.random() * 30000).toFixed(2)
      const size = Math.floor(50 + Math.random() * 2000)
      return `${ts}|${side}|${asset}|${price}|${size}`
    })
  }, [])

  useEffect(() => {
    setTape(buildTape())

    const intervals: NodeJS.Timeout[] = []

    intervals.push(
      setInterval(() => {
        setTape(buildTape())
      }, 8000)
    )

    intervals.push(
      setInterval(() => {
        setGainers((prev) =>
          prev.map((g) => ({
            ...g,
            val: g.val + (Math.random() - 0.5) * 0.2,
          }))
        )
      }, 600)
    )

    intervals.push(
      setInterval(() => {
        setLiqGrid(
          Array.from({ length: 15 }, () => {
            const v = Math.random()
            if (v > 0.7) return { bg: '#00ff9d', txt: 'L' }
            if (v > 0.4) return { bg: 'rgba(255,102,0,0.8)', txt: 'M' }
            return { bg: '#ff2244', txt: 'S' }
          })
        )
      }, 700)
    )

    intervals.push(
      setInterval(() => {
        setSectors(SECTORS.map((s) => ({ s, v: (Math.random() - 0.3) * 40 })))
      }, 800)
    )

    intervals.push(
      setInterval(() => {
        setVolBars(Array.from({ length: 15 }, () => 10 + Math.random() * 90))
      }, 600)
    )

    intervals.push(
      setInterval(() => {
        setActivePos((prev) => prev + (Math.random() - 0.48) * 100)
        setProfitToday((prev) => prev + (Math.random() - 0.5) * 2)
        setRiskExposure((prev) => prev + (Math.random() - 0.5) * 5)
        setFundingRate(0.01 + Math.random() * 0.005)
      }, 400)
    )

    // Initial updates
    setLiqGrid(
      Array.from({ length: 15 }, () => {
        const v = Math.random()
        if (v > 0.7) return { bg: '#00ff9d', txt: 'L' }
        if (v > 0.4) return { bg: 'rgba(255,102,0,0.8)', txt: 'M' }
        return { bg: '#ff2244', txt: 'S' }
      })
    )
    setSectors(SECTORS.map((s) => ({ s, v: (Math.random() - 0.3) * 40 })))
    setVolBars(Array.from({ length: 15 }, () => 10 + Math.random() * 90))

    return () => intervals.forEach(clearInterval)
  }, [buildTape])

  const parseTapeItem = (item: string) => {
    const [ts, side, asset, price, size] = item.split('|')
    return { ts, side, asset, price, size }
  }

  return (
    <footer className="bg-[rgba(10,3,0,0.97)] border-t border-[rgba(255,119,0,0.4)] overflow-hidden flex flex-col py-1 h-[90px]">
      {/* Tape Row */}
      <div className="flex items-center py-1 px-2 overflow-hidden h-[22px] shrink-0">
        <div className="text-[8px] text-[rgba(255,119,0,0.4)] bg-[rgba(10,1,0,0.9)] border-r border-[rgba(255,119,0,0.15)] px-2 py-0.5 font-[var(--font-orbitron)] tracking-[1px] shrink-0 whitespace-nowrap">
          LIVE ACTIVITY TAPE
        </div>
        <div className="overflow-hidden flex-1 relative">
          <div className="flex gap-0 animate-[tickerScroll_60s_linear_infinite]" style={{ width: 'max-content' }}>
            {[...tape, ...tape].map((item, i) => {
              const { ts, side, asset, price, size } = parseTapeItem(item)
              return (
                <div key={i} className="flex items-center gap-1.5 px-2.5 border-r border-[rgba(255,119,0,0.1)] text-[10px] whitespace-nowrap">
                  <span className="text-[rgba(255,119,0,0.4)] text-[9px]">{ts}</span>
                  <span className={side === 'BUY' ? 'text-[#00ff9d] font-semibold' : 'text-[#ff2244] font-semibold'}>{side}</span>
                  <span className="text-[#ff7700] text-[10px] font-medium">{asset}</span>
                  <span className="text-[rgba(255,238,221,0.9)]">{price}</span>
                  <span className="text-[rgba(255,238,221,0.5)] text-[9px]">{size}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="flex gap-1 px-1.5 pb-1 flex-1 overflow-hidden min-h-0">
        {/* Gainers/Losers */}
        <div className="flex-1 bg-[rgba(10,1,0,0.8)] border border-[rgba(255,119,0,0.15)] rounded-sm px-1.5 py-1 overflow-hidden flex flex-col min-w-0">
          <div className="font-[var(--font-orbitron)] text-[7px] text-[rgba(255,119,0,0.5)] tracking-[1px] border-b border-[rgba(255,119,0,0.08)] pb-0.5 mb-0.5 shrink-0">
            GAINERS/LOSERS
          </div>
          <div className="flex flex-col gap-0.5 flex-1 justify-center min-h-0">
            {gainers.slice(0, 3).map((g, i) => (
              <div key={i} className="flex justify-between text-[8px]">
                <span className="text-[#ff7700] truncate font-medium">{g.sym}</span>
                <span className={`font-semibold ${g.val >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
                  {g.val >= 0 ? '+' : ''}
                  {g.val.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Liquidations */}
        <div className="flex-1 bg-[rgba(10,1,0,0.8)] border border-[rgba(255,119,0,0.15)] rounded-sm px-1.5 py-1 overflow-hidden flex flex-col min-w-0">
          <div className="font-[var(--font-orbitron)] text-[7px] text-[rgba(255,119,0,0.5)] tracking-[1px] border-b border-[rgba(255,119,0,0.08)] pb-0.5 mb-0.5 shrink-0">
            LIQUIDATIONS
          </div>
          <div className="flex-1 flex flex-col justify-center min-h-0">
            <div className="grid grid-cols-5 gap-[2px]">
              {liqGrid.slice(0, 10).map((cell, i) => (
                <div
                  key={i}
                  className="rounded-[1px] flex items-center justify-center text-[7px] font-mono text-[rgba(0,0,0,0.9)] font-bold transition-all duration-300 h-[7px]"
                  style={{ backgroundColor: cell.bg }}
                >
                  {cell.txt}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Funding Rates */}
        <div className="flex-1 bg-[rgba(10,1,0,0.8)] border border-[rgba(255,119,0,0.15)] rounded-sm px-1.5 py-1 overflow-hidden flex flex-col min-w-0">
          <div className="font-[var(--font-orbitron)] text-[7px] text-[rgba(255,119,0,0.5)] tracking-[1px] border-b border-[rgba(255,119,0,0.08)] pb-0.5 mb-0.5 shrink-0">
            FUNDING
          </div>
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            <div className="font-[var(--font-orbitron)] text-[13px] font-black text-[#ff7700] [text-shadow:var(--glow-orange)]">
              {fundingRate.toFixed(4)}%
            </div>
            <div className="text-[7px] text-[rgba(255,119,0,0.4)]">BTC 8H</div>
          </div>
        </div>

        {/* Sector Performance */}
        <div className="flex-1 bg-[rgba(10,1,0,0.8)] border border-[rgba(255,119,0,0.15)] rounded-sm px-1.5 py-1 overflow-hidden flex flex-col min-w-0">
          <div className="font-[var(--font-orbitron)] text-[7px] text-[rgba(255,119,0,0.5)] tracking-[1px] border-b border-[rgba(255,119,0,0.08)] pb-0.5 mb-0.5 shrink-0">
            SECTORS
          </div>
          <div className="flex items-end gap-0.5 flex-1 min-h-0">
            {sectors.map((d, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-[1px] transition-all duration-500 ${d.v >= 0 ? 'bg-[#00ff9d]' : 'bg-[#ff2244]'}`}
                style={{ height: `${Math.max(4, Math.abs(d.v) * 0.6)}px` }}
              />
            ))}
          </div>
        </div>

        {/* Daily Volume */}
        <div className="flex-1 bg-[rgba(10,1,0,0.8)] border border-[rgba(255,119,0,0.15)] rounded-sm px-1.5 py-1 overflow-hidden flex flex-col min-w-0">
          <div className="font-[var(--font-orbitron)] text-[7px] text-[rgba(255,119,0,0.5)] tracking-[1px] border-b border-[rgba(255,119,0,0.08)] pb-0.5 mb-0.5 shrink-0">
            VOLUME
          </div>
          <div className="flex items-end gap-[1px] flex-1 min-h-0">
            {volBars.slice(0, 12).map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[1px] bg-gradient-to-b from-[#ff7700] to-[rgba(255,119,0,0.3)] transition-all duration-300"
                style={{ height: `${v}%` }}
              />
            ))}
          </div>
        </div>

        {/* Active Positions */}
        <div className="flex-1 bg-[rgba(10,1,0,0.8)] border border-[rgba(255,119,0,0.15)] rounded-sm px-1.5 py-1 overflow-hidden flex flex-col min-w-0">
          <div className="font-[var(--font-orbitron)] text-[7px] text-[rgba(255,119,0,0.5)] tracking-[1px] border-b border-[rgba(255,119,0,0.08)] pb-0.5 mb-0.5 shrink-0">
            POSITIONS
          </div>
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            <div className="font-[var(--font-orbitron)] text-[11px] font-black text-[#00ff9d] [text-shadow:var(--glow-green)]">
              +{activePos.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </div>
            <div className="text-[7px] text-[rgba(0,255,157,0.4)]">PnL</div>
          </div>
        </div>

        {/* Profit Today */}
        <div className="flex-1 bg-[rgba(10,1,0,0.8)] border border-[rgba(255,119,0,0.15)] rounded-sm px-1.5 py-1 overflow-hidden flex flex-col min-w-0">
          <div className="font-[var(--font-orbitron)] text-[7px] text-[rgba(255,119,0,0.5)] tracking-[1px] border-b border-[rgba(255,119,0,0.08)] pb-0.5 mb-0.5 shrink-0">
            TODAY
          </div>
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            <div
              className={`font-[var(--font-orbitron)] text-[12px] font-black ${profitToday >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}
            >
              {profitToday >= 0 ? '+' : ''}
              {profitToday.toFixed(1)}
            </div>
            <div className="text-[7px] text-[rgba(255,119,0,0.4)]">SESSION</div>
          </div>
        </div>

        {/* Risk Exposure */}
        <div className="flex-1 bg-[rgba(10,1,0,0.8)] border border-[rgba(255,119,0,0.15)] rounded-sm px-1.5 py-1 overflow-hidden flex flex-col min-w-0">
          <div className="font-[var(--font-orbitron)] text-[7px] text-[rgba(255,119,0,0.5)] tracking-[1px] border-b border-[rgba(255,119,0,0.08)] pb-0.5 mb-0.5 shrink-0">
            RISK
          </div>
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            <div className="font-[var(--font-orbitron)] text-[11px] font-bold text-[#ff2244]">{riskExposure.toFixed(1)}%</div>
            <div className="w-full h-1.5 bg-[rgba(255,34,68,0.1)] rounded-sm overflow-hidden mt-0.5">
              <div className="h-full bg-[#ff2244] rounded-sm" style={{ width: `${Math.abs(riskExposure)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
