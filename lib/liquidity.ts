import { fetchText } from '@/lib/http'
import type { EcbM3, EvdsPoint, FredPoint, LiquidityData, ModuleResult } from '@/lib/snapshot-types'

const FRED_SERIES: { id: string; title: string; unit: string }[] = [
  { id: 'M2SL', title: 'ABD M2', unit: 'milyar USD' },
  { id: 'WALCL', title: 'Fed bilançosu', unit: 'milyon USD' },
  { id: 'RRPONTSYD', title: 'Ters repo (ON RRP)', unit: 'milyar USD' },
  { id: 'WTREGEN', title: 'Hazine hesabı (TGA)', unit: 'milyon USD' },
  { id: 'WRESBAL', title: 'Rezerv bakiyeleri', unit: 'milyon USD' },
]

function moduleFail<T>(source: string, error: string, status: 'error' | 'empty' | 'key_required' | 'disabled'): ModuleResult<T> {
  return { ok: false, source, asOf: new Date().toISOString(), error, status }
}

function pct(latest: number, previous: number): number | null {
  if (!previous) return null
  return Number((((latest - previous) / Math.abs(previous)) * 100).toFixed(2))
}

async function loadFredSeries(): Promise<ModuleResult<{ series: FredPoint[] }>> {
  const source = 'FRED'
  const apiKey = process.env.FRED_API_KEY
  if (!apiKey) {
    return moduleFail(source, 'FRED_API_KEY tanımlı değil. ABD para arzı ve likidite serileri için ücretsiz FRED anahtarı gerekir.', 'key_required')
  }

  const series = (
    await Promise.all(
      FRED_SERIES.map(async (item): Promise<FredPoint | null> => {
        try {
          const url = new URL('https://api.stlouisfed.org/fred/series/observations')
          url.searchParams.set('series_id', item.id)
          url.searchParams.set('file_type', 'json')
          url.searchParams.set('sort_order', 'desc')
          url.searchParams.set('limit', '60')
          url.searchParams.set('api_key', apiKey)
          const text = await fetchText(url.toString(), { timeoutMs: 12000, accept: 'application/json' })
          const json = JSON.parse(text) as { observations?: Array<{ date: string; value: string }> }
          const observations = (json.observations ?? [])
            .map((row) => ({ date: row.date, value: Number(row.value) }))
            .filter((row) => Number.isFinite(row.value))
          if (observations.length === 0) return null
          const latest = observations[0]
          const previous = observations[1] ?? null
          const yearAgoTarget = new Date(`${latest.date}T00:00:00Z`).getTime() - 370 * 24 * 60 * 60 * 1000
          const yearAgo = observations.find((row) => new Date(`${row.date}T00:00:00Z`).getTime() <= yearAgoTarget) ?? null
          return {
            id: item.id,
            title: item.title,
            unit: item.unit,
            date: latest.date,
            value: latest.value,
            previousDate: previous?.date ?? null,
            previousValue: previous?.value ?? null,
            changePct: previous ? pct(latest.value, previous.value) : null,
            yoyPct: yearAgo ? pct(latest.value, yearAgo.value) : null,
          } satisfies FredPoint
        } catch (error) {
          console.error(`FRED ${item.id}:`, error instanceof Error ? error.message : 'error')
          return null
        }
      })
    )
  ).filter((point): point is FredPoint => point != null)

  if (series.length === 0) return moduleFail(source, 'FRED serileri alınamadı', 'error')
  return { ok: true, source, asOf: new Date().toISOString(), data: { series } }
}

