'use client'

import React from 'react'
import { X, Activity } from 'lucide-react'
import { Overview } from './overview'

interface OverviewModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OverviewModal({ isOpen, onClose }: OverviewModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#080402] border border-[#ff7700]/50 rounded-2xl w-full max-w-7xl h-[92vh] flex flex-col shadow-[0_0_50px_rgba(255,119,0,0.15)] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-[rgba(255,119,0,0.3)] flex items-center justify-between bg-[rgba(15,5,1,0.95)]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1 rounded bg-[rgba(255,119,0,0.15)] border border-[#ff7700]/50 text-[#ff7700] shadow-[var(--glow-orange)]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="font-[var(--font-orbitron)] text-xs sm:text-sm font-black text-[#ff7700] tracking-wider [text-shadow:var(--glow-orange)]">
                JARVIS GENEL VERİ & PİYASA MODÜLÜ
              </div>
              <div className="text-[10px] text-[rgba(255,238,221,0.5)] font-mono">
                KRİPTO • ABD PİYASALARI • BORSA İSTANBUL • MAKRO VE TAHMİN PİYASALARI
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[rgba(255,119,0,0.1)] border border-[rgba(255,119,0,0.3)] text-[rgba(255,238,221,0.6)] hover:text-[#ff7700] hover:border-[#ff7700] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <Overview />
        </div>
      </div>
    </div>
  )
}
