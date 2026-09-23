'use client'

import React, { useEffect, useRef } from 'react'

export function TerminalTicker() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'FX:USDTRY', title: 'Dolar / TL' },
        { proName: 'FX:EURTRY', title: 'Euro / TL' },
        { proName: 'OANDA:XAUUSD', title: 'Ons Altın' },
        { proName: 'BINANCE:BTCUSDT', title: 'Bitcoin' },
        { proName: 'BINANCE:ETHUSDT', title: 'Ethereum' },
        { proName: 'BINANCE:SOLUSDT', title: 'Solana' },
        { proName: 'TVC:UKOIL', title: 'Brent Petrol' },
        { proName: 'AMEX:TUR', title: 'Türkiye BIST ETF' },
        { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
        { proName: 'FOREXCOM:NSXUSD', title: 'Nasdaq 100' },
        { proName: 'NASDAQ:NVDA', title: 'Nvidia' },
        { proName: 'NASDAQ:AAPL', title: 'Apple' }
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'tr'
    })

    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container__widget'
    containerRef.current.appendChild(widgetContainer)
    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="w-full bg-[#070200]/95 border-b border-[rgba(255,119,0,0.2)] overflow-hidden h-[40px] flex items-center">
      <div ref={containerRef} className="tradingview-widget-container w-full h-[40px]" />
    </div>
  )
}
