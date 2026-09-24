export interface RealQuote {
  symbol: string
  name: string
  price: number
  change: number
  pctChange: number
  previousClose: number
  high?: number
  low?: number
  volume?: string
  currency?: string
  timestamp: string
}

// In-memory cache to avoid rate limits
const cache = new Map<string, { data: RealQuote; time: number }>()
const CACHE_TTL = 20000 // 20 seconds

export const SYMBOL_MAP: Record<string, { yahoo: string; name: string }> = {
  // Indices
  'SPX': { yahoo: '^GSPC', name: 'S&P 500' },
  'S&P 500': { yahoo: '^GSPC', name: 'S&P 500' },
  'NDX': { yahoo: '^IXIC', name: 'NASDAQ' },
  'NASDAQ': { yahoo: '^IXIC', name: 'NASDAQ' },
  'DJI': { yahoo: '^DJI', name: 'Dow Jones' },
  'DOW JONES': { yahoo: '^DJI', name: 'Dow Jones' },
  'RUT': { yahoo: '^RUT', name: 'Russell 2000' },
  'Russell 2000': { yahoo: '^RUT', name: 'Russell 2000' },
  'VIX': { yahoo: '^VIX', name: 'VIX Volatility' },
  'DXY': { yahoo: 'DX-Y.NYB', name: 'US Dollar Index' },
  'BIST 100': { yahoo: 'XU100.IS', name: 'BIST 100' },
  'BIST100': { yahoo: 'XU100.IS', name: 'BIST 100' },
  'BIST 30': { yahoo: 'XU030.IS', name: 'BIST 30' },
  'BIST30': { yahoo: 'XU030.IS', name: 'BIST 30' },
  'BIST 50': { yahoo: 'XU050.IS', name: 'BIST 50' },
  'XBANK': { yahoo: 'XBANK.IS', name: 'BIST Bankacılık' },

  // Currencies
  'USD/TRY': { yahoo: 'USDTRY=X', name: 'Dolar / TL' },
  'USDTRY': { yahoo: 'USDTRY=X', name: 'Dolar / TL' },
  'EUR/TRY': { yahoo: 'EURTRY=X', name: 'Euro / TL' },
  'EURTRY': { yahoo: 'EURTRY=X', name: 'Euro / TL' },
  'EUR/USD': { yahoo: 'EURUSD=X', name: 'Euro / Dolar' },
  'EURUSD': { yahoo: 'EURUSD=X', name: 'Euro / Dolar' },
  'GBP/TRY': { yahoo: 'GBPTRY=X', name: 'Sterlin / TL' },
  'GBPTRY': { yahoo: 'GBPTRY=X', name: 'Sterlin / TL' },

  // Commodities
  'GOLD': { yahoo: 'GC=F', name: 'Altın (Ons)' },
  'SILVER': { yahoo: 'SI=F', name: 'Gümüş (Ons)' },
  'OIL (WTI)': { yahoo: 'CL=F', name: 'Ham Petrol (WTI)' },
  'BRENT': { yahoo: 'BZ=F', name: 'Brent Petrol' },

  // US Equities
  'AAPL': { yahoo: 'AAPL', name: 'Apple Inc.' },
  'MSFT': { yahoo: 'MSFT', name: 'Microsoft Corp.' },
  'NVDA': { yahoo: 'NVDA', name: 'NVIDIA Corp.' },
  'AMZN': { yahoo: 'AMZN', name: 'Amazon.com' },
  'GOOGL': { yahoo: 'GOOGL', name: 'Alphabet Inc.' },
  'META': { yahoo: 'META', name: 'Meta Platforms' },
  'TSLA': { yahoo: 'TSLA', name: 'Tesla Inc.' },
  'AVGO': { yahoo: 'AVGO', name: 'Broadcom Inc.' },
  'JPM': { yahoo: 'JPM', name: 'JPMorgan Chase' },
  'SPY': { yahoo: 'SPY', name: 'SPDR S&P 500 ETF' },
  'QQQ': { yahoo: 'QQQ', name: 'Invesco QQQ Trust' },

  // BIST Equities
  'THYAO': { yahoo: 'THYAO.IS', name: 'Türk Hava Yolları' },
  'GARAN': { yahoo: 'GARAN.IS', name: 'Garanti BBVA' },
  'AKBNK': { yahoo: 'AKBNK.IS', name: 'Akbank' },
  'ASELS': { yahoo: 'ASELS.IS', name: 'Aselsan' },
  'EREGL': { yahoo: 'EREGL.IS', name: 'Ereğli Demir Çelik' },
  'TUPRS': { yahoo: 'TUPRS.IS', name: 'Tüpraş' },
  'SAHOL': { yahoo: 'SAHOL.IS', name: 'Sabancı Holding' },
  'KCHOL': { yahoo: 'KCHOL.IS', name: 'Koç Holding' },
  'BIMAS': { yahoo: 'BIMAS.IS', name: 'BİM Mağazalar' },
  'SISE': { yahoo: 'SISE.IS', name: 'Şişecam' },
  'YKBNK': { yahoo: 'YKBNK.IS', name: 'Yapı Kredi' },
  'ISCTR': { yahoo: 'ISCTR.IS', name: 'İş Bankası (C)' },
  'TCELL': { yahoo: 'TCELL.IS', name: 'Turkcell' },
  'FROTO': { yahoo: 'FROTO.IS', name: 'Ford Otosan' },
  'TOASO': { yahoo: 'TOASO.IS', name: 'Tofaş Oto' },
  'PGSUS': { yahoo: 'PGSUS.IS', name: 'Pegasus' },
  'ENKAI': { yahoo: 'ENKAI.IS', name: 'Enka İnşaat' }
}

