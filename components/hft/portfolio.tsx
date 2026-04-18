'use client'

import { useEffect, useState } from 'react'
import { marketDataService } from '@/lib/market-data'
import { polymarketService, type Position as PolyPosition, type WalletBalance } from '@/lib/polymarket-service'

interface Position {
  symbol: string
  side: 'LONG' | 'SHORT'
  size: number
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  leverage: number
}

export function Portfolio() {
  const [positions, setPositions] = useState<Position[]>([])
  const [polyPositions, setPolyPositions] = useState<PolyPosition[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [totalPnL, setTotalPnL] = useState(0)
  const [dailyPnL, setDailyPnL] = useState(0)
  const [balance, setBalance] = useState<WalletBalance>({ usdc: 0, eth: 0, available: 0 })
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('polymarket_config')
      if (savedConfig) {
        setIsConfigured(true)
        polymarketService.fetchBalance().then(setBalance)
        polymarketService.fetchPositions().then(setPolyPositions)
      }
    }
  }, [])

  useEffect(() => {
    if (!isConfigured) return

    const interval = setInterval(() => {
      polymarketService.fetchBalance().then(setBalance)
      polymarketService.fetchPositions().then(setPolyPositions)
    }, 10000)

    return () => clearInterval(interval)
  }, [isConfigured])

  // Aggregate total value
  useEffect(() => {
    setTotalValue(balance.usdc + (balance.eth * 3500)) // ETH price estimate
    setTotalPnL(polyPositions.reduce((acc, p) => acc + p.pnl, 0))
  }, [balance, polyPositions])

  const totalPositionPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0)

  return (
    <div className="h-full bg-[rgba(10,3,0,0.9)] p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-[var(--font-orbitron)] text-3xl font-bold text-[#ff7700] mb-8 [text-shadow:var(--glow-orange)]">
          Portfolio Management
        </h1>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-6">
            <div className="text-[rgba(255,119,0,0.6)] text-sm mb-3 font-medium">Total Portfolio Value</div>
            <div className="font-[var(--font-orbitron)] text-2xl text-[#ff7700] mb-2 font-bold">
              ${totalValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </div>
            <div className="text-[#00ff9d] text-base font-semibold">+2.34% (24h)</div>
          </div>

          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-6">
            <div className="text-[rgba(255,119,0,0.6)] text-sm mb-3 font-medium">Total P&L</div>
            <div className={`font-[var(--font-orbitron)] text-2xl mb-2 font-bold ${totalPnL >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </div>
            <div className="text-[rgba(255,119,0,0.6)] text-base">All Time</div>
          </div>

          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-6">
            <div className="text-[rgba(255,119,0,0.6)] text-sm mb-3 font-medium">Daily P&L</div>
            <div className={`font-[var(--font-orbitron)] text-2xl mb-2 font-bold ${dailyPnL >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
              {dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </div>
            <div className="text-[rgba(255,119,0,0.6)] text-base">Last 24h</div>
          </div>

          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-6">
            <div className="text-[rgba(255,119,0,0.6)] text-sm mb-3 font-medium">Open Positions</div>
            <div className="font-[var(--font-orbitron)] text-2xl text-[#ffcc00] mb-2 font-bold">
              {positions.length}
            </div>
            <div className={`text-base font-semibold ${totalPositionPnL >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
              {totalPositionPnL >= 0 ? '+' : ''}${totalPositionPnL.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Active Positions */}
        <div className="mb-8">
          <h2 className="font-[var(--font-orbitron)] text-xl font-bold text-[#00ff9d] mb-6 [text-shadow:var(--glow-green)]">
            Active Positions
          </h2>
          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[rgba(10,1,0,0.8)] border-b border-[rgba(255,119,0,0.2)]">
                <tr>
                  <th className="text-left px-6 py-3 text-[rgba(255,119,0,0.6)] text-sm font-[var(--font-orbitron)]">Symbol</th>
                  <th className="text-left px-6 py-3 text-[rgba(255,119,0,0.6)] text-sm font-[var(--font-orbitron)]">Side</th>
                  <th className="text-right px-6 py-3 text-[rgba(255,119,0,0.6)] text-sm font-[var(--font-orbitron)]">Size</th>
                  <th className="text-right px-6 py-3 text-[rgba(255,119,0,0.6)] text-sm font-[var(--font-orbitron)]">Entry</th>
                  <th className="text-right px-6 py-3 text-[rgba(255,119,0,0.6)] text-sm font-[var(--font-orbitron)]">Current</th>
                  <th className="text-right px-6 py-3 text-[rgba(255,119,0,0.6)] text-sm font-[var(--font-orbitron)]">Leverage</th>
                  <th className="text-right px-6 py-3 text-[rgba(255,119,0,0.6)] text-sm font-[var(--font-orbitron)]">P&L</th>
                  <th className="text-right px-6 py-3 text-[rgba(255,119,0,0.6)] text-sm font-[var(--font-orbitron)]">P&L %</th>
                  <th className="text-center px-6 py-3 text-[rgba(255,119,0,0.6)] text-sm font-[var(--font-orbitron)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, i) => (
                  <tr key={i} className="border-b border-[rgba(255,119,0,0.1)] hover:bg-[rgba(10,3,0,0.4)]">
                    <td className="px-6 py-4 text-[#ff7700] font-[var(--font-orbitron)] text-base font-semibold">
                      {pos.symbol.replace('USDT', '/USDT')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded text-sm font-bold ${
                        pos.side === 'LONG' 
                          ? 'bg-[rgba(0,255,157,0.2)] text-[#00ff9d]' 
                          : 'bg-[rgba(255,34,68,0.2)] text-[#ff2244]'
                      }`}>
                        {pos.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[rgba(255,238,221,0.9)] text-base">
                      {pos.size}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[rgba(255,238,221,0.9)] text-base">
                      ${pos.entryPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[#ff7700] text-base font-semibold">
                      ${pos.currentPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[#ffcc00] text-base font-semibold">
                      {pos.leverage}x
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold text-base ${
                      pos.pnl >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'
                    }`}>
                      {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold text-base ${
                      pos.pnlPercent >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'
                    }`}>
                      {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="bg-[rgba(255,34,68,0.2)] border border-[#ff2244] text-[#ff2244] px-4 py-2 rounded text-sm font-semibold hover:bg-[rgba(255,34,68,0.3)] transition-colors">
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-6">
            <h3 className="font-[var(--font-orbitron)] text-base font-bold text-[#ff7700] mb-6">
              Asset Allocation
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Bitcoin', percent: 45, color: '#ff7700' },
                { name: 'Ethereum', percent: 30, color: '#00ff9d' },
                { name: 'Solana', percent: 15, color: '#ff00aa' },
                { name: 'Others', percent: 10, color: '#ffcc00' },
              ].map((asset) => (
                <div key={asset.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-[rgba(255,119,0,0.8)] text-base font-medium">{asset.name}</span>
                    <span className="text-[#ff7700] text-base font-mono font-semibold">{asset.percent}%</span>
                  </div>
                  <div className="h-3 bg-[rgba(255,119,0,0.1)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${asset.percent}%`, backgroundColor: asset.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-6">
            <h3 className="font-[var(--font-orbitron)] text-base font-bold text-[#ff7700] mb-6">
              Risk Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[rgba(255,119,0,0.6)] text-base">Total Exposure</span>
                <span className="text-[#ffcc00] font-mono text-base font-semibold">$1.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgba(255,119,0,0.6)] text-base">Margin Used</span>
                <span className="text-[#ff2244] font-mono text-base font-semibold">68.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgba(255,119,0,0.6)] text-base">Available Margin</span>
                <span className="text-[#00ff9d] font-mono text-base font-semibold">$456K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgba(255,119,0,0.6)] text-base">Liquidation Risk</span>
                <span className="text-[#00ff9d] font-mono text-base font-semibold">Low</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgba(255,119,0,0.6)] text-base">Sharpe Ratio</span>
                <span className="text-[#ff7700] font-mono text-base font-semibold">2.34</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
