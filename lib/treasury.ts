import { fetchText } from '@/lib/http'
import type { ModuleResult, TreasuryData } from '@/lib/snapshot-types'

const SOURCE = 'US Treasury günlük getiri eğrisi CSV'

const TENORS: { header: string; tenor: string; label: string }[] = [
  { header: '3 Mo', tenor: '3M', label: '3 ay' },
  { header: '1 Yr', tenor: '1Y', label: '1 yıl' },
  { header: '2 Yr', tenor: '2Y', label: '2 yıl' },
  { header: '5 Yr', tenor: '5Y', label: '5 yıl' },
  { header: '10 Yr', tenor: '10Y', label: '10 yıl' },
  { header: '20 Yr', tenor: '20Y', label: '20 yıl' },
  { header: '30 Yr', tenor: '30Y', label: '30 yıl' },
]

function fail(error: string): ModuleResult<TreasuryData> {
  return { ok: false, source: SOURCE, asOf: new Date().toISOString(), error, status: 'error' }
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (quoted) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i += 1
        } else {
          quoted = false
        }
      } else {
        current += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      cells.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current.trim())
  return cells
}

function parseNumber(value: string | undefined): number | null {
  if (!value || value === 'N/A') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseUsDate(value: string): number | null {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return null
  return Math.floor(Date.UTC(Number(match[3]), Number(match[1]) - 1, Number(match[2]), 18, 0, 0) / 1000)
}

export async function loadTreasury(): Promise<ModuleResult<TreasuryData>> {
  const year = new Date().getUTCFullYear()
  const url = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${year}/all?_format=csv&type=daily_treasury_yield_curve&field_tdr_date_value=${year}`
  let csv: string
  try {
    csv = await fetchText(url, { timeoutMs: 12000, accept: 'text/csv' })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Hazine CSV alınamadı')
  }

  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lines.length < 2) return fail('Hazine CSV boş döndü')

  const headers = parseCsvLine(lines[0])
  const indexOf = (name: string) => headers.findIndex((header) => header === name)
  const dateIndex = indexOf('Date')
  if (dateIndex < 0) return fail('Hazine CSV tarih sütunu yok')

  const rows = lines.slice(1).map(parseCsvLine).filter((row) => row[dateIndex])
  if (rows.length === 0) return fail('Hazine CSV satırı yok')

  const latest = rows[0]
  const yields = TENORS.flatMap((tenor) => {
    const index = indexOf(tenor.header)
    const value = index >= 0 ? parseNumber(latest[index]) : null
    return value == null ? [] : [{ tenor: tenor.tenor, label: tenor.label, value }]
  })
  if (yields.length === 0) return fail('Hazine getirileri okunamadı')

  const y2 = yields.find((item) => item.tenor === '2Y')?.value ?? null
  const y10 = yields.find((item) => item.tenor === '10Y')?.value ?? null
  const history = rows
    .slice(0, 120)
    .map((row) => {
      const time = parseUsDate(row[dateIndex])
      if (time == null) return null
      const i2 = indexOf('2 Yr')
      const i10 = indexOf('10 Yr')
      return {
        time,
        y2: i2 >= 0 ? parseNumber(row[i2]) : null,
        y10: i10 >= 0 ? parseNumber(row[i10]) : null,
      }
    })
    .filter((row): row is { time: number; y2: number | null; y10: number | null } => row != null)
    .reverse()

  return {
    ok: true,
    source: SOURCE,
    asOf: new Date().toISOString(),
    data: {
      date: latest[dateIndex],
      yields,
      spread2s10s: y2 != null && y10 != null ? Number((y10 - y2).toFixed(2)) : null,
      history,
    },
  }
}
