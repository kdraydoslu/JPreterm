'use client'

import React from 'react'

interface MarketGateProps {
  isOpen: boolean
  nextOpening?: string
  children: React.ReactNode
}

export function MarketGate({ isOpen, nextOpening, children }: MarketGateProps) {
  if (isOpen) {
    return <>{children}</>
  }

  return (
    <div className="relative h-full w-full">
      {/* Blurred background of children */}
      <div className="absolute inset-0 blur-sm opacity-30 pointer-events-none">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(10,3,0,0.6)] z-20">
        <div className="p-8 border border-[rgba(255,119,0,0.3)] bg-[rgba(10,3,0,0.8)] rounded-lg text-center backdrop-blur-md">
          <div className="flex items-center justify-center mb-4">
            <div className="w-3 h-3 rounded-full bg-[#ff2244] animate-pulse mr-2" />
            <span className="font-[var(--font-orbitron)] text-[10px] font-bold text-[#ff2244] tracking-[2px]">
              MARKET STATUS: CLOSED
            </span>
          </div>
          <h2 className="font-[var(--font-orbitron)] text-2xl font-black text-[#ff7700] mb-2 [text-shadow:0_0_15px_rgba(255,119,0,0.5)]">
            WAITING FOR OPEN MARKET
          </h2>
          {nextOpening && (
            <p className="text-[rgba(255,238,221,0.6)] font-mono text-sm">
              Next opening session: <span className="text-[#ffcc00]">{nextOpening}</span>
            </p>
          )}
          <div className="mt-6 flex gap-4 justify-center">
            <div className="flex flex-col">
              <span className="text-[9px] text-[rgba(255,119,0,0.4)] tracking-[1px]">LATENCY</span>
              <span className="text-[#00ff9d] font-mono text-xs">0.02ms</span>
            </div>
            <div className="flex flex-col border-l border-[rgba(255,119,0,0.1)] pl-4">
              <span className="text-[9px] text-[rgba(255,119,0,0.4)] tracking-[1px]">NODES</span>
              <span className="text-[#00ff9d] font-mono text-xs">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
