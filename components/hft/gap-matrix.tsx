'use client'

import { useEffect, useState } from 'react'

const ASSETS = ['BTC', 'ETH', 'SOL', 'XRP', 'NVDA', 'AAPL', 'TSLA', 'THYAO', 'GARAN', 'TOASO', 'MAUK', 'THOX']

interface GapCell {
  ticker: string
  val: number
}

interface WhaleMove {
  time: string
  asset: string
  amount: string
  type: 'IN' | 'OUT'
  exchange: string
}

export function GapMatrix() {
  const [cells, setCells] = useState<GapCell[]>([])
  const [whaleMoves, setWhaleMoves] = useState<WhaleMove[]>([])

  useEffect(() => {
    const update = () => {
      setCells(
        ASSETS.map((ticker) => ({
          ticker,
          val: (Math.random() - 0.45) * 3,
        }))
      )
    }

    update()
    const interval = setInterval(update, 600)

    // Generate whale movements
    const generateWhaleMove = () => {
      const assets = ['BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'ADA']
      const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit']
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      
      const newMove: WhaleMove = {
        time,
        asset: assets[Math.floor(Math.random() * assets.length)],
        amount: `${(Math.random() * 5000 + 500).toFixed(0)}`,
        type: Math.random() > 0.5 ? 'IN' : 'OUT',
        exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
      }

      setWhaleMoves((prev) => {
        const updated = [newMove, ...prev]
        return updated.slice(0, 6)
      })
    }

    // Initial whale moves
    for (let i = 0; i < 6; i++) {
      setTimeout(generateWhaleMove, i * 500)
    }

    const whaleInterval = setInterval(generateWhaleMove, 5000)

    return () => {
      clearInterval(interval)
      clearInterval(whaleInterval)
    }
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-1.5 py-0.5 text-[8px] text-[rgba(255,0,170,0.6)] tracking-[1px] border-b border-[rgba(255,0,170,0.1)] shrink-0 font-[var(--font-orbitron)]">
        MISPRICING HIGHLIGHTS
      </div>
      <div className="grid grid-cols-6 gap-0.5 p-1 overflow-hidden" style={{ height: '60%' }}>
        {cells.map((cell, i) => {
          const isHot = cell.val > 0.5
          const isPos = cell.val > 0
          const isNeg = cell.val < -0.5
          let className =
            'rounded-sm flex flex-col items-center justify-center px-0.5 py-1 text-[7px] border border-[rgba(255,119,0,0.1)] cursor-pointer transition-all duration-200 hover:border-[#ff7700]'
          if (isHot) {
            className +=
              ' bg-[rgba(255,0,170,0.15)] border-[rgba(255,0,170,0.4)] animate-[hotPulse_1s_ease-in-out_infinite]'
          } else if (isPos) {
            className += ' bg-[rgba(0,255,157,0.12)] border-[rgba(0,255,157,0.3)]'
          } else if (isNeg) {
            className += ' bg-[rgba(255,34,68,0.12)] border-[rgba(255,34,68,0.3)]'
          } else {
            className += ' bg-[rgba(255,34,68,0.12)] border-[rgba(255,34,68,0.3)]'
          }

          return (
            <div key={i} className={className}>
              <span className="text-[#ff7700] font-bold text-[7px]">{cell.ticker}</span>
              <span className={`font-mono text-[8px] ${cell.val >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
                {cell.val >= 0 ? '+' : ''}
                {cell.val.toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Whale Movements Section */}
      <div className="flex-1 border-t border-[rgba(255,119,0,0.15)] overflow-hidden flex flex-col">
        <div className="px-1.5 py-0.5 text-[8px] text-[rgba(255,119,0,0.6)] tracking-[1px] border-b border-[rgba(255,119,0,0.1)] shrink-0 font-[var(--font-orbitron)] bg-[rgba(10,3,0,0.6)]">
          🐋 WHALE MOVEMENTS
        </div>
        <div className="flex-1 overflow-hidden">
          {whaleMoves.map((move, i) => (
            <div
              key={i}
              className="px-1.5 py-1 border-b border-[rgba(255,119,0,0.04)] text-[8px] hover:bg-[rgba(255,119,0,0.05)] animate-[whaleSlide_0.3s_ease]"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[rgba(255,119,0,0.4)] font-mono text-[7px]">{move.time}</span>
                <span className={`px-1 py-0.5 rounded text-[7px] font-bold ${
                  move.type === 'IN' 
                    ? 'bg-[rgba(0,255,157,0.2)] text-[#00ff9d]' 
                    : 'bg-[rgba(255,34,68,0.2)] text-[#ff2244]'
                }`}>
                  {move.type === 'IN' ? '↓ IN' : '↑ OUT'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#ff7700] font-bold">{move.asset}</span>
                <span className="text-[rgba(255,238,221,0.9)] font-mono">{move.amount}</span>
              </div>
              <div className="text-[rgba(255,119,0,0.5)] text-[7px] mt-0.5">
                {move.exchange}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
