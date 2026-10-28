import { fetchText } from '@/lib/http'
import type { ChartPoint } from '@/lib/snapshot-types'

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

const cache = new Map<string, { data: RealQuote; time: number }>()
const seriesCache = new Map<string, { data: ChartPoint[]; time: number }>()
const CACHE_TTL = 30000

export const SYMBOL_MAP: Record<string, { yahoo: string; name: string }> = {
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
  'DAX': { yahoo: '^GDAXI', name: 'DAX' },
  'FTSE': { yahoo: '^FTSE', name: 'FTSE 100' },
  'CAC': { yahoo: '^FCHI', name: 'CAC 40' },
  'STOXX': { yahoo: '^STOXX50E', name: 'Euro Stoxx 50' },
  'NIKKEI': { yahoo: '^N225', name: 'Nikkei 225' },
  'KOSPI': { yahoo: '^KS11', name: 'KOSPI' },
  'HSI': { yahoo: '^HSI', name: 'Hang Seng' },
  'SHCOMP': { yahoo: '000001.SS', name: 'Shanghai' },
  'NIFTY': { yahoo: '^NSEI', name: 'Nifty 50' },
  'BOVESPA': { yahoo: '^BVSP', name: 'Bovespa' },

  'USD/TRY': { yahoo: 'USDTRY=X', name: 'Dolar / TL' },
  'USDTRY': { yahoo: 'USDTRY=X', name: 'Dolar / TL' },
  'EUR/TRY': { yahoo: 'EURTRY=X', name: 'Euro / TL' },
  'EURTRY': { yahoo: 'EURTRY=X', name: 'Euro / TL' },
  'EUR/USD': { yahoo: 'EURUSD=X', name: 'Euro / Dolar' },
  'EURUSD': { yahoo: 'EURUSD=X', name: 'Euro / Dolar' },
  'GBP/TRY': { yahoo: 'GBPTRY=X', name: 'Sterlin / TL' },
  'GBPTRY': { yahoo: 'GBPTRY=X', name: 'Sterlin / TL' },
  'USD/JPY': { yahoo: 'JPY=X', name: 'Dolar / Yen' },
  'USDJPY': { yahoo: 'JPY=X', name: 'Dolar / Yen' },

  'GOLD': { yahoo: 'GC=F', name: 'Altın (Ons)' },
  'SILVER': { yahoo: 'SI=F', name: 'Gümüş (Ons)' },
  'OIL (WTI)': { yahoo: 'CL=F', name: 'Ham Petrol (WTI)' },
  'BRENT': { yahoo: 'BZ=F', name: 'Brent Petrol' },
  'COPPER': { yahoo: 'HG=F', name: 'Bakır' },
  'BTC': { yahoo: 'BTC-USD', name: 'Bitcoin' },
  'ETH': { yahoo: 'ETH-USD', name: 'Ethereum' },

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
  'ENKAI': { yahoo: 'ENKAI.IS', name: 'Enka İnşaat' },
}

export function formatVolume(vol: number): string {
  if (!vol || isNaN(vol)) return '0'
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`
  return vol.toString()
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function roundPrice(price: number): number {
  const abs = Math.abs(price)
  const digits = abs >= 100 ? 2 : abs >= 1 ? 4 : 6
  return Number(price.toFixed(digits))
}

interface DailyBar {
  close: number
}

/**
 * range=5d iken chartPreviousClose pencerenin başındaki (~5 seans önceki)
 * kapanıştır. Günlük değişim fulldayChange alanından, o yoksa günlük
 * kapanış dizisindeki bir önceki bardan alınır.
 */
export function dailyMoveFromChart(meta: Record<string, unknown>, closes: Array<number | null>): {
  price: number
  change: number
  pctChange: number
  previousClose: number
} | null {
  const price = finite(meta.regularMarketPrice) ? meta.regularMarketPrice : null
  if (price == null) return null

  const dayChange = finite(meta.fulldayChange) ? meta.fulldayChange : null
  const dayPct = finite(meta.fulldayChangePercent)
    ? meta.fulldayChangePercent
    : finite(meta.regularMarketChangePercent)
      ? meta.regularMarketChangePercent
      : null

  if (dayChange != null && dayPct != null) {
    return {
      price,
      change: dayChange,
      pctChange: dayPct,
      previousClose: price - dayChange,
    }
  }

  const bars: DailyBar[] = []
  for (const close of closes) {
    if (finite(close)) bars.push({ close })
  }
  if (bars.length === 0) return null

  const last = bars[bars.length - 1].close
  const prior = bars.length >= 2 ? bars[bars.length - 2].close : last
  const tolerance = Math.max(0.0001, Math.abs(price) * 1e-4)
  const previousClose = Math.abs(price - last) <= tolerance && bars.length >= 2 ? prior : last
  if (!previousClose) return null
  const change = price - previousClose
  return {
    price,
    change,
    pctChange: (change / previousClose) * 100,
    previousClose,
  }
}

async function loadChart(yahooSym: string, interval: string, range: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=${interval}&range=${range}`
  const text = await fetchText(url, { timeoutMs: 10000, accept: 'application/json' })
  const json = JSON.parse(text) as {
    chart?: { result?: Array<{ meta?: Record<string, unknown>; timestamp?: number[]; indicators?: { quote?: Array<{ close?: Array<number | null> }> } }> }
  }
  return json.chart?.result?.[0] ?? null
}

