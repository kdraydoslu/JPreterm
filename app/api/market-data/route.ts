import { NextResponse } from 'next/server'
import { fetchRealQuotes } from '@/lib/yahoo-finance'

export const dynamic = 'force-dynamic'

const US_WATCHLIST = ['NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AVGO', 'JPM', 'SPY', 'QQQ']
const GLOBAL_INDICES = ['S&P 500', 'NASDAQ', 'DOW JONES', 'Russell 2000', 'VIX', 'DXY', 'BIST 100', 'GOLD', 'OIL (WTI)', 'BRENT']

export async function GET() {
  try {
    const quotes = await fetchRealQuotes([...US_WATCHLIST, ...GLOBAL_INDICES])

    const americas = ['S&P 500', 'NASDAQ', 'DOW JONES', 'Russell 2000', 'BIST 100'].flatMap((id) => {
      const quote = quotes[id]
      if (!quote) return []
      return [{
        id,
        value: quote.price,
        change: quote.change,
        pctChange: quote.pctChange,
        previousClose: quote.previousClose,
      }]
    })

    const us_stocks = US_WATCHLIST.flatMap((symbol) => {
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

    return NextResponse.json({
      americas,
      us_stocks,
      indicators: {
        vix: quotes['VIX']?.price ?? null,
        dxy: quotes['DXY']?.price ?? null,
        gold: quotes['GOLD']?.price ?? null,
        oil: quotes['OIL (WTI)']?.price ?? null,
        brent: quotes['BRENT']?.price ?? null,
      },
      missing: [...US_WATCHLIST, ...GLOBAL_INDICES].filter((symbol) => !quotes[symbol]),
      lastUpdated: new Date().toISOString(),
      dataSource: 'yahoo-finance-live',
      changeBasis: 'previous_session_close',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('Market data API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
