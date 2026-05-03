'use client'

import { useState, useEffect } from 'react'
import { analyzeStock, StockAnalysis } from '@/lib/bist-analysis-engine'

interface BISTAnalysisViewProps {
  stocks: any[];
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
}

export function BISTAnalysisView({ stocks, selectedTicker, onSelectTicker }: BISTAnalysisViewProps) {
  const [analyses, setAnalyses] = useState<StockAnalysis[]>([])
  
  useEffect(() => {
    const results = stocks.map(s => analyzeStock(s.symbol, s.name, s))
    setAnalyses(results.sort((a, b) => b.investmentIndex - a.investmentIndex))
  }, [stocks])

  const selectedAnalysis = analyses.find(a => a.ticker === selectedTicker) || analyses[0]

  if (!selectedAnalysis) return <div className="p-4 text-[#ff7700]">Yükleniyor...</div>

  return (
    <div className="h-full flex flex-col gap-3 p-2 overflow-hidden">
      {/* Top Stats Bar */}
      <div className="flex gap-3 shrink-0">
        <div className="flex-1 p-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,119,0,0.1)] rounded-lg backdrop-blur-md">
          <div className="text-[10px] text-[rgba(255,119,0,0.5)] font-[var(--font-orbitron)] mb-1 uppercase tracking-wider">Piyasa Lideri (Analiz)</div>
          <div className="flex justify-between items-end">
             <span className="text-[#00ff9d] text-lg font-black font-[var(--font-orbitron)]">{analyses[0]?.ticker}</span>
             <span className="text-[10px] text-[#00ff9d] font-mono font-bold bg-[#00ff9d]/10 px-1.5 py-0.5 rounded border border-[#00ff9d]/20">
               ENDEKS: {analyses[0]?.investmentIndex}
             </span>
          </div>
        </div>
        <div className="flex-1 p-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,119,0,0.1)] rounded-lg backdrop-blur-md">
          <div className="text-[10px] text-[rgba(255,119,0,0.5)] font-[var(--font-orbitron)] mb-1 uppercase tracking-wider">Analiz Edilen Hisse</div>
          <div className="flex justify-between items-end">
             <span className="text-[#ff7700] text-lg font-black font-[var(--font-orbitron)]">{analyses.length}</span>
             <span className="text-[10px] text-[#ff7700] font-mono">BIST100 / BIST30</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-3 overflow-hidden">
        {/* Left List: Ranking */}
        <div className="w-[300px] flex flex-col bg-[rgba(0,0,0,0.3)] border border-[rgba(255,119,0,0.1)] rounded-lg overflow-hidden">
          <div className="p-2 border-b border-[rgba(255,119,0,0.1)] bg-[rgba(255,119,0,0.05)] flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#ffcc00] font-[var(--font-orbitron)]">SIRALAMA (INDEX)</span>
            <div className="w-2 h-2 rounded-full bg-[#ffcc00] animate-pulse shadow-[0_0_8px_#ffcc00]" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {analyses.map((a, i) => (
              <div 
                key={a.ticker}
                onClick={() => onSelectTicker(a.ticker)}
                className={`p-2 border-b border-[rgba(255,119,0,0.05)] cursor-pointer transition-all flex items-center gap-3 ${
                  selectedTicker === a.ticker ? 'bg-[rgba(255,119,0,0.15)] border-l-2 border-l-[#ff7700]' : 'hover:bg-[rgba(255,119,0,0.05)]'
                }`}
              >
                <span className="text-[10px] font-mono text-[rgba(255,119,0,0.4)] w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-[#ff7700]">{a.ticker}</span>
                    <span className="text-[10px] font-mono text-[#00ff9d] font-bold">{a.investmentIndex}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-[rgba(255,255,255,0.4)] truncate max-w-[100px]">{a.name}</span>
                    <span className={`text-[8px] px-1 rounded-sm ${
                      a.investmentIndex >= 60 ? 'text-[#00ff9d] bg-[#00ff9d]/10' : 
                      a.investmentIndex >= 40 ? 'text-[#ffcc00] bg-[#ffcc00]/10' : 'text-[#ff2244] bg-[#ff2244]/10'
                    }`}>
                      {a.decision}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Details: Deep Analysis */}
        <div className="flex-1 flex flex-col bg-[rgba(0,0,0,0.5)] border border-[rgba(255,119,0,0.15)] rounded-lg overflow-hidden backdrop-blur-xl">
          <div className="p-4 border-b border-[rgba(255,119,0,0.2)] bg-gradient-to-r from-[rgba(255,119,0,0.1)] to-transparent flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-[#ff7700] font-[var(--font-orbitron)] tracking-tighter">{selectedAnalysis.ticker}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(255,119,0,0.1)] text-[rgba(255,119,0,0.7)] border border-[rgba(255,119,0,0.2)]">
                  {selectedAnalysis.sector}
                </span>
              </div>
              <div className="text-[11px] text-[rgba(255,255,255,0.5)]">{selectedAnalysis.name}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-[#00ff9d] font-[var(--font-orbitron)] [text-shadow:0_0_20px_rgba(0,255,157,0.4)]">
                {selectedAnalysis.investmentIndex}
              </div>
              <div className="text-[10px] font-bold text-[rgba(0,255,157,0.7)] tracking-[2px] font-[var(--font-orbitron)] mt-1">INVESTMENT INDEX</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* Score Overview */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-[rgba(0,0,0,0.3)] border border-[rgba(0,255,157,0.1)] rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-[#00ff9d] font-[var(--font-orbitron)] tracking-widest uppercase">Teknik Puan</span>
                  <span className="text-xl font-black text-[#00ff9d] font-mono">{selectedAnalysis.technicalScore}</span>
                </div>
                <div className="h-2 bg-[rgba(0,255,157,0.05)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00ff9d]/40 to-[#00ff9d] shadow-[0_0_10px_rgba(0,255,157,0.5)] transition-all duration-1000"
                    style={{ width: `${selectedAnalysis.technicalScore}%` }}
                  />
                </div>
              </div>
              <div className="p-4 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,0,170,0.1)] rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-[#ff00aa] font-[var(--font-orbitron)] tracking-widest uppercase">Temel Puan</span>
                  <span className="text-xl font-black text-[#ff00aa] font-mono">{selectedAnalysis.fundamentalScore}</span>
                </div>
                <div className="h-2 bg-[rgba(255,0,170,0.05)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ff00aa]/40 to-[#ff00aa] shadow-[0_0_10px_rgba(255,0,170,0.5)] transition-all duration-1000"
                    style={{ width: `${selectedAnalysis.fundamentalScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Signals Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Technical Signals */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-[rgba(255,119,0,0.6)] font-[var(--font-orbitron)] tracking-[3px] border-b border-[rgba(255,119,0,0.1)] pb-1 mb-4">TEKNİK SİNYALLER</div>
                {Object.entries(selectedAnalysis.techSignals).map(([key, signal]) => (
                  <div key={key} className="flex flex-col gap-1 p-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                    <div className="text-[8px] text-[rgba(255,255,255,0.3)] font-mono">{key}</div>
                    <div className="text-[11px] text-[rgba(255,255,255,0.8)] font-semibold">{signal}</div>
                  </div>
                ))}
              </div>

              {/* Fundamental Signals */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-[rgba(255,119,0,0.6)] font-[var(--font-orbitron)] tracking-[3px] border-b border-[rgba(255,119,0,0.1)] pb-1 mb-4">TEMEL SİNYALLER</div>
                {Object.entries(selectedAnalysis.fundSignals).map(([key, signal]) => (
                  <div key={key} className="flex flex-col gap-1 p-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                    <div className="text-[8px] text-[rgba(255,255,255,0.3)] font-mono">{key}</div>
                    <div className="text-[11px] text-[rgba(255,255,255,0.8)] font-semibold">{signal}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="mt-8 grid grid-cols-4 gap-4">
              <div className="p-3 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-lg text-center">
                <div className="text-[8px] text-[rgba(255,255,255,0.4)] mb-1">F/K (P/E)</div>
                <div className="text-sm font-bold text-[#ffcc00] font-mono">{selectedAnalysis.pe || '—'}</div>
              </div>
              <div className="p-3 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-lg text-center">
                <div className="text-[8px] text-[rgba(255,255,255,0.4)] mb-1">PD/DD (P/B)</div>
                <div className="text-sm font-bold text-[#ffcc00] font-mono">{selectedAnalysis.pb || '—'}</div>
              </div>
              <div className="p-3 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-lg text-center">
                <div className="text-[8px] text-[rgba(255,255,255,0.4)] mb-1">ROE (%)</div>
                <div className="text-sm font-bold text-[#ffcc00] font-mono">%{((selectedAnalysis.roe || 0) * 100).toFixed(1)}</div>
              </div>
              <div className="p-3 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-lg text-center">
                <div className="text-[8px] text-[rgba(255,255,255,0.4)] mb-1">BORÇ/FAVÖK</div>
                <div className="text-sm font-bold text-[#ffcc00] font-mono">{selectedAnalysis.debtEbitda || '—'}</div>
              </div>
            </div>

            {/* Final Decision */}
            <div className="mt-8 p-6 bg-gradient-to-br from-[rgba(0,255,157,0.1)] to-[rgba(0,0,0,0.4)] border border-[rgba(0,255,157,0.2)] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="text-[11px] font-bold text-[rgba(0,255,157,0.8)] font-[var(--font-orbitron)] tracking-[4px] uppercase border-r border-[rgba(0,255,157,0.2)] pr-8 py-2">
                  YATIRIM KARAR MATRİSİ
                </div>
                <div className="text-4xl font-black text-white font-[var(--font-orbitron)] flex items-center gap-4 [text-shadow:0_0_20px_rgba(255,255,255,0.2)]">
                  {selectedAnalysis.decisionEmoji}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-[rgba(255,255,255,0.4)] mb-1 max-w-[200px]">
                  Bu analiz, yapay zeka destekli teknik ve temel verilerin ağırlıklı ortalamasına dayanmaktadır.
                </div>
                <div className="text-[8px] text-[#ff7700] italic font-bold">YATIRIM TAVSİYESİ DEĞİLDİR.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
