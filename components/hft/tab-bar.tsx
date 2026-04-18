'use client'

const TABS = ['Overview', 'Portfolio', 'Crypto HFT', 'US Markets', 'BIST Terminal', 'Prediction Markets']

interface TabBarProps {
  activeTab: number
  onTabChange: (index: number) => void
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="bg-[rgba(10,3,0,0.95)] border-b border-[rgba(255,119,0,0.15)] flex items-center px-2 gap-0.5">
      {TABS.map((tab, i) => (
        <button
          key={tab}
          onClick={() => onTabChange(i)}
          className={`font-[var(--font-rajdhani)] text-[11px] font-semibold px-3 py-1 cursor-pointer rounded-sm tracking-[0.5px] transition-all border-b-2 ${
            activeTab === i
              ? 'text-[#ff7700] border-[#ff7700] [text-shadow:var(--glow-orange)] bg-[rgba(255,119,0,0.05)]'
              : 'text-[rgba(255,119,0,0.5)] border-transparent hover:text-[#ff7700] hover:bg-[rgba(255,119,0,0.05)]'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  )
}