async function loadEcbM3(): Promise<ModuleResult<EcbM3>> {
  const source = 'ECB Data Portal'
  const url = 'https://data-api.ecb.europa.eu/service/data/BSI/M.U2.Y.V.M30.X.I.U2.2300.Z01.A?format=csvdata&lastNObservations=3'
  try {
    const csv = await fetchText(url, { timeoutMs: 12000, accept: 'text/csv' })
    const matches = [...csv.matchAll(/,(\d{4}-\d{2}),(-?\d+(?:\.\d+)?),/g)]
    if (matches.length === 0) return moduleFail(source, 'ECB M3 serisi boş döndü', 'empty')
    const last = matches[matches.length - 1]
    return {
      ok: true,
      source,
      asOf: new Date().toISOString(),
      data: {
        period: last[1],
        m3Yoy: Number(Number(last[2]).toFixed(2)),
        title: 'Euro Bölgesi M3 yıllık büyüme',
      },
    }
  } catch (error) {
    return moduleFail(source, error instanceof Error ? error.message : 'ECB M3 alınamadı', 'error')
  }
}

function parseTrDate(value: string): number | null {
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (!match) return null
  return Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
}

async function loadEvds(): Promise<ModuleResult<EvdsPoint>> {
  const source = 'TCMB EVDS'
  const apiKey = process.env.EVDS_API_KEY
  if (!apiKey) {
    return moduleFail(source, 'EVDS_API_KEY tanımlı değil. Türkiye para arzı için TCMB EVDS anahtarı gerekir.', 'key_required')
  }
  const series = process.env.EVDS_M2_SERIES?.trim() ?? ''
  if (!/^TP\.[A-Z0-9.]+$/.test(series)) {
    return moduleFail(
      source,
      'EVDS anahtarı var ancak EVDS_M2_SERIES tanımlı değil. Seri kodunu EVDS Tüm Seriler listesinden seçip ortam değişkenine yazın; kod burada uydurulmaz.',
      'key_required'
    )
  }

  const end = new Date()
  const start = new Date(end.getTime() - 500 * 24 * 60 * 60 * 1000)
  const fmt = (date: Date) => {
    const dd = String(date.getUTCDate()).padStart(2, '0')
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
    return `${dd}-${mm}-${date.getUTCFullYear()}`
  }
  const url = `https://evds3.tcmb.gov.tr/igmevdsms-dis/series=${encodeURIComponent(series)}&startDate=${fmt(start)}&endDate=${fmt(end)}&type=json`
  try {
    const text = await fetchText(url, {
      timeoutMs: 12000,
      accept: 'application/json',
      headers: { key: apiKey },
    })
    const json = JSON.parse(text) as { items?: Array<Record<string, unknown>> }
    const keyName = series.replace(/\./g, '_')
    const rows = (json.items ?? [])
      .map((item) => {
        const date = typeof item.Tarih === 'string' ? item.Tarih : ''
        const raw = item[keyName] ?? item[series]
        const value = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw.replace(',', '.')) : NaN
        return { date, value }
      })
      .filter((row) => row.date && Number.isFinite(row.value))
    if (rows.length === 0) return moduleFail(source, 'EVDS seri boş döndü', 'empty')
    const latest = rows[rows.length - 1]
    const latestTime = parseTrDate(latest.date)
    const yearAgo = latestTime == null
      ? null
      : [...rows].reverse().find((row) => {
          const time = parseTrDate(row.date)
          return time != null && time <= latestTime - 340 * 24 * 60 * 60 * 1000 && row.date !== latest.date
        })
    return {
      ok: true,
      source,
      asOf: new Date().toISOString(),
      data: {
        series,
        date: latest.date,
        value: latest.value,
        yoyPct: yearAgo ? pct(latest.value, yearAgo.value) : null,
      },
    }
  } catch (error) {
    return moduleFail(source, error instanceof Error ? error.message : 'EVDS alınamadı', 'error')
  }
}

export async function loadLiquidity(): Promise<ModuleResult<LiquidityData>> {
  const [fred, ecb, evds] = await Promise.all([loadFredSeries(), loadEcbM3(), loadEvds()])
  return {
    ok: true,
    source: 'FRED, ECB Data Portal, TCMB EVDS',
    asOf: new Date().toISOString(),
    data: { fred, ecb, evds },
  }
}