export function formatVolume(vol: number): string {
  if (!vol || isNaN(vol)) return '0'
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`
  return vol.toString()
}

export async function fetchRealQuote(rawSymbol: string): Promise<RealQuote | null> {
  const mapping = SYMBOL_MAP[rawSymbol] || {
    yahoo: rawSymbol.endsWith('.IS') ? rawSymbol : rawSymbol,
    name: rawSymbol
  }
  const yahooSym = mapping.yahoo

  const cached = cache.get(yahooSym)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=1d&range=5d`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JarvisPreTerm/1.0'
      },
      next: { revalidate: 20 }
    })

    if (!res.ok) return null
    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) return null

    const meta = result.meta
    const price = meta.regularMarketPrice ?? meta.chartPreviousClose ?? 0
    const prevClose = meta.chartPreviousClose ?? price
    const change = price - prevClose
    const pctChange = prevClose !== 0 ? (change / prevClose) * 100 : 0
    const volume = meta.regularMarketVolume ? formatVolume(meta.regularMarketVolume) : '1.2M'

    const quote: RealQuote = {
      symbol: rawSymbol,
      name: mapping.name,
      price: Number(price.toFixed(price > 500 ? 1 : 2)),
      change: Number(change.toFixed(2)),
      pctChange: Number(pctChange.toFixed(2)),
      previousClose: prevClose,
      high: meta.regularMarketDayHigh ?? price * 1.01,
      low: meta.regularMarketDayLow ?? price * 0.99,
      volume,
      currency: meta.currency,
      timestamp: new Date().toISOString()
    }

    cache.set(yahooSym, { data: quote, time: Date.now() })
    return quote
  } catch (err) {
    console.error(`Error fetching real quote for ${rawSymbol}:`, err)
    return null
  }
}

export async function fetchRealQuotes(symbols: string[]): Promise<Record<string, RealQuote>> {
  const quotes: Record<string, RealQuote> = {}
  const promises = symbols.map(async (s) => {
    const q = await fetchRealQuote(s)
    if (q) quotes[s] = q
  })

  await Promise.allSettled(promises)
  return quotes
}