function toQuote(
  rawSymbol: string,
  name: string,
  meta: Record<string, unknown>,
  closes: Array<number | null>
): RealQuote | null {
  const move = dailyMoveFromChart(meta, closes)
  if (!move) return null
  const high = finite(meta.regularMarketDayHigh) ? meta.regularMarketDayHigh : undefined
  const low = finite(meta.regularMarketDayLow) ? meta.regularMarketDayLow : undefined
  const volume = finite(meta.regularMarketVolume) ? formatVolume(meta.regularMarketVolume) : undefined
  return {
    symbol: rawSymbol,
    name,
    price: roundPrice(move.price),
    change: Number(move.change.toFixed(4)),
    pctChange: Number(move.pctChange.toFixed(4)),
    previousClose: roundPrice(move.previousClose),
    high: high != null ? roundPrice(high) : undefined,
    low: low != null ? roundPrice(low) : undefined,
    volume,
    currency: typeof meta.currency === 'string' ? meta.currency : undefined,
    timestamp: new Date().toISOString(),
  }
}

export async function fetchRealQuote(rawSymbol: string): Promise<RealQuote | null> {
  const mapping = SYMBOL_MAP[rawSymbol] || {
    yahoo: rawSymbol.endsWith('.IS') ? rawSymbol : rawSymbol,
    name: rawSymbol,
  }
  const yahooSym = mapping.yahoo
  const cached = cache.get(yahooSym)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return { ...cached.data, symbol: rawSymbol, name: mapping.name }
  }

  try {
    const result = await loadChart(yahooSym, '1d', '5d')
    if (!result?.meta) return null
    const closes = result.indicators?.quote?.[0]?.close ?? []
    const quote = toQuote(rawSymbol, mapping.name, result.meta, closes)
    if (!quote) return null
    cache.set(yahooSym, { data: quote, time: Date.now() })
    return quote
  } catch (error) {
    console.error(`Yahoo quote failed for ${rawSymbol}:`, error instanceof Error ? error.message : 'error')
    return null
  }
}

export async function fetchRealQuotes(symbols: string[]): Promise<Record<string, RealQuote>> {
  const quotes: Record<string, RealQuote> = {}
  const unique = [...new Set(symbols)]
  const results = await mapPool(unique, 8, async (symbol) => fetchRealQuote(symbol))
  unique.forEach((symbol, index) => {
    const quote = results[index]
    if (quote) quotes[symbol] = quote
  })
  return quotes
}

export async function fetchYahooSeries(yahooSym: string): Promise<ChartPoint[]> {
  const cached = seriesCache.get(yahooSym)
  if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data
  const result = await loadChart(yahooSym, '60m', '5d')
  const timestamps = result?.timestamp ?? []
  const closes = result?.indicators?.quote?.[0]?.close ?? []
  const points: ChartPoint[] = []
  for (let i = 0; i < timestamps.length; i++) {
    const value = closes[i]
    const time = timestamps[i]
    if (finite(value) && finite(time)) points.push({ time, value })
  }
  seriesCache.set(yahooSym, { data: points, time: Date.now() })
  return points
}

export async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await fn(items[index])
    }
  })
  await Promise.all(workers)
  return results
}
