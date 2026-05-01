import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import refreshMarketData from '@/lib/market-data-refresh'

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    let data: any = await redis.get('market_data');
    if (!data || !data.bist_stocks) {
       await refreshMarketData();
       data = await redis.get('market_data');
    }

    if (!data || !data.bist_stocks) {
        return NextResponse.json({ error: 'Data not ready' }, { status: 500 })
    }

    const bistStocks = data.bist_stocks;
    
    // Günlük yükselenleri hesapla (change > 0)
    const gainers = [...bistStocks]
      .filter(stock => stock.change > 0)
      .sort((a, b) => b.pctChange - a.pctChange)
      .slice(0, 5)

    // Günlük düşenleri hesapla (change < 0)
    const losers = [...bistStocks]
      .filter(stock => stock.change < 0)
      .sort((a, b) => a.pctChange - b.pctChange)
      .slice(0, 5)

    // BIST 100 endeksi (Eğer americas içinde BIST 100 varsa)
    let bist100 = {
      value: 10234.56,
      change: 0.87,
      high: 10289.34,
      low: 10156.78,
      volume: '89.5B'
    }

    if (data.americas) {
       const bistIndexData = data.americas.find((idx: any) => idx.id === 'BIST 100');
       if (bistIndexData) {
          bist100 = {
             value: bistIndexData.value,
             change: bistIndexData.pctChange,
             high: bistIndexData.value * 1.01,
             low: bistIndexData.value * 0.99,
             volume: '89.5B'
          }
       }
    }

    return NextResponse.json({
      stocks: bistStocks,
      gainers,
      losers,
      bist100,
      timestamp: data.lastUpdated || new Date().toISOString()
    })
  } catch (error) {
    console.error('BIST data fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch BIST data' }, { status: 500 })
  }
}
