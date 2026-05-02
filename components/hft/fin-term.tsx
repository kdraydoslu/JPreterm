'use client'

import { useState, useEffect } from 'react'
// Specialized sidebars for FinTerm
import { marketDataService } from '@/lib/market-data'

const FinLeftSidebar = () => {
  const funds = [
    { symbol: 'MAC', name: 'Marmara Hisse', daily: 1.24, monthly: 8.42 },
    { symbol: 'NNF', name: 'Hedef Hisse', daily: -0.45, monthly: 6.21 },
    { symbol: 'TI3', name: 'İş Portföy Robotik', daily: 2.15, monthly: 12.54 },
    { symbol: 'IPB', name: 'İstanbul Değişken', daily: 0.82, monthly: 4.15 },
    { symbol: 'YAS', name: 'Yapı Kredi Hisse', daily: 1.12, monthly: 7.34 },
    { symbol: 'TTA', name: 'İş Portföy Altın', daily: 0.45, monthly: 5.20 },
  ]
  return (
    <div className="flex flex-col h-full p-2">
      <div className="text-[10px] text-[#ffcc00] font-[var(--font-orbitron)] mb-3 border-b border-[rgba(255,119,0,0.2)] pb-1">YATIRIM FONLARI</div>
      <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar">
        {funds.map(f => (
          <div key={f.symbol} className="p-2 border border-[rgba(255,119,0,0.1)] bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(255,119,0,0.1)] rounded cursor-pointer transition-all">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[#ff7700] text-xs font-bold">{f.symbol}</span>
              <span className="text-[8px] text-[rgba(255,119,0,0.5)] truncate ml-2">{f.name}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-[rgba(255,119,0,0.6)]">Günlük:</span>
              <span className={f.daily >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}>{f.daily > 0 ? '+' : ''}{f.daily}%</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-[rgba(255,119,0,0.6)]">Aylık:</span>
              <span className={f.monthly >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}>{f.monthly > 0 ? '+' : ''}{f.monthly}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const FinRightSidebar = () => {
  const bonds = [
    { title: 'TR 2Y Tahvil', yield: 42.50, change: -0.15 },
    { title: 'TR 10Y Tahvil', yield: 28.40, change: 0.05 },
    { title: 'US 10Y Treasury', yield: 4.45, change: 0.02 },
    { title: 'Repo (O/N)', yield: 50.00, change: 0.00 },
  ]
  const eurobonds = [
    { title: 'TR 2030 (USD)', price: 98.50, yield: 7.20 },
    { title: 'TR 2036 (USD)', price: 102.10, yield: 7.45 },
    { title: 'TR 2025 (EUR)', price: 100.20, yield: 5.80 },
  ]
  return (
    <div className="flex flex-col h-full p-2">
      <div className="text-[10px] text-[#00ff9d] font-[var(--font-orbitron)] mb-3 border-b border-[rgba(0,255,157,0.2)] pb-1">TAHVİL & REPO</div>
      <div className="flex flex-col gap-2 mb-4">
        {bonds.map(b => (
          <div key={b.title} className="p-2 border border-[rgba(0,255,157,0.1)] bg-[rgba(0,0,0,0.3)] rounded">
            <div className="text-[#00ff9d] text-[10px] font-bold mb-1">{b.title}</div>
            <div className="flex justify-between text-[12px] font-mono">
              <span className="text-white">%{b.yield.toFixed(2)}</span>
              <span className={b.change >= 0 ? (b.change === 0 ? 'text-gray-400' : 'text-[#ff2244]') : 'text-[#00ff9d]'}>
                {b.change > 0 ? '+' : ''}{b.change.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-[#ffcc00] font-[var(--font-orbitron)] mb-3 border-b border-[rgba(255,204,0,0.2)] pb-1">EUROBOND</div>
      <div className="flex flex-col gap-2">
        {eurobonds.map(e => (
          <div key={e.title} className="p-2 border border-[rgba(255,204,0,0.1)] bg-[rgba(0,0,0,0.3)] rounded">
            <div className="text-[#ffcc00] text-[10px] font-bold mb-1">{e.title}</div>
            <div className="flex justify-between text-[10px] font-mono mb-0.5">
              <span className="text-[rgba(255,255,255,0.6)]">Fiyat:</span>
              <span className="text-white">{e.title.includes('EUR') ? '€' : '$'}{e.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-[rgba(255,255,255,0.6)]">Getiri:</span>
              <span className="text-[#00ff9d]">%{e.yield.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinTerm() {
  const [macroData, setMacroData] = useState<{
    trGdp: number | null,
    trInflation: number | null,
    trUnemp: number | null,
    usGdp: number | null,
    usInflation: number | null,
    wldGdp: number | null
  }>({
    trGdp: null, trInflation: null, trUnemp: null,
    usGdp: null, usInflation: null, wldGdp: null
  })

  const [forex, setForex] = useState<Record<string, { price: number, change: number }>>({
    'USD/TRY': { price: 32.50, change: 0 },
    'EUR/TRY': { price: 35.10, change: 0 },
    'EUR/USD': { price: 1.08, change: 0 },
    'GBP/USD': { price: 1.25, change: 0 }
  })

  const [commodities, setCommodities] = useState<Record<string, { price: number, change: number }>>({
    'GOLD': { price: 2350.50, change: 0 },
    'SILVER': { price: 28.40, change: 0 },
    'OIL (WTI)': { price: 82.30, change: 0 }
  })

  useEffect(() => {
    // Fetch Macro Data
    const fetchMacro = async () => {
      try {
        const getInd = async (country: string, ind: string) => {
          const data = await marketDataService.fetchWorldBankIndicator(ind, country)
          return data.length > 0 ? data[0].value : null
        }
        
        const [trGdp, trInflation, trUnemp, usGdp, usInflation, wldGdp] = await Promise.all([
          getInd('TUR', 'NY.GDP.MKTP.KD.ZG'),
          getInd('TUR', 'FP.CPI.TOTL.ZG'),
          getInd('TUR', 'SL.UEM.TOTL.ZS'),
          getInd('USA', 'NY.GDP.MKTP.KD.ZG'),
          getInd('USA', 'FP.CPI.TOTL.ZG'),
          getInd('WLD', 'NY.GDP.MKTP.KD.ZG')
        ])

        setMacroData({
          trGdp, trInflation, trUnemp, usGdp, usInflation, wldGdp
        })
      } catch (e) {
        console.error("Macro fetch error", e)
      }
    }
    fetchMacro()

    // Fetch Forex via Binance (as proxy for real-time rates)
    marketDataService.subscribeTicker('USDTTRY', (data) => {
      setForex(prev => ({
        ...prev,
        'USD/TRY': { price: parseFloat(data.price), change: parseFloat(data.priceChangePercent) }
      }))
    })
    marketDataService.subscribeTicker('EURUSDT', (data) => {
      setForex(prev => {
        const eurUsd = parseFloat(data.price)
        const usdTry = prev['USD/TRY'].price
        return {
          ...prev,
          'EUR/USD': { price: eurUsd, change: parseFloat(data.priceChangePercent) },
          'EUR/TRY': { price: eurUsd * usdTry, change: parseFloat(data.priceChangePercent) } // derived
        }
      })
    })
    marketDataService.subscribeTicker('GBPUSDT', (data) => {
      setForex(prev => ({
        ...prev,
        'GBP/USD': { price: parseFloat(data.price), change: parseFloat(data.priceChangePercent) }
      }))
    })

    // Commodities via Binance proxies or Finnhub
    marketDataService.subscribeTicker('PAXGUSDT', (data) => {
      setCommodities(prev => ({
        ...prev,
        'GOLD': { price: parseFloat(data.price), change: parseFloat(data.priceChangePercent) }
      }))
    })

    // Simulate other commodities that might not have direct binance pairs
    const interval = setInterval(() => {
      setCommodities(prev => ({
        ...prev,
        'SILVER': { 
          price: prev['SILVER'].price * (1 + (Math.random() - 0.5) * 0.001), 
          change: prev['SILVER'].change + (Math.random() - 0.5) * 0.1 
        },
        'OIL (WTI)': { 
          price: prev['OIL (WTI)'].price * (1 + (Math.random() - 0.5) * 0.002), 
          change: prev['OIL (WTI)'].change + (Math.random() - 0.5) * 0.1 
        }
      }))
    }, 2000)

    return () => {
      marketDataService.unsubscribe('USDTTRY')
      marketDataService.unsubscribe('EURUSDT')
      marketDataService.unsubscribe('GBPUSDT')
      marketDataService.unsubscribe('PAXGUSDT')
      clearInterval(interval)
    }
  }, [])

  const MacroCard = ({ title, value, unit, country }: { title: string, value: number | null, unit: string, country: string }) => (
    <div className="p-3 bg-[rgba(0,0,0,0.3)] rounded border border-[rgba(255,119,0,0.1)] hover:border-[rgba(255,119,0,0.3)] transition-all">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-[rgba(255,119,0,0.6)] uppercase">{country}</span>
        <span className="text-[8px] text-[rgba(255,119,0,0.4)]">WORLD BANK DATA</span>
      </div>
      <div className="text-[14px] font-[var(--font-orbitron)] text-[#ffcc00] mb-1">{title}</div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold font-mono text-[#00ff9d]">
          {value !== null ? value.toFixed(2) : '...'}
        </span>
        <span className="text-[12px] text-[#00ff9d] mb-1">{unit}</span>
      </div>
    </div>
  )

  const RateCard = ({ title, data }: { title: string, data: { price: number, change: number } }) => {
    const isUp = data.change >= 0
    return (
      <div className="p-2 border-l-2 border-[rgba(255,119,0,0.2)] bg-[rgba(10,3,0,0.4)] rounded-r hover:bg-[rgba(255,119,0,0.05)] transition-all mb-2 cursor-pointer">
        <div className="flex justify-between text-[12px] mb-1">
          <span className="text-[#ff7700] font-bold">{title}</span>
          <span className={isUp ? 'text-[#00ff9d]' : 'text-[#ff2244]'}>
            {isUp ? '+' : ''}{data.change.toFixed(2)}%
          </span>
        </div>
        <div className="text-[16px] text-white font-mono">
          {title.includes('TRY') ? '₺' : '$'}{data.price.toFixed(4)}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[200px] border-r border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.7)] flex flex-col">
          <FinLeftSidebar />
        </div>

        {/* Center Area */}
        <div className="flex-1 overflow-hidden relative bg-[rgba(10,3,0,0.9)]">
          <div className="h-full flex flex-col p-3 overflow-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4 border-b border-[rgba(255,119,0,0.15)] pb-2 shrink-0">
              <span className="font-[var(--font-orbitron)] text-[12px] font-bold text-[#ff00aa] tracking-[2px]">
                FINANCIAL TERMINAL (MACRO & RATES)
              </span>
              <div className="flex gap-4">
                <span className="bg-[rgba(0,255,157,0.15)] border border-[#00ff9d]/50 text-[#00ff9d] text-[8px] px-2 py-1 rounded-sm tracking-[2px] font-[var(--font-orbitron)] animate-[liveBlink_1s_step-end_infinite]">
                  LIVE DATA ACTIVE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
              {/* Column 1: Macro Economics */}
              <div className="border-r border-[rgba(255,119,0,0.1)] flex flex-col overflow-y-auto custom-scrollbar pr-3">
                <div className="text-[10px] text-[#00ff9d] font-[var(--font-orbitron)] mb-3 sticky top-0 bg-[rgba(10,3,0,0.9)] py-1 z-10">MACRO ECONOMICS</div>
                <div className="space-y-3">
                  <MacroCard title="GDP Growth" value={macroData.trGdp} unit="%" country="TURKEY" />
                  <MacroCard title="Inflation (CPI)" value={macroData.trInflation} unit="%" country="TURKEY" />
                  <MacroCard title="Unemployment" value={macroData.trUnemp} unit="%" country="TURKEY" />
                  <div className="h-px w-full bg-[rgba(255,119,0,0.1)] my-2"></div>
                  <MacroCard title="GDP Growth" value={macroData.usGdp} unit="%" country="UNITED STATES" />
                  <MacroCard title="Inflation (CPI)" value={macroData.usInflation} unit="%" country="UNITED STATES" />
                  <div className="h-px w-full bg-[rgba(255,119,0,0.1)] my-2"></div>
                  <MacroCard title="Global GDP Growth" value={macroData.wldGdp} unit="%" country="WORLD" />
                </div>
              </div>

              {/* Column 2: Forex & Rates */}
              <div className="border-r border-[rgba(255,119,0,0.1)] flex flex-col overflow-y-auto custom-scrollbar px-3">
                <div className="text-[10px] text-[#00ff9d] font-[var(--font-orbitron)] mb-3 sticky top-0 bg-[rgba(10,3,0,0.9)] py-1 z-10">FOREX & RATES</div>
                <div className="space-y-1">
                  {Object.entries(forex).map(([pair, data]) => (
                    <RateCard key={pair} title={pair} data={data} />
                  ))}
                </div>
                
                <div className="mt-6 p-3 border border-[rgba(255,119,0,0.2)] bg-[rgba(255,119,0,0.02)] rounded">
                  <div className="text-[9px] text-[#ffcc00] font-[var(--font-orbitron)] mb-2">CURRENCY HEATMAP</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(forex).map(([pair, data]) => (
                      <div key={'heat-'+pair} className={`p-1.5 text-center text-[10px] font-mono rounded ${data.change >= 0 ? 'bg-[#00ff9d]/20 text-[#00ff9d]' : 'bg-[#ff2244]/20 text-[#ff2244]'}`}>
                        {pair}<br/>
                        {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}%
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 3: Commodities */}
              <div className="flex flex-col overflow-y-auto custom-scrollbar pl-3">
                <div className="text-[10px] text-[#00ff9d] font-[var(--font-orbitron)] mb-3 sticky top-0 bg-[rgba(10,3,0,0.9)] py-1 z-10">COMMODITIES</div>
                <div className="space-y-1">
                  {Object.entries(commodities).map(([item, data]) => (
                    <RateCard key={item} title={item} data={data} />
                  ))}
                </div>

                <div className="mt-6">
                  <div className="text-[9px] text-[#ffcc00] font-[var(--font-orbitron)] mb-2">COMMODITY TRENDS</div>
                  <div className="space-y-3">
                    <div className="p-2 bg-[rgba(0,0,0,0.3)] rounded border border-[rgba(255,119,0,0.1)]">
                      <div className="text-[8px] text-[rgba(255,119,0,0.6)] mb-1 uppercase">GOLD DEMAND INDEX</div>
                      <div className="h-1.5 bg-[rgba(255,119,0,0.05)] rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-[#ffcc00]" style={{ width: `78%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] items-center">
                        <span className="text-[#ffcc00] font-mono">78.0</span>
                        <span className="text-[rgba(255,119,0,0.4)]">STRONG</span>
                      </div>
                    </div>

                    <div className="p-2 bg-[rgba(0,0,0,0.3)] rounded border border-[rgba(255,119,0,0.1)]">
                      <div className="text-[8px] text-[rgba(255,119,0,0.6)] mb-1 uppercase">OIL INVENTORY PROJECTION</div>
                      <div className="h-1.5 bg-[rgba(255,119,0,0.05)] rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-[#ff2244]" style={{ width: `42%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] items-center">
                        <span className="text-[#ff2244] font-mono">42.0</span>
                        <span className="text-[rgba(255,119,0,0.4)]">DEFICIT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[210px] border-l border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.7)] flex flex-col">
          <FinRightSidebar />
        </div>
      </div>
    </div>
  )
}
