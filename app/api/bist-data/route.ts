import { NextResponse } from 'next/server'

// BIST hisseleri için gerçek veri çekme
export async function GET() {
  try {
    // Investing.com'dan veya başka bir kaynaktan BIST verisi çekilebilir
    // Şimdilik popüler BIST hisselerini simüle edelim
    const bistStocks = [
      { symbol: 'THYAO', name: 'Türk Hava Yolları', price: 312.50, change: 1.85, volume: '45.2M' },
      { symbol: 'GARAN', name: 'Garanti BBVA', price: 98.75, change: -0.45, volume: '123.5M' },
      { symbol: 'AKBNK', name: 'Akbank', price: 56.20, change: 2.15, volume: '234.8M' },
      { symbol: 'EREGL', name: 'Ereğli Demir Çelik', price: 45.80, change: 3.25, volume: '89.3M' },
      { symbol: 'TUPRS', name: 'Tüpraş', price: 178.50, change: 1.95, volume: '67.4M' },
      { symbol: 'SAHOL', name: 'Sabancı Holding', price: 89.30, change: -1.20, volume: '156.2M' },
      { symbol: 'KCHOL', name: 'Koç Holding', price: 167.40, change: 0.85, volume: '98.7M' },
      { symbol: 'ASELS', name: 'Aselsan', price: 234.60, change: 4.50, volume: '45.9M' },
      { symbol: 'SISE', name: 'Şişe Cam', price: 67.90, change: 2.30, volume: '78.5M' },
      { symbol: 'PETKM', name: 'Petkim', price: 23.45, change: -2.10, volume: '134.6M' },
    ]

    // Günlük yükselenleri hesapla (change > 2%)
    const gainers = bistStocks
      .filter(stock => stock.change > 2)
      .sort((a, b) => b.change - a.change)
      .slice(0, 5)

    // Günlük düşenleri hesapla (change < -1%)
    const losers = bistStocks
      .filter(stock => stock.change < -1)
      .sort((a, b) => a.change - b.change)
      .slice(0, 5)

    // BIST 100 endeksi
    const bist100 = {
      value: 10234.56,
      change: 0.87,
      high: 10289.34,
      low: 10156.78,
      volume: '89.5B'
    }

    return NextResponse.json({
      stocks: bistStocks,
      gainers,
      losers,
      bist100,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('BIST data fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch BIST data' }, { status: 500 })
  }
}
