'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/hft/top-bar'
import { TabBar } from '@/components/hft/tab-bar'
import { CryptoHFT } from '@/components/hft/crypto-hft'
import { USMarkets } from '@/components/hft/us-markets'
import { BISTTerminal } from '@/components/hft/bist-terminal'
import { PredictionMarkets } from '@/components/hft/prediction-markets'
import { Overview } from '@/components/hft/overview'
import { Portfolio } from '@/components/hft/portfolio'
import { FinTerm } from '@/components/hft/fin-term'
import { JarvisOSDashboard } from '@/components/hft/jarvis-os'
import { BottomBar } from '@/components/hft/bottom-bar'

export default function ClientTerminal() {
  const [activeTab, setActiveTab] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="h-screen w-screen bg-black" />

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Top Bar */}
      <TopBar />

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 0 && <Overview />}
        {activeTab === 1 && <Portfolio />}
        {activeTab === 2 && <FinTerm />}
        {activeTab === 3 && <CryptoHFT />}
        {activeTab === 4 && <USMarkets />}
        {activeTab === 5 && <BISTTerminal />}
        {activeTab === 6 && <PredictionMarkets />}
        {activeTab === 7 && <JarvisOSDashboard />}
        
        {/* Bottom Bar - visible on all pages */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <BottomBar activeTab={activeTab} />
        </div>
      </div>
    </div>
  )
}
