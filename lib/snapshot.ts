import { loadEconomicCalendar } from '@/lib/economic-calendar'
import { loadLiquidity } from '@/lib/liquidity'
import { MARKET_CATALOG, QUOTE_NOTE, type CatalogItem } from '@/lib/market-catalog'
import type {
  ChartModuleData,
  ChartSeries,
  ModuleResult,
  MoversData,
  NewsBrief,
  Quote,
  QuoteModuleData,
  Snapshot,
} from '@/lib/snapshot-types'
import { loadTcmbFx } from '@/lib/tcmb-fx'
import { loadTerminalNews } from '@/lib/terminal-news'
import { loadTreasury } from '@/lib/treasury'
import { fetchRealQuote, fetchYahooSeries, mapPool, type RealQuote } from '@/lib/yahoo-finance'

const YAHOO = 'Yahoo Finance chart API'
const REFRESH_SECONDS = 45
const CACHE_MS = 30000

let cache: { at: number; data: Snapshot } | null = null
let inflight: Promise<Snapshot> | null = null

function fail<T>(source: string, error: string, status: 'error' | 'empty' | 'key_required' | 'disabled' = 'error'): ModuleResult<T> {
  return { ok: false, source, asOf: new Date().toISOString(), error, status }
}

function quoteFrom(item: CatalogItem, raw: RealQuote): Quote {
  return {
    id: item.id,
    name: item.name,
    price: raw.price,
    change: raw.change,
    pctChange: raw.pctChange,
    previousClose: raw.previousClose,
    currency: raw.currency ?? null,
    volume: raw.volume ?? null,
    region: item.region,
  }
}

function quoteModule(items: Quote[], missing: string[]): ModuleResult<QuoteModuleData> {
  if (items.length === 0) {
    return fail(YAHOO, missing.length ? `Kaynak yanıt vermedi: ${missing.join(', ')}` : 'Kotasyon alınamadı')
  }
  return {
    ok: true,
    source: YAHOO,
    asOf: new Date().toISOString(),
    data: { changeBasis: 'previous_session_close', note: QUOTE_NOTE, items, missing },
  }
}

async function loadMarketModules(): Promise<{
  indices: ModuleResult<QuoteModuleData>
  usStocks: ModuleResult<QuoteModuleData>
  bistStocks: ModuleResult<QuoteModuleData>
  commodities: ModuleResult<QuoteModuleData>
  fx: ModuleResult<QuoteModuleData>
  crypto: ModuleResult<QuoteModuleData>
  indicators: ModuleResult<QuoteModuleData>
  movers: ModuleResult<MoversData>
}> {
  const quotes = await mapPool(MARKET_CATALOG, 8, async (item) => {
    const quote = await fetchRealQuote(item.yahoo)
    return quote ? quoteFrom(item, { ...quote, symbol: item.id, name: item.name }) : null
  })

  const grouped = (group: CatalogItem['group']) => {
    const items: Quote[] = []
    const missing: string[] = []
    MARKET_CATALOG.forEach((item, index) => {
      if (item.group !== group) return
      const quote = quotes[index]
      if (quote) items.push(quote)
      else missing.push(item.id)
    })
    return quoteModule(items, missing)
  }

  const us = grouped('us')
  const bist = grouped('bist')
  const stockItems = [
    ...(us.ok ? us.data.items : []),
    ...(bist.ok ? bist.data.items : []),
  ]
  const movers: ModuleResult<MoversData> = stockItems.length === 0
    ? fail(YAHOO, 'Artan/azalan listesi için hisse kotasyonu yok')
    : {
        ok: true,
        source: YAHOO,
        asOf: new Date().toISOString(),
        data: {
          changeBasis: 'previous_session_close',
          note: QUOTE_NOTE,
          gainers: [...stockItems].filter((item) => item.pctChange > 0).sort((a, b) => b.pctChange - a.pctChange).slice(0, 8),
          losers: [...stockItems].filter((item) => item.pctChange < 0).sort((a, b) => a.pctChange - b.pctChange).slice(0, 8),
        },
      }

  return {
    indices: grouped('index'),
    usStocks: us,
    bistStocks: bist,
    commodities: grouped('commodity'),
    fx: grouped('fx'),
    crypto: grouped('crypto'),
    indicators: grouped('indicator'),
    movers,
  }
}

