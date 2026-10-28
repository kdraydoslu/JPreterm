import { NextResponse } from 'next/server'
import { fetchRealQuotes } from '@/lib/yahoo-finance'

export const dynamic = 'force-dynamic'

const BIST_WATCHLIST = [
  'THYAO', 'GARAN', 'AKBNK', 'ASELS', 'EREGL', 'TUPRS',
  'SAHOL', 'KCHOL', 'BIMAS', 'SISE', 'YKBNK', 'ISCTR',
  'TCELL', 'FROTO', 'TOASO', 'PGSUS', 'ENKAI',
]

export async function GET() {
  try {
    const quotes = await fetchRealQuotes([...BIST_WATCHLIST, 'BIST 100', 'BIST 30', 'USD/TRY', 'EUR/TRY'])

    const stocks = BIST_WATCHLIST.flatMap((symbol) => {
      const quote = quotes[symbol]
      if (!quote) return []
      return [{
        symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        pctChange: quote.pctChange,
        previousClose: quote.previousClose,
        volume: quote.volume ?? null,
        high: quote.high ?? null,
        low: quote.low ?? null,
      }]
    })

    const gainers = [...stocks].filter((stock) => stock.pctChange > 0).sort((a, b) => b.pctChange - a.pctChange).slice(0, 5)
    const losers = [...stocks].filter((stock) => stock.pctChange < 0).sort((a, b) => a.pctChange - b.pctChange).slice(0, 5)
    const bist100Quote = quotes['BIST 100']

    return NextResponse.json({
      stocks,
      gainers,
      losers,
      missing: [...BIST_WATCHLIST, 'BIST 100', 'BIST 30', 'USD/TRY', 'EUR/TRY'].filter((symbol) => !quotes[symbol]),
      bist100: bist100Quote ? {
        value: bist100Quote.price,
        change: bist100Quote.pctChange,
        high: bist100Quote.high ?? null,
        low: bist100Quote.low ?? null,
        volume: bist100Quote.volume ?? null,
        previousClose: bist100Quote.previousClose,
      } : null,
      usdTry: quotes['USD/TRY']?.price ?? null,
      eurTry: quotes['EUR/TRY']?.price ?? null,
      timestamp: new Date().toISOString(),
      changeBasis: 'previous_session_close',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch BIST data'
    console.error('BIST data fetch error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
