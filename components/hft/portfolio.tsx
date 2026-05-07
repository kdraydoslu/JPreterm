'use client'

import { useEffect, useState } from 'react'
import { marketDataService } from '@/lib/market-data'
import { polymarketService, type Position as PolyPosition, type WalletBalance } from '@/lib/polymarket-service'
import { ExternalLink, Wallet, TrendingUp, TrendingDown, Briefcase } from 'lucide-react'

interface Position {
  symbol: string
  side: 'LONG' | 'SHORT'
  size: number
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  leverage: number
}

// ── Kişisel Finans Takipçisi types (localStorage'dan) ──────────────────────
interface PersonalAccount {
  id: string
  name: string
  type: string
  balance: number
}

interface PersonalAsset {
  id: string
  name: string
  symbol?: string
  category?: string
  quantity: number
  averageBuyPrice: number
  currentPrice: number
  accountId: string
}

interface PersonalDebt {
  id: string
  type: string
  personOrOrganization: string
  amount: number
  isCompleted: boolean
}

interface PersonalPortfolioData {
  accounts: PersonalAccount[]
  assets: PersonalAsset[]
  debts: PersonalDebt[]
  transactions: any[]
}

// ── LocalStorage'dan kişisel finans verisini yükler ────────────────────────
function loadPersonalPortfolio(): PersonalPortfolioData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('portfolioData')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const fmt = (v: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v)