async function loadCharts(yields: ModuleResult<import('@/lib/snapshot-types').TreasuryData>): Promise<ModuleResult<ChartModuleData>> {
  const chartItems = MARKET_CATALOG.filter((item) => item.chart)
  const missing: string[] = []
  const fetched = await mapPool(chartItems, 4, async (item) => {
    try {
      const points = await fetchYahooSeries(item.yahoo)
      if (points.length < 2) {
        missing.push(item.id)
        return null
      }
      return {
        id: item.id,
        name: item.name,
        group: item.chart!,
        points,
      } satisfies ChartSeries
    } catch (error) {
      console.error(`Chart ${item.id}:`, error instanceof Error ? error.message : 'error')
      missing.push(item.id)
      return null
    }
  })
  const series = fetched.filter((item): item is ChartSeries => item != null)

  if (yields.ok) {
    const y10 = yields.data.history.flatMap((row) => (row.y10 == null ? [] : [{ time: row.time, value: row.y10 }]))
    const y2 = yields.data.history.flatMap((row) => (row.y2 == null ? [] : [{ time: row.time, value: row.y2 }]))
    if (y10.length >= 2) series.push({ id: 'US10Y', name: 'ABD 10Y', group: 'faiz', points: y10 })
    if (y2.length >= 2) series.push({ id: 'US2Y', name: 'ABD 2Y', group: 'faiz', points: y2 })
  } else {
    missing.push('US10Y', 'US2Y')
  }

  if (series.length === 0) return fail(YAHOO, 'Grafik serisi alınamadı')
  return { ok: true, source: `${YAHOO}; ${yields.source}`, asOf: new Date().toISOString(), data: { series, missing } }
}

function finnhubModule(): ModuleResult<{ note: string }> {
  if (!process.env.FINNHUB_API_KEY) {
    return fail(
      'Finnhub',
      'FINNHUB_API_KEY tanımlı değil. Modül devre dışı; fiyatlar Yahoo Finance üzerinden geliyor.',
      'disabled'
    )
  }
  return {
    ok: true,
    source: 'Finnhub',
    asOf: new Date().toISOString(),
    data: { note: 'Anahtar yalnızca sunucu ortamında. Pano fiyatları Yahoo Finance günlük değişimini kullanıyor.' },
  }
}

async function buildSnapshot(): Promise<Snapshot> {
  const [market, yields, tcmb, liquidity, calendar, newsItems] = await Promise.all([
    loadMarketModules().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Yahoo Finance alınamadı'
      const broken = fail<QuoteModuleData>(YAHOO, message)
      const movers = fail<MoversData>(YAHOO, message)
      return {
        indices: broken,
        usStocks: broken,
        bistStocks: broken,
        commodities: broken,
        fx: broken,
        crypto: broken,
        indicators: broken,
        movers,
      }
    }),
    loadTreasury(),
    loadTcmbFx(),
    loadLiquidity(),
    loadEconomicCalendar(),
    loadTerminalNews().catch(() => [] as Awaited<ReturnType<typeof loadTerminalNews>>),
  ])

  const charts = await loadCharts(yields)
  const news: ModuleResult<{ items: NewsBrief[] }> = newsItems.length === 0
    ? fail('RSS (TRT, AA, CNBC, CoinDesk, BBC, ForexLive)', 'Haber akışı alınamadı', 'empty')
    : {
        ok: true,
        source: 'RSS: TRT Haber, Anadolu Ajansı, CNBC, CoinDesk, Decrypt, BBC, ForexLive',
        asOf: new Date().toISOString(),
        data: {
          items: newsItems.slice(0, 18).map((item) => ({
            title: item.title,
            source: item.source,
            category: item.category,
            importance: item.importance,
            timeAgo: item.timeAgo,
            url: item.url,
          })),
        },
      }

  return {
    generatedAt: new Date().toISOString(),
    timezone: 'Europe/Istanbul',
    refreshHintSeconds: REFRESH_SECONDS,
    modules: {
      ...market,
      charts,
      yields,
      tcmb,
      liquidity,
      calendar,
      news,
      finnhub: finnhubModule(),
    },
  }
}

export async function getSnapshot(): Promise<Snapshot> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data
  if (inflight) return inflight
  inflight = buildSnapshot()
    .then((data) => {
      cache = { at: Date.now(), data }
      return data
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}
