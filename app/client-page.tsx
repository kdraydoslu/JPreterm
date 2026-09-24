'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/hft/top-bar'
import { TabBar } from '@/components/hft/tab-bar'
import { LiveWorkstation } from '@/components/hft/live-terminal/live-workstation'
import { OverviewModal } from '@/components/hft/overview-modal'
import { Overview } from '@/components/hft/overview'
import { Portfolio } from '@/components/hft/portfolio'
import { FinTerm } from '@/components/hft/fin-term'
import { CryptoHFT } from '@/components/hft/crypto-hft'
import { USMarkets } from '@/components/hft/us-markets'
import { BISTTerminal } from '@/components/hft/bist-terminal'
import { PredictionMarkets } from '@/components/hft/prediction-markets'
import { JarvisOSDashboard } from '@/components/hft/jarvis-os'
import { BottomBar } from '@/components/hft/bottom-bar'

export default function ClientTerminal() {
  const [activeTab, setActiveTab] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="h-screen w-screen bg-black" />

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050100] text-[#ffeedd]">
      {/* Top Bar with Genel Veri Modülü button */}
      <TopBar onOpenOverview={() => setIsOverviewModalOpen(true)} />

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative pb-[90px]">
        {activeTab === 0 && <LiveWorkstation />}
        {activeTab === 1 && <Overview />}
        {activeTab === 2 && <Portfolio />}
        {activeTab === 3 && <FinTerm />}
        {activeTab === 4 && <CryptoHFT />}
        {activeTab === 5 && <USMarkets />}
        {activeTab === 6 && <BISTTerminal />}
        {activeTab === 7 && <PredictionMarkets />}
        {activeTab === 8 && <JarvisOSDashboard />}

        {/* Overview Modal / Drawer (Genel Veri Modülü triggered from Top Bar) */}
        <OverviewModal
          isOpen={isOverviewModalOpen}
          onClose={() => setIsOverviewModalOpen(false)}
        />

        {/* Bottom Bar - visible on all pages */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <BottomBar activeTab={activeTab} />
        </div>
      </div>
    </div>
  )
}