// ── Mini Personal Finance Widget ───────────────────────────────────────────
function PersonalFinanceWidget() {
  const [data, setData] = useState<PersonalPortfolioData | null>(null)

  useEffect(() => {
    const load = () => setData(loadPersonalPortfolio())
    load()
    // Storage değişikliklerini dinle
    window.addEventListener('storage', load)
    const interval = setInterval(load, 5000)
    return () => {
      window.removeEventListener('storage', load)
      clearInterval(interval)
    }
  }, [])

  if (!data) {
    return (
      <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.15)] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet size={12} className="text-[#ff7700]" />
            <span className="font-[var(--font-orbitron)] text-xs text-[rgba(255,119,0,0.6)] tracking-widest uppercase">
              Kişisel Finans
            </span>
          </div>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[rgba(255,119,0,0.4)] hover:text-[#ff7700] transition-colors"
            title="Finans Takipçisini Aç"
          >
            <ExternalLink size={12} />
          </a>
        </div>
        <p className="text-[rgba(255,119,0,0.35)] text-xs font-mono">Veri yok — localhost:3000 aç</p>
      </div>
    )
  }

  const totalCash    = data.accounts.reduce((s, a) => s + a.balance, 0)
  const totalAssets  = data.assets.reduce((s, a) => s + a.quantity * a.currentPrice, 0)
  const totalRec     = data.debts.filter(d => d.type === 'alacak' && !d.isCompleted).reduce((s, d) => s + d.amount, 0)
  const totalLiab    = data.debts.filter(d => ['borc', 'kredi', 'kredi_karti'].includes(d.type) && !d.isCompleted).reduce((s, d) => s + d.amount, 0)
  const netWorth     = totalCash + totalAssets + totalRec - totalLiab

  const totalCost    = data.assets.reduce((s, a) => s + a.quantity * a.averageBuyPrice, 0)
  const assetPL      = totalAssets - totalCost
  const assetPLPct   = totalCost > 0 ? (assetPL / totalCost) * 100 : 0

  return (
    <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={12} className="text-[#ff7700]" />
          <span className="font-[var(--font-orbitron)] text-xs text-[#ff7700] tracking-widest uppercase [text-shadow:var(--glow-orange)]">
            Kişisel Finans
          </span>
        </div>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[rgba(255,119,0,0.4)] hover:text-[#ff7700] transition-colors text-[10px] font-[var(--font-orbitron)]"
          title="Finans Takipçisini Aç"
        >
          <ExternalLink size={10} />
          <span>Aç</span>
        </a>
      </div>

      {/* Net Worth */}
      <div className="mb-4">
        <div className="text-[rgba(255,119,0,0.5)] text-[10px] font-[var(--font-orbitron)] tracking-widest uppercase mb-1">Net Değer</div>
        <div className="font-[var(--font-orbitron)] text-lg font-bold text-[#ff7700] [text-shadow:var(--glow-orange)]">
          {fmt(netWorth)}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[rgba(255,119,0,0.05)] border border-[rgba(255,119,0,0.1)] rounded p-2">
          <div className="text-[rgba(255,119,0,0.45)] text-[9px] font-[var(--font-orbitron)] uppercase tracking-wider mb-1">Nakit & Banka</div>
          <div className="font-[var(--font-orbitron)] text-xs font-bold text-[#00d4ff]">{fmt(totalCash)}</div>
        </div>
        <div className="bg-[rgba(255,119,0,0.05)] border border-[rgba(255,119,0,0.1)] rounded p-2">
          <div className="text-[rgba(255,119,0,0.45)] text-[9px] font-[var(--font-orbitron)] uppercase tracking-wider mb-1">Yatırımlar</div>
          <div className="font-[var(--font-orbitron)] text-xs font-bold text-[#ff7700]">{fmt(totalAssets)}</div>
        </div>
      </div>

      {/* Asset P/L */}
      {data.assets.length > 0 && (
        <div className="flex items-center justify-between mb-3 bg-[rgba(255,119,0,0.04)] border border-[rgba(255,119,0,0.08)] rounded p-2">
          <div className="flex items-center gap-1">
            {assetPL >= 0
              ? <TrendingUp size={10} className="text-[#00ff9d]" />
              : <TrendingDown size={10} className="text-[#ff2244]" />
            }
            <span className="text-[rgba(255,119,0,0.45)] text-[9px] font-[var(--font-orbitron)] uppercase">K/Z</span>
          </div>
          <div className={`font-[var(--font-orbitron)] text-xs font-bold ${assetPL >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
            {assetPL >= 0 ? '+' : ''}{fmt(assetPL)}
            <span className="text-[9px] ml-1 opacity-70">({assetPLPct > 0 ? '+' : ''}{assetPLPct.toFixed(1)}%)</span>
          </div>
        </div>
      )}

      {/* Debt summary */}
      {(totalLiab > 0 || totalRec > 0) && (
        <div className="grid grid-cols-2 gap-2">
          {totalRec > 0 && (
            <div className="bg-[rgba(0,255,157,0.04)] border border-[rgba(0,255,157,0.1)] rounded p-2">
              <div className="text-[rgba(0,255,157,0.45)] text-[9px] font-[var(--font-orbitron)] uppercase tracking-wider mb-1">Alacak</div>
              <div className="font-[var(--font-orbitron)] text-xs font-bold text-[#00ff9d]">+{fmt(totalRec)}</div>
            </div>
          )}
          {totalLiab > 0 && (
            <div className="bg-[rgba(255,34,68,0.04)] border border-[rgba(255,34,68,0.1)] rounded p-2">
              <div className="text-[rgba(255,34,68,0.45)] text-[9px] font-[var(--font-orbitron)] uppercase tracking-wider mb-1">Borç</div>
              <div className="font-[var(--font-orbitron)] text-xs font-bold text-[#ff2244]">-{fmt(totalLiab)}</div>
            </div>
          )}
        </div>
      )}

      {/* Accounts list (compact) */}
      {data.accounts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[rgba(255,119,0,0.1)]">
          <div className="text-[rgba(255,119,0,0.4)] text-[9px] font-[var(--font-orbitron)] uppercase tracking-wider mb-2">
            {data.accounts.length} Hesap
          </div>
          <div className="space-y-1">
            {data.accounts.slice(0, 3).map(acc => (
              <div key={acc.id} className="flex justify-between items-center">
                <span className="text-[rgba(255,238,221,0.55)] text-[10px] truncate max-w-[60%]">{acc.name}</span>
                <span className="font-mono text-[10px] text-[rgba(255,119,0,0.7)]">{fmt(acc.balance)}</span>
              </div>
            ))}
            {data.accounts.length > 3 && (
              <div className="text-[rgba(255,119,0,0.3)] text-[9px] font-[var(--font-orbitron)]">
                +{data.accounts.length - 3} daha...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Ana Portfolio bileşeni ─────────────────────────────────────────────────
export function Portfolio() {
  const [positions, setPositions] = useState<Position[]>([])
  const [polyPositions, setPolyPositions] = useState<PolyPosition[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [totalPnL, setTotalPnL] = useState(0)
  const [dailyPnL, setDailyPnL] = useState(0)
  const [balance, setBalance] = useState<WalletBalance>({ usdc: 0, eth: 0, available: 0 })
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('polymarket_config')
      if (savedConfig) {
        setIsConfigured(true)
        polymarketService.fetchBalance().then(setBalance)
        polymarketService.fetchPositions().then(setPolyPositions)
      }
    }
  }, [])

  useEffect(() => {
    if (!isConfigured) return
    const interval = setInterval(() => {
      polymarketService.fetchBalance().then(setBalance)
      polymarketService.fetchPositions().then(setPolyPositions)
    }, 10000)
    return () => clearInterval(interval)
  }, [isConfigured])

  useEffect(() => {
    setTotalValue(balance.usdc + (balance.eth * 3500))
    setTotalPnL(polyPositions.reduce((acc, p) => acc + p.pnl, 0))
  }, [balance, polyPositions])

  const totalPositionPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0)

  return (
    <div className="h-full bg-[rgba(10,3,0,0.9)] p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-[var(--font-orbitron)] text-3xl font-bold text-[#ff7700] mb-8 [text-shadow:var(--glow-orange)]">
          Portfolio Management
        </h1>

        {/* Trading Portfolio Summary */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-6">
            <div className="text-[rgba(255,119,0,0.6)] text-sm mb-3 font-medium">Total Portfolio Value</div>
            <div className="font-[var(--font-orbitron)] text-2xl text-[#ff7700] mb-2 font-bold">
              ${totalValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </div>
            <div className="text-[#00ff9d] text-base font-semibold">+2.34% (24h)</div>
          </div>

          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-6">
            <div className="text-[rgba(255,119,0,0.6)] text-sm mb-3 font-medium">Total P&L</div>
            <div className={`font-[var(--font-orbitron)] text-2xl mb-2 font-bold ${totalPnL >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </div>
            <div className="text-[rgba(255,119,0,0.6)] text-base">All Time</div>
          </div>

          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-6">
            <div className="text-[rgba(255,119,0,0.6)] text-sm mb-3 font-medium">Daily P&L</div>
            <div className={`font-[var(--font-orbitron)] text-2xl mb-2 font-bold ${dailyPnL >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
              {dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </div>
            <div className="text-[rgba(255,119,0,0.6)] text-base">Last 24h</div>
          </div>

          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-6">
            <div className="text-[rgba(255,119,0,0.6)] text-sm mb-3 font-medium">Open Positions</div>
            <div className="font-[var(--font-orbitron)] text-2xl text-[#ffcc00] mb-2 font-bold">
              {positions.length}
            </div>
            <div className={`text-base font-semibold ${totalPositionPnL >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>
              {totalPositionPnL >= 0 ? '+' : ''}${totalPositionPnL.toFixed(2)}
            </div>
          </div>
        </div>

        {/* ── Kişisel Finans Takipçisi Widget + Positions ──────────────────── */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Personal Finance Widget (sol sütun) */}
          <div className="col-span-1">
            <h2 className="font-[var(--font-orbitron)] text-sm font-bold text-[rgba(255,119,0,0.7)] mb-3 [text-shadow:var(--glow-orange)] uppercase tracking-widest">
              Kişisel Finans
            </h2>
            <PersonalFinanceWidget />
          </div>

          {/* Active Positions (sağ 2 sütun) */}
          <div className="col-span-2">
            <h2 className="font-[var(--font-orbitron)] text-xl font-bold text-[#00ff9d] mb-4 [text-shadow:var(--glow-green)]">
              Active Positions
            </h2>
            <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[rgba(10,1,0,0.8)] border-b border-[rgba(255,119,0,0.2)]">
                  <tr>
                    {['Symbol','Side','Size','Entry','Current','Lev','P&L','P&L %','Action'].map(h => (
                      <th key={h} className={`${h === 'Action' ? 'text-center' : h === 'Symbol' || h === 'Side' ? 'text-left' : 'text-right'} px-4 py-3 text-[rgba(255,119,0,0.6)] text-xs font-[var(--font-orbitron)]`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {positions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-[rgba(255,119,0,0.3)] text-xs font-[var(--font-orbitron)] uppercase tracking-widest">
                        No open positions
                      </td>
                    </tr>
                  ) : positions.map((pos, i) => (
                    <tr key={i} className="border-b border-[rgba(255,119,0,0.1)] hover:bg-[rgba(10,3,0,0.4)]">
                      <td className="px-4 py-3 text-[#ff7700] font-[var(--font-orbitron)] text-sm font-semibold">{pos.symbol.replace('USDT', '/USDT')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${pos.side === 'LONG' ? 'bg-[rgba(0,255,157,0.2)] text-[#00ff9d]' : 'bg-[rgba(255,34,68,0.2)] text-[#ff2244]'}`}>{pos.side}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[rgba(255,238,221,0.9)] text-sm">{pos.size}</td>
                      <td className="px-4 py-3 text-right font-mono text-[rgba(255,238,221,0.9)] text-sm">${pos.entryPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-[#ff7700] text-sm font-semibold">${pos.currentPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-[#ffcc00] text-sm font-semibold">{pos.leverage}x</td>
                      <td className={`px-4 py-3 text-right font-mono font-bold text-sm ${pos.pnl >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>{pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right font-mono font-bold text-sm ${pos.pnlPercent >= 0 ? 'text-[#00ff9d]' : 'text-[#ff2244]'}`}>{pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-center">
                        <button className="bg-[rgba(255,34,68,0.2)] border border-[#ff2244] text-[#ff2244] px-3 py-1 rounded text-xs font-semibold hover:bg-[rgba(255,34,68,0.3)] transition-colors">Close</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Asset Allocation + Risk Metrics */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-6">
            <h3 className="font-[var(--font-orbitron)] text-base font-bold text-[#ff7700] mb-6">Asset Allocation</h3>
            <div className="space-y-4">
              {[
                { name: 'Bitcoin', percent: 45, color: '#ff7700' },
                { name: 'Ethereum', percent: 30, color: '#00ff9d' },
                { name: 'Solana', percent: 15, color: '#ff00aa' },
                { name: 'Others', percent: 10, color: '#ffcc00' },
              ].map((asset) => (
                <div key={asset.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-[rgba(255,119,0,0.8)] text-base font-medium">{asset.name}</span>
                    <span className="text-[#ff7700] text-base font-mono font-semibold">{asset.percent}%</span>
                  </div>
                  <div className="h-3 bg-[rgba(255,119,0,0.1)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${asset.percent}%`, backgroundColor: asset.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[rgba(10,3,0,0.6)] border border-[rgba(255,119,0,0.2)] rounded-lg p-6">
            <h3 className="font-[var(--font-orbitron)] text-base font-bold text-[#ff7700] mb-6">Risk Metrics</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Exposure', value: '$1.2M', color: '#ffcc00' },
                { label: 'Margin Used',   value: '68.4%', color: '#ff2244' },
                { label: 'Available Margin', value: '$456K', color: '#00ff9d' },
                { label: 'Liquidation Risk', value: 'Low',  color: '#00ff9d' },
                { label: 'Sharpe Ratio', value: '2.34',   color: '#ff7700' },
              ].map(m => (
                <div key={m.label} className="flex justify-between">
                  <span className="text-[rgba(255,119,0,0.6)] text-base">{m.label}</span>
                  <span className="font-mono text-base font-semibold" style={{ color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
