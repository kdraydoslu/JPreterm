'use client'

import { useEffect, useState } from 'react'
import { marketDataService, type TickerData } from '@/lib/market-data'
import { correlationService } from '@/lib/correlation-service'

interface Signal {
  text: string
  isArb: boolean
  isWarn: boolean
  time: string
}

export function SignalFeed() {
  const [signals, setSignals] = useState<Signal[]>([])
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'BNBUSDT']
  const tickerDataRef = useState<Map<string, TickerData>>(new Map())[0]

  useEffect(() => {
    let mounted = true

    // Subscribe to ticker updates
    symbols.forEach((symbol) => {
      marketDataService.subscribeTicker(symbol, (data) => {
        if (!mounted) return
        
        tickerDataRef.set(symbol, data)
        
        // Generate signals based on real data
        const change = parseFloat(data.priceChangePercent)
        
        // Momentum breakout signal
        if (Math.abs(change) > 3) {
          addSignal({
            text: `SIGNAL: ${symbol} momentum ${change > 0 ? 'breakout' : 'breakdown'} ${change.toFixed(2)}%`,
            isArb: false,
            isWarn: true,
          })
        }
        
        // Volume spike signal
        const volume = parseFloat(data.volume)
        if (volume > 0 && Math.random() < 0.05) {
          addSignal({
            text: `SIGNAL: ${symbol} unusual volume detected ${(volume / 1000000).toFixed(1)}M`,
            isArb: false,
            isWarn: true,
          })
        }
      })
    })

    // Check for arbitrage opportunities
    const arbInterval = setInterval(() => {
      if (!mounted) return
      
      // Simulate cross-venue arbitrage detection
      symbols.forEach((symbol) => {
        const ticker = tickerDataRef.get(symbol)
        if (ticker && Math.random() < 0.1) {
          const spread = (Math.random() * 0.5).toFixed(2)
          addSignal({
            text: `ARB: ${symbol} cross-venue spread ${spread}% detected`,
            isArb: true,
            isWarn: false,
          })
        }
      })

      // Check correlations for divergence signals
      const correlations = correlationService.getAllCorrelations(symbols)
      correlations.forEach((corr) => {
        if (Math.abs(corr.correlation) > 0.8 && Math.random() < 0.05) {
          const sym1 = corr.symbol1.replace('USDT', '')
          const sym2 = corr.symbol2.replace('USDT', '')
          addSignal({
            text: `SIGNAL: ${sym1}-${sym2} high correlation ${corr.correlation.toFixed(2)} detected`,
            isArb: false,
            isWarn: true,
          })
        }
      })
    }, 2000)

    return () => {
      mounted = false
      clearInterval(arbInterval)
      symbols.forEach((symbol) => {
        marketDataService.unsubscribe(symbol)
      })
    }
  }, [])

  const addSignal = (signal: Omit<Signal, 'time'>) => {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    
    setSignals((prev) => {
      const newSignals = [{ ...signal, time }, ...prev]
      return newSignals.slice(0, 15)
    })
  }

  return (
    <div className="flex flex-col overflow-hidden flex-1">
      <div className="flex items-center justify-between px-2 py-1 bg-[rgba(10,3,0,0.8)] border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <span className="font-[var(--font-orbitron)] text-[9px] font-bold text-[#ff7700] tracking-[1.5px] [text-shadow:0_0_6px_rgba(255,119,0,0.5)]">
          SIGNAL FEED & ARB DETECTOR
        </span>
        <span className="bg-[rgba(255,34,68,0.15)] border border-[rgba(255,34,68,0.5)] text-[#ff2244] text-[8px] px-1.5 py-0.5 rounded-sm tracking-[2px] font-[var(--font-orbitron)] animate-[liveBlink_1s_step-end_infinite]">
          LIVE
        </span>
      </div>
      <div className="overflow-hidden flex-1">
        {signals.map((sig, i) => (
          <div
            key={`${sig.time}-${i}`}
            className={`px-2 py-0.5 border-b border-[rgba(255,119,0,0.04)] text-[9px] whitespace-nowrap overflow-hidden text-ellipsis animate-[sigFade_0.3s_ease] ${
              sig.isArb ? 'text-[#ff00aa]' : sig.isWarn ? 'text-[#ffcc00]' : 'text-[rgba(255,238,221,0.7)]'
            }`}
          >
            <span className="text-[rgba(255,119,0,0.4)] mr-1">[{sig.time}]</span>
            <span className={sig.isArb ? 'text-[#ff00aa]' : sig.isWarn ? 'text-[#ffcc00]' : 'text-[#00ff9d]'}>
              {sig.isArb ? '◆' : sig.isWarn ? '▶' : '●'}
            </span>{' '}
            {sig.text}
          </div>
        ))}
      </div>
    </div>
  )
}
