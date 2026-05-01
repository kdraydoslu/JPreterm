'use client'

import React from 'react'

interface MarketGateProps {
  isOpen: boolean
  nextOpening?: string
  children: React.ReactNode
}

export function MarketGate({ isOpen, nextOpening, children }: MarketGateProps) {
  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      {/* Main Terminal Content - Never Blocked */}
      {children}
      
      {/* Floating Status Badge (Top Right) */}
      <div className="absolute top-2 right-2 z-50 pointer-events-none">
        <div className={`px-4 py-2 border ${isOpen ? 'border-[rgba(0,255,157,0.3)] bg-[rgba(10,3,0,0.8)]' : 'border-[rgba(255,34,68,0.4)] bg-[rgba(10,3,0,0.95)]'} rounded-lg shadow-xl backdrop-blur-md flex flex-col items-end`}>
          <div className="flex items-center gap-2">
            <span className={`font-[var(--font-orbitron)] text-[10px] font-black tracking-[2px] uppercase ${isOpen ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
              {isOpen ? 'MARKET: LIVE' : 'MARKET: CLOSED'}
            </span>
            <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-[#00ff9d] shadow-[0_0_10px_#00ff9d]' : 'bg-[#ff2244] shadow-[0_0_10px_#ff2244] animate-pulse'}`} />
          </div>
          {!isOpen && nextOpening && (
            <span className="text-[9px] text-[rgba(255,238,221,0.5)] font-mono mt-1">
              OPENS: <span className="text-[#ffcc00]">{nextOpening}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
