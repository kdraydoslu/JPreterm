'use client'

import { useState, useEffect } from 'react'
import { OrderBook } from './order-book'
import { ExecutionLog } from './execution-log'
import { GapMatrix } from './gap-matrix'

export function HFTPanel() {
  const [latencies, setLatencies] = useState({ l1: 0.43, l2: 0.67, l3: 1.12 })

  useEffect(() => {
    const interval = setInterval(() => {
      setLatencies({
        l1: 0.3 + Math.random() * 0.3,
        l2: 0.5 + Math.random() * 0.4,
        l3: 0.9 + Math.random() * 0.5,
      })
    }, 600)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5 py-0.5 bg-[rgba(10,3,0,0.8)] border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <span className="font-[var(--font-orbitron)] text-[7px] font-bold text-[#ff00aa] tracking-[1.5px] [text-shadow:0_0_6px_rgba(255,0,170,0.5)]">
          HFT SCALPING
        </span>
        <span className="bg-[rgba(255,34,68,0.15)] border border-[rgba(255,34,68,0.5)] text-[#ff2244] text-[6px] px-1 py-0.5 rounded-sm tracking-[2px] font-[var(--font-orbitron)] animate-[liveBlink_1s_step-end_infinite]">
          LIVE
        </span>
      </div>

      {/* 3 Column Layout */}
      <div className="flex-1 grid grid-cols-3 overflow-hidden">
        {/* Order Book */}
        <div className="border-r border-[rgba(255,119,0,0.15)] overflow-hidden">
          <OrderBook />
        </div>

        {/* Execution Log */}
        <div className="border-r border-[rgba(255,119,0,0.15)] overflow-hidden">
          <ExecutionLog />
        </div>

        {/* Gap Matrix */}
        <div className="overflow-hidden">
          <GapMatrix />
        </div>
      </div>
    </div>
  )
}
