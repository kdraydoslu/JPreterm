'use client'

import { LeftSidebar } from './left-sidebar'
import { RightSidebar } from './right-sidebar'
import { HFTPanel } from './hft-panel'
import { BottomBar } from './bottom-bar'

export function CryptoHFT() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[200px] border-r border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.7)]">
          <LeftSidebar />
        </div>

        {/* Center Area */}
        <div className="flex-1 overflow-hidden">
          <HFTPanel />
        </div>

        {/* Right Sidebar */}
        <div className="w-[210px] border-l border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.7)]">
          <RightSidebar />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="h-[120px] border-t border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.97)]">
        <BottomBar />
      </div>
    </div>
  )
}
