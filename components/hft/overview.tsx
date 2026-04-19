'use client'

import { useEffect, useState } from 'react'
import { marketDataService } from '@/lib/market-data'
import { polymarketService, type WalletBalance } from '@/lib/polymarket-service'

interface DashWidgetProps {
  title: string
  items: Array<{ name: string; value: string | number; change: number; sparkline: number[] }>
  color: string
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return <div className="w-16 h-8 bg-white/5 rounded animate-pulse" />
  
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 80
  const height = 30
  const step = width / (data.length - 1)
  
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(' ')
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function DashboardWidget({ title, items, color }: DashWidgetProps) {
  return (
    <div className="bg-[rgba(10,3,0,0.7)] border border-[rgba(255,119,0,0.15)] rounded-xl p-4 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
      <h3 className="text-[10px] font-black tracking-[0.25em] text-white/40 uppercase mb-4 ml-1">{title}</h3>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between group/item">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white/80 group-hover/item:text-[#ff7700] transition-colors">{item.name}</span>
              <span className="text-[14px] font-mono font-black text-white">{item.value}</span>
            </div>
            <div className="flex items-center gap-4">
              <Sparkline data={item.sparkline} color={item.change >= 0 ? '#00ff9d' : '#ff3333'} />
              <div className={`text-[10px] font-black font-mono w-14 text-right ${item.change >= 0 ? 'text-[#00ff9d]' : 'text-[#ff3333]'}`}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Overview() {
  const [clock, setClock] = useState('')
  const [portfolioValue, setPortfolioValue] = useState(12842.12)
  const [dailyPnL, setDailyPnL] = useState(420.69)
  
  const [indices, setIndices] = useState([
    { name: 'S&P 500', value: '5,248.80', change: 1.24, sparkline: [5200, 5210, 5205, 5230, 5240, 5248] },
    { name: 'NASDAQ', value: '16,428.10', change: 1.84, sparkline: [16200, 16300, 16250, 16400, 16350, 16428] },
    { name: 'GOLD', value: '2,384.10', change: -0.42, sparkline: [2400, 2390, 2395, 2380, 2385, 2384] },
    { name: 'CRUDE OIL', value: '82.14', change: -1.12, sparkline: [84, 83.5, 83.8, 83, 82.5, 82.14] },
  ])

  const [majorPairs, setMajorPairs] = useState([
    { name: 'BTC/USDT', value: '96,120.40', change: 2.14, sparkline: [94000, 95000, 94500, 95500, 96000, 96120] },
    { name: 'ETH/USDT', value: '3,248.12', change: 1.45, sparkline: [3150, 3200, 3180, 3220, 3230, 3248] },
    { name: 'EUR/USD', value: '1.0842', change: 0.12, sparkline: [1.083, 1.084, 1.0835, 1.0845, 1.084, 1.0842] },
    { name: 'SOL/USDT', value: '184.22', change: 4.88, sparkline: [175, 178, 180, 182, 185, 184] },
  ])

  const [marketPulse, setMarketPulse] = useState([
    { name: 'VOLATILITY (VIX)', value: '14.22', change: -4.50, sparkline: [15, 14.8, 15.2, 14.5, 14.4, 14.22] },
    { name: 'BTC DOMINANCE', value: '54.2%', change: 0.35, sparkline: [53.5, 53.8, 54, 53.9, 54.1, 54.2] },
    { name: 'DXY INDEX', value: '104.12', change: 0.10, sparkline: [104, 104.05, 104.15, 104.08, 104.1, 104.12] },
    { name: 'FEAR & GREED', value: '72 (GREED)', change: 2.00, sparkline: [68, 70, 71, 69, 70, 72] },
  ])

  const [news, setNews] = useState([
    { title: "Fed Maintains Rates, Signals Three Cuts Possible in 2024", time: "12m ago", source: "REUTERS" },
    { title: "BlackRock Spot Bitcoin ETF Inflows Hit Record $849M", time: "45m ago", source: "BLOOMBERG" },
    { title: "NVIDIA Gains 4.2% After AI Infrastructure Summit Keynote", time: "1h ago", source: "CNBC" },
    { title: "Polymarket Volume Surges Amidst US Election Speculation", time: "2h ago", source: "ON-CHAIN" },
  ])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('en-US', { hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    // Live update simulation for sparklines and prices
    const liveInterval = setInterval(() => {
      setMajorPairs(prev => prev.map(p => ({
        ...p,
        value: p.name.includes('BTC') ? (96000 + Math.random() * 500).toFixed(2) : p.value,
        change: p.change + (Math.random() - 0.5) * 0.1,
        sparkline: [...p.sparkline.slice(1), p.sparkline[p.sparkline.length-1] + (Math.random() - 0.5) * 50]
      })))
      
      setIndices(prev => prev.map(p => ({
        ...p,
        change: p.change + (Math.random() - 0.5) * 0.05,
        sparkline: [...p.sparkline.slice(1), p.sparkline[p.sparkline.length-1] + (Math.random() - 0.5) * 10]
      })))
    }, 3000)

    return () => {
      clearInterval(interval)
      clearInterval(liveInterval)
    }
  }, [])

  return (
    <div className="h-full bg-[rgba(5,1,0,0.98)] overflow-hidden flex flex-col font-sans select-none p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-[#ff7700] rounded-lg flex items-center justify-center font-bold text-black border-2 border-[#ffaa00] shadow-[0_0_30px_rgba(255,119,0,0.3)]">
             <span className="font-black text-xl">JG</span>
          </div>
          <div>
            <h1 className="font-[var(--font-orbitron)] text-2xl font-black tracking-tighter text-white">
                FINANCIAL COMMAND CENTER
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <div className="h-2 w-2 rounded-full bg-[#00ff9d] animate-pulse" />
               <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Global Markets: Synchronized</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">Net Liquidity</span>
             <span className="text-white font-mono font-black text-2xl tracking-tighter">
                ${portfolioValue.toLocaleString()} <span className="text-[12px] text-[#00ff9d]">+{dailyPnL}%</span>
             </span>
          </div>
          <div className="text-right">
             <span className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">System Time</span>
             <div className="text-white font-mono font-black text-2xl tracking-tighter">{clock}</div>
          </div>
        </div>
      </div>

      {/* Main 4-Widget Grid */}
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6 overflow-hidden">
        <DashboardWidget title="Global Indices" items={indices} color="#ff7700" />
        <DashboardWidget title="Major Assets" items={majorPairs} color="#00ff9d" />
        <DashboardWidget title="Market Pulse" items={marketPulse} color="#ff00aa" />
        
        {/* News & Intel Column */}
        <div className="bg-[rgba(10,3,0,0.7)] border border-[rgba(255,119,0,0.15)] rounded-xl p-5 shadow-2xl flex flex-col">
           <h3 className="text-[10px] font-black tracking-[0.25em] text-white/40 uppercase mb-4 border-b border-white/5 pb-2">Global Intel Feed</h3>
           <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar pr-2">
              {news.map((n, i) => (
                <div key={i} className="group cursor-pointer">
                   <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] font-black text-[#ff7700] tracking-widest">{n.source}</span>
                      <span className="text-[8px] text-white/30">{n.time}</span>
                   </div>
                   <p className="text-[11px] text-white/90 font-bold leading-relaxed group-hover:text-[#ff7700] transition-colors">{n.title}</p>
                </div>
              ))}
           </div>
           <div className="mt-4 pt-4 border-t border-white/5">
              <button className="w-full py-2 bg-white/5 rounded border border-white/10 text-[9px] font-black text-white/60 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest">
                 View All Intelligence
              </button>
           </div>
        </div>
      </div>

      {/* System Status Row */}
      <div className="grid grid-cols-5 gap-4 shrink-0">
        {[
          { label: 'Binance API', status: 'Optimal', latency: '12ms' },
          { label: 'Polymarket CLOB', status: 'Synced', latency: '42ms' },
          { label: 'OKX Bridge', status: 'Connected', latency: '18ms' },
          { label: 'Macro Feed', status: 'Live', latency: '110ms' },
          { label: 'Jarvis Core', status: 'Ready', latency: '0.4ms' },
        ].map((sys, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">{sys.label}</span>
                <span className="text-[10px] text-white font-black">{sys.status}</span>
             </div>
             <span className="text-[9px] font-mono text-[#00ff9d]">{sys.latency}</span>
          </div>
        ))}
      </div>

      {/* Background Decorative Element */}
      <div className="fixed -bottom-20 -left-20 w-[500px] h-[500px] bg-[#ff7700]/5 blur-[150px] rounded-full -z-10" />
      <div className="fixed -top-20 -right-20 w-[500px] h-[500px] bg-[#00ff9d]/5 blur-[150px] rounded-full -z-10" />
    </div>
  )
}
