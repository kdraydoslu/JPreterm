'use client'

import { useEffect, useState } from 'react'

const NEWS = [
  { src: 'Crypto', text: 'Bronnon Soorts Reasoned to...', urgent: false },
  { src: 'Crypto', text: 'Breathan Shotet show time a...', urgent: false },
  { src: 'Fed', text: 'hleomenos to USRUS fascisieot...', urgent: true },
  { src: 'TCMB', text: 'Errechevi Nonnrliw on crypto...', urgent: false },
  { src: 'TCMB', text: 'Ronsenart Ranios leign for ec...', urgent: false },
  { src: 'TCMB', text: 'Eromt todaik monda orwith da...', urgent: false },
  { src: 'Crypto', text: 'Earnings in sel and kanming...', urgent: false },
  { src: 'Fed', text: 'Rate decision: hold at 5.25-5.50%', urgent: true },
  { src: 'TCMB', text: 'Faiz karari beklentilerin ustunde', urgent: false },
  { src: 'Crypto', text: 'BTC ETF outflows continue $340M', urgent: true },
]

export function NewsFeed() {
  const [news, setNews] = useState<{ src: string; text: string; urgent: boolean }[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const item = NEWS[index % NEWS.length]
      setNews((prev) => {
        const newNews = [item, ...prev]
        return newNews.slice(0, 6)
      })
      setIndex((i) => i + 1)
    }, 1200)

    return () => clearInterval(interval)
  }, [index])

  return (
    <div className="border-t border-[rgba(255,119,0,0.15)] flex flex-col overflow-hidden max-h-[120px]">
      <div className="flex items-center justify-between px-2 py-1 bg-[rgba(10,3,0,0.8)] border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <span className="font-[var(--font-orbitron)] text-[9px] font-bold text-[#ffcc00] tracking-[1.5px] [text-shadow:0_0_6px_rgba(255,204,0,0.5)]">
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
            className={`px-2 py-0.5 border-b border-[rgba(255,119,0,0.04)] text-[8px] overflow-hidden text-ellipsis whitespace-nowrap animate-[sigFade_0.3s_ease] ${
              item.urgent ? 'text-[#ff7700]' : 'text-[rgba(255,238,221,0.6)]'
            }`}
          >
            <span className={`mr-1 text-[7px] ${item.urgent ? 'text-[#ff2244]' : 'text-[#ffcc00]'}`}>{item.src}</span>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  )
}
