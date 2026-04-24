'use client'

import { useEffect, useState } from 'react'
import { polymarketService } from '@/lib/polymarket-service'
import { useWallet } from '@/components/wallet-provider'

export function TopBar() {
  const { address, isConnected, connect, disconnect, balance } = useWallet()
  const [time, setTime] = useState('--:--:--.---')
  const [pnl, setPnl] = useState(0)
  const [winRate, setWinRate] = useState(0)
  const [riskDeployed, setRiskDeployed] = useState(0)
  const [totalValue, setTotalValue] = useState(0)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date()
      const h = String(now.getUTCHours()).padStart(2, '0')
      const m = String(now.getUTCMinutes()).padStart(2, '0')
      const s = String(now.getUTCSeconds()).padStart(2, '0')
      const ms = String(now.getUTCMilliseconds()).padStart(3, '0')
      setTime(`${h}:${m}:${s}.${ms}`)
    }, 50)

    const checkConfig = () => {
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('polymarket_config')
        if (savedConfig) {
          setIsConfigured(true)
          polymarketService.fetchBalance().then(bal => setTotalValue(bal.usdc + (bal.eth * 3500)))
          polymarketService.fetchPositions().then(pos => setPnl(pos.reduce((acc, p) => acc + p.pnl, 0)))
        }
      }
    }

    checkConfig()
    const configInterval = setInterval(checkConfig, 30000)

    return () => {
      clearInterval(clockInterval)
      clearInterval(configInterval)
    }
  }, [])

  const formatPnl = (val: number) => (val >= 0 ? '+' : '') + val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return (
    <header className="bg-gradient-to-b from-[rgba(10,3,0,0.95)] to-[rgba(10,3,0,0.9)] border-b border-[rgba(255,119,0,0.4)] flex items-center px-2.5 gap-2 shadow-[0_2px_20px_rgba(255,119,0,0.1)] h-[40px]">
      {/* Logo */}
      <div className="w-6 h-6 border-2 border-[#ff7700] rounded-md flex items-center justify-center shadow-[var(--glow-orange)] mr-1 relative overflow-hidden">
        <div className="absolute inset-[2px] bg-gradient-to-br from-[rgba(255,119,0,0.3)] to-transparent animate-[logoShimmer_3s_ease-in-out_infinite]" />
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="relative z-10">
          <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" stroke="#ff7700" strokeWidth="1" fill="none" />
          <polygon points="8,4 12,6.5 12,9.5 8,12 4,9.5 4,6.5" fill="rgba(255,119,0,0.3)" />
        </svg>
      </div>

      <div className="font-[var(--font-orbitron)] text-[14px] font-black text-[#ff7700] [text-shadow:var(--glow-orange)] tracking-[2px] whitespace-nowrap">
        JARVIS <span className="text-[#00ff9d]">PRE TERM</span>
      </div>

      <div className="font-mono text-[10px] text-[rgba(255,119,0,0.7)] border border-[rgba(255,119,0,0.2)] px-2 py-0.5 rounded-sm bg-[rgba(255,119,0,0.05)]">
        UTC <span className="text-[#ff7700]">{time}</span>
      </div>

      <div className="bg-[rgba(255,34,68,0.15)] border border-[rgba(255,34,68,0.5)] text-[#ff2244] text-[8px] px-1.5 py-0.5 rounded-sm tracking-[2px] font-[var(--font-orbitron)] animate-[liveBlink_1s_step-end_infinite]">
        ● LIVE
      </div>

      <div className="bg-[rgba(0,255,157,0.05)] border border-[rgba(0,255,157,0.3)] rounded px-3 py-0.5 text-center shadow-[0_0_15px_rgba(0,255,157,0.15)]">
        <div className="text-[8px] text-[rgba(0,255,157,0.6)] tracking-[2px] font-[var(--font-orbitron)]">NET PnL</div>
        <div className="font-[var(--font-orbitron)] text-[18px] font-black text-[#00ff9d] [text-shadow:var(--glow-green)] animate-[pnlPulse_2s_ease-in-out_infinite] tracking-[1px]">
          {formatPnl(pnl)}
        </div>
      </div>

      <div className="flex-1" />

      {/* Portfolio Summary */}
      <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded px-2.5 py-0.5 mr-2">
        <div className="text-[7px] text-[rgba(255,119,0,0.6)] tracking-[1px] font-[var(--font-orbitron)] mb-0.5">
          PORTFOLIO
        </div>
        <div className="flex gap-2.5 items-center">
          <div>
            <div className="text-[6px] text-[rgba(255,119,0,0.5)]">Total Value</div>
            <div className="font-mono text-[10px] text-[#ff7700]">${(totalValue / 1000).toFixed(1)}K</div>
          </div>
          <div>
            <div className="text-[6px] text-[rgba(255,119,0,0.5)]">Open Positions</div>
            <div className="font-mono text-[10px] text-[#ffcc00]">{isConfigured ? 'AUTO' : '0'}</div>
          </div>
          <div>
            <div className="text-[6px] text-[rgba(255,119,0,0.5)]">24h P&L</div>
            <div className="font-mono text-[10px] text-[#00ff9d]">{formatPnl(pnl)}</div>
          </div>
        </div>
      </div>

      <button 
        onClick={isConnected ? disconnect : connect}
        className="bg-gradient-to-r from-[#ff7700] to-[#00ff9d] text-[#050100] px-2.5 py-1 rounded font-[var(--font-orbitron)] text-[9px] font-bold tracking-[1px] hover:shadow-[0_0_20px_rgba(255,119,0,0.5)] transition-all"
      >
        {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'CONNECT WALLET'}
      </button>

      {isConnected && balance && (
        <div className="bg-[rgba(0,255,157,0.1)] border border-[rgba(0,255,157,0.3)] rounded px-2 py-0.5">
          <div className="text-[7px] text-[rgba(0,255,157,0.6)]">ETH BALANCE</div>
          <div className="font-mono text-[10px] text-[#00ff9d] font-bold">{balance}</div>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-8 h-8 rounded-full border-2 border-[#00ff9d] flex items-center justify-center font-[var(--font-orbitron)] text-[9px] font-bold text-[#00ff9d] [text-shadow:var(--glow-green)] shadow-[var(--glow-green)] bg-[rgba(0,255,157,0.05)] animate-[winPulse_3s_ease-in-out_infinite]">
            {winRate}%
          </div>
          <label className="text-[7px] text-[rgba(0,255,157,0.5)] tracking-[1px]">WIN RATE</label>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="text-[7px] text-[rgba(255,119,0,0.5)] tracking-[1px] font-[var(--font-orbitron)]">RISK DEPLOYED</div>
          <div className="w-16 h-1.5 bg-[rgba(255,119,0,0.1)] rounded-sm border border-[rgba(255,119,0,0.2)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00ff9d] to-[#ff7700] rounded-sm shadow-[var(--glow-orange)] animate-[riskAnim_4s_ease-in-out_infinite]"
              style={{ width: `${riskDeployed}%` }}
            />
          </div>
          <div className="text-[8px] text-[#ff7700] font-[var(--font-orbitron)]">{riskDeployed.toFixed(1)}%</div>
        </div>
      </div>
    </header>
  )
}
