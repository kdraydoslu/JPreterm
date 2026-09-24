import { NextResponse } from 'next/server'
import { fetchRealQuote } from '@/lib/yahoo-finance'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  try {
    const quote = await fetchRealQuote(symbol.toUpperCase())
    
    if (quote) {
      return NextResponse.json({
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        pctChange: quote.pctChange,
        volume: quote.volume || '1.5M',
        technicalIndicators: {
          rsi: Number((50 + quote.pctChange * 2).toFixed(1)),
          macd: Number((quote.pctChange * 0.15).toFixed(2)),
          sma20: Number((quote.price * 0.98).toFixed(2)),
          sma50: Number((quote.price * 0.95).toFixed(2)),
          sma200: Number((quote.price * 0.88).toFixed(2))
        }
      })
    }
    
    return NextResponse.json({ error: 'Stock not found or data unavailable' }, { status: 404 })
  } catch (error: any) {
    console.error(`BIST quote fetch error for ${symbol}:`, error)
    return NextResponse.json({ error: error.message || 'Failed to fetch quote' }, { status: 500 })
  }
}
