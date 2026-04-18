'use client'

import { useState, useEffect } from 'react'

export function BISTTerminal() {
  const [selectedStock, setSelectedStock] = useState('THYAO')
  
  const stocks = [
    { symbol: 'THYAO', name: 'Türk Hava Yolları', price: 312.50, change: 1.85, volume: '45.2M', lot: 1000 },
    { symbol: 'GARAN', name: 'Garanti BBVA', price: 124.75, change: 0.67, volume: '89.3M', lot: 100 },
    { symbol: 'AKBNK', name: 'Akbank', price: 78.90, change: -0.45, volume: '156.7M', lot: 100 },
    { symbol: 'EREGL', name: 'Ereğli Demir Çelik', price: 56.30, change: 1.23, volume: '67.8M', lot: 100 },
    { symbol: 'TUPRS', name: 'Tüpraş', price: 234.60, change: -0.89, volume: '23.4M', lot: 100 },
    { symbol: 'SAHOL', name: 'Sabancı Holding', price: 89.45, change: 0.78, volume: '34.5M', lot: 100 },
    { symbol: 'KCHOL', name: 'Koç Holding', price: 198.75, change: 1.12, volume: '28.9M', lot: 100 },
    { symbol: 'ASELS', name: 'Aselsan', price: 145.80, change: 2.34, volume: '45.6M', lot: 100 },
  ]

  const economicEvents = [
    { time: '10:00', event: 'TCMB Faiz Kararı', impact: 'HIGH', forecast: '%50.00', previous: '%50.00' },
    { time: '11:00', event: 'Enflasyon Verileri', impact: 'HIGH', forecast: '%3.2', previous: '%2.9' },
    { time: '14:00', event: 'İşsizlik Oranı', impact: 'MEDIUM', forecast: '%9.8', previous: '%9.6' },
    { time: '15:30', event: 'Cari Açık', impact: 'HIGH', forecast: '-$4.2B', previous: '-$3.8B' },
  ]

  const [technicalIndicators, setTechnicalIndicators] = useState({
    rsi: 58.3,
    macd: 1.45,
    sma20: 243.50,
    sma50: 238.20,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTechnicalIndicators({
        rsi: 30 + Math.random() * 40,
        macd: (Math.random() - 0.5) * 3,
        sma20: 243 + Math.random() * 5,
        sma50: 238 + Math.random() * 5,
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const selected = stocks.find((s) => s.symbol === selectedStock) || stocks[0]

  return (
    <div className="h-full bg-[rgba(10,3,0,0.9)] overflow-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-[var(--font-orbitron)] text-2xl font-bold text-[#ff7700]">
            BIST Terminal
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[rgba(255,34,68,0.8)] text-sm">● MARKET CLOSED</span>
            <span className="text-[rgba(255,119,0,0.6)] text-sm">Pazartesi 10:00'da Açılış</span>
          </div>
        </div>

        {/* BIST Indices */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { name: 'BIST 100', value: 10234.56, change: 0.87 },
            { name: 'BIST 30', value: 11456.78, change: 1.12 },
            { name: 'BIST Banka', value: 9234.90, change: 0.56 },
            { name: 'BIST Sınai', value: 8567.34, change: -0.23 },
          ].map((index) => {
            const isPositive = index.change >= 0
            return (
              <div key={index.name} className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-3">
                <div className="text-[rgba(255,119,0,0.6)] text-xs mb-1">{index.name}</div>
                <div className="font-mono text-lg text-[#ff7700] mb-1">
                  {index.value.toFixed(2)}
                </div>
                <div className={`text-sm font-bold ${isPositive ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
                  {isPositive ? '+' : ''}{index.change.toFixed(2)}%
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Stock List */}
            <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4">
              <h2 className="font-[var(--font-orbitron)] text-sm font-bold text-[#00ff9d] mb-3">
                Popüler Hisseler
              </h2>
              <div className="space-y-2">
                {stocks.map((stock) => {
                  const isPositive = stock.change >= 0
                  const isSelected = stock.symbol === selectedStock
                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock.symbol)}
                      className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-[rgba(255,119,0,0.1)] border border-[rgba(255,119,0,0.3)]' 
                          : 'hover:bg-[rgba(10,3,0,0.4)]'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-[var(--font-orbitron)] text-sm text-[#ff7700] mb-1">
                          {stock.symbol}
                        </div>
                        <div className="text-[rgba(255,119,0,0.6)] text-xs">{stock.name}</div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="font-mono text-sm text-[#00ff9d]">
                          ₺{stock.price.toFixed(2)}
                        </div>
                        <div className={`text-xs font-bold ${isPositive ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
                          {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[rgba(255,119,0,0.6)] text-xs">Hacim</div>
                        <div className="text-[#ff7700] text-xs">{stock.volume}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Technical Analysis */}
            <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4">
              <h2 className="font-[var(--font-orbitron)] text-sm font-bold text-[#00ff9d] mb-3">
                Teknik Analiz - {selected.symbol}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mb-2">RSI (14)</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[rgba(255,119,0,0.1)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          technicalIndicators.rsi > 70 ? 'bg-[#ff2244]' : 
                          technicalIndicators.rsi < 30 ? 'bg-[#00ff9d]' : 
                          'bg-[#ffcc00]'
                        }`}
                        style={{ width: `${technicalIndicators.rsi}%` }}
                      />
                    </div>
                    <span className="text-[#ff7700] font-mono text-sm w-12">
                      {technicalIndicators.rsi.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mt-1">
                    {technicalIndicators.rsi > 70 ? 'Aşırı Alım' : 
                     technicalIndicators.rsi < 30 ? 'Aşırı Satım' : 'Nötr'}
                  </div>
                </div>

                <div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mb-2">MACD</div>
                  <div className={`font-mono text-lg ${
                    technicalIndicators.macd > 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'
                  }`}>
                    {technicalIndicators.macd.toFixed(2)}
                  </div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mt-1">
                    {technicalIndicators.macd > 0 ? 'Yükseliş' : 'Düşüş'}
                  </div>
                </div>

                <div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mb-1">Hareketli Ortalamalar</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[rgba(255,119,0,0.6)]">20 Günlük</span>
                      <span className="text-[#ff7700] font-mono">₺{technicalIndicators.sma20.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[rgba(255,119,0,0.6)]">50 Günlük</span>
                      <span className="text-[#00ff9d] font-mono">₺{technicalIndicators.sma50.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[rgba(255,119,0,0.6)] text-xs mb-1">Bilgiler</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[rgba(255,119,0,0.6)]">Lot</span>
                      <span className="text-[#ff7700] font-mono">{selected.lot}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[rgba(255,119,0,0.6)]">Hacim</span>
                      <span className="text-[#ffcc00] font-mono">{selected.volume}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Depth */}
            <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4">
              <h2 className="font-[var(--font-orbitron)] text-sm font-bold text-[#00ff9d] mb-3">
                Piyasa Derinliği
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[#00ff9d] text-xs mb-2 font-bold">ALIŞ</div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between text-xs mb-1">
                      <span className="text-[#00ff9d] font-mono">
                        ₺{(selected.price - (i + 1) * 0.5).toFixed(2)}
                      </span>
                      <span className="text-[rgba(255,119,0,0.6)]">
                        {(Math.random() * 10000).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[#ff2244] text-xs mb-2 font-bold">SATIŞ</div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between text-xs mb-1">
                      <span className="text-[#ff2244] font-mono">
                        ₺{(selected.price + (i + 1) * 0.5).toFixed(2)}
                      </span>
                      <span className="text-[rgba(255,119,0,0.6)]">
                        {(Math.random() * 10000).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Economic Calendar */}
            <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4">
              <h2 className="font-[var(--font-orbitron)] text-sm font-bold text-[#00ff9d] mb-3">
                Ekonomik Takvim
              </h2>
              <div className="space-y-3">
                {economicEvents.map((event, i) => (
                  <div key={i} className="border-l-2 border-[rgba(255,119,0,0.3)] pl-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#ff7700] font-mono text-sm">{event.time}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        event.impact === 'HIGH' 
                          ? 'bg-[rgba(255,34,68,0.2)] text-[#ff2244]' 
                          : 'bg-[rgba(255,204,0,0.2)] text-[#ffcc00]'
                      }`}>
                        {event.impact}
                      </span>
                    </div>
                    <div className="text-[rgba(255,119,0,0.9)] text-sm mb-2">{event.event}</div>
                    <div className="flex gap-4 text-xs">
                      <div>
                        <span className="text-[rgba(255,119,0,0.6)]">Tahmin: </span>
                        <span className="text-[#ff7700]">{event.forecast}</span>
                      </div>
                      <div>
                        <span className="text-[rgba(255,119,0,0.6)]">Önceki: </span>
                        <span className="text-[rgba(255,119,0,0.8)]">{event.previous}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Currency Rates */}
            <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4">
              <h2 className="font-[var(--font-orbitron)] text-sm font-bold text-[#00ff9d] mb-3">
                Döviz Kurları
              </h2>
              <div className="space-y-2">
                {[
                  { name: 'USD/TRY', value: 34.25, change: 0.45 },
                  { name: 'EUR/TRY', value: 37.89, change: 0.32 },
                  { name: 'GBP/TRY', value: 43.56, change: -0.12 },
                  { name: 'GOLD', value: 2456.78, change: 1.23 },
                ].map((currency) => {
                  const isPositive = currency.change >= 0
                  return (
                    <div key={currency.name} className="flex justify-between items-center">
                      <span className="text-[#ff7700] text-sm">{currency.name}</span>
                      <div className="text-right">
                        <div className="font-mono text-sm text-[rgba(255,119,0,0.9)]">
                          ₺{currency.value.toFixed(2)}
                        </div>
                        <div className={`text-xs ${isPositive ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
                          {isPositive ? '+' : ''}{currency.change.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
