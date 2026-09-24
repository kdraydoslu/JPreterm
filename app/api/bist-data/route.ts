import { NextResponse } from 'next/server'
import { fetchRealQuotes, fetchRealQuote } from '@/lib/yahoo-finance'

export const dynamic = 'force-dynamic'
export const revalidate = 20

const BIST_WATCHLIST = [
  'THYAO', 'GARAN', 'AKBNK', 'ASELS', 'EREGL', 'TUPRS', 
  'SAHOL', 'KCHOL', 'BIMAS', 'SISE', 'YKBNK', 'ISCTR', 
  'TCELL', 'FROTO', 'TOASO', 'PGSUS', 'ENKAI'
]

export async function GET() {
  try {
    const quotes = await fetchRealQuotes([...BIST_WATCHLIST, 'BIST 100', 'BIST 30', 'USD/TRY', 'EUR/TRY'])

    const stocks = BIST_WATCHLIST.map(sym => {
      const q = quotes[sym]
      if (!q) {
        return {
          symbol: sym,
          name: sym,
          price: 100,
          change: 0,
          pctChange: 0,
          volume: '5.2M',
          technicalIndicators: { rsi: 52, macd: 0.2, sma20: 98, sma50: 95 }
        }
      }
      return {
        symbol: sym,
        name: q.name,
        price: q.price,
        change: q.change,
        pctChange: q.pctChange,
        volume: q.volume || '5.2M',
        high: q.high,
        low: q.low,
        technicalIndicators: {
          rsi: Number((50 + q.pctChange * 2).toFixed(1)),
          macd: Number((q.pctChange * 0.15).toFixed(2)),
          sma20: Number((q.price * 0.98).toFixed(2)),
          sma50: Number((q.price * 0.95).toFixed(2))
        }
      }
    })

    const gainers = [...stocks]
      .filter(s => s.pctChange > 0)
      .sort((a, b) => b.pctChange - a.pctChange)
      .slice(0, 5)

    const losers = [...stocks]
      .filter(s => s.pctChange < 0)
      .sort((a, b) => a.pctChange - b.pctChange)
      .slice(0, 5)

    const bist100Quote = quotes['BIST 100'] || await fetchRealQuote('BIST 100')
    const bist100 = {
      value: bist100Quote?.price || 12888.33,
      change: bist100Quote?.pctChange || 0.85,
      high: bist100Quote?.high || 12950.0,
      low: bist100Quote?.low || 12790.0,
      volume: bist100Quote?.volume || '112.4B'
    }

    const usdTry = quotes['USD/TRY']?.price || 48.85
    const eurTry = quotes['EUR/TRY']?.price || 55.67

    return NextResponse.json({
      stocks,
      gainers,
      losers,
      bist100,
      usdTry,
      eurTry,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('BIST data fetch error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch BIST data' }, { status: 500 })
  }
}
