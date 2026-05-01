import { NextResponse } from 'next/server'
import { fetchStockWatchlist } from '@/lib/alpha-vantage'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  try {
    // Append .IS for Alpha Vantage BIST symbols if it doesn't already have it
    const formattedSymbol = symbol.endsWith('.IS') ? symbol : `${symbol}.IS`
    
    const results = await fetchStockWatchlist([formattedSymbol])
    
    if (results && results.length > 0) {
      return NextResponse.json(results[0])
    }
    
    return NextResponse.json({ error: 'Stock not found or data unavailable' }, { status: 404 })
  } catch (error) {
    console.error(`BIST quote fetch error for ${symbol}:`, error)
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}
