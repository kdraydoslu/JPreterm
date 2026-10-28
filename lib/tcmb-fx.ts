import { fetchText } from '@/lib/http'
import type { ModuleResult, TcmbData, TcmbRate } from '@/lib/snapshot-types'

const SOURCE = 'TCMB günlük kur (today.xml)'
const WANTED = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'XAU']

function fail(error: string, status: 'error' | 'empty' = 'error'): ModuleResult<TcmbData> {
  return { ok: false, source: SOURCE, asOf: new Date().toISOString(), error, status }
}

function tag(block: string, name: string): string | null {
  const match = block.match(new RegExp(`<${name}>([^<]*)</${name}>`, 'i'))
  return match ? match[1].trim() : null
}

function num(value: string | null): number | null {
  if (!value) return null
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

export async function loadTcmbFx(): Promise<ModuleResult<TcmbData>> {
  let xml: string
  try {
    xml = await fetchText('https://www.tcmb.gov.tr/kurlar/today.xml', {
      timeoutMs: 12000,
      accept: 'application/xml',
    })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'TCMB kurları alınamadı')
  }

  const root = xml.match(/<Tarih_Date\b([^>]*)>/i)
  if (!root) return fail('TCMB XML beklenen biçimde değil')
  const bulletinDate = root[1].match(/\bTarih="([^"]+)"/i)?.[1] ?? null
  const bulletinNo = root[1].match(/\bBulten_No="([^"]+)"/i)?.[1] ?? null
  const blocks = xml.match(/<Currency\b[\s\S]*?<\/Currency>/gi) ?? []
  const rates: TcmbRate[] = []

  for (const block of blocks) {
    const code = block.match(/\bCurrencyCode="([^"]+)"/i)?.[1]
    if (!code || !WANTED.includes(code)) continue
    rates.push({
      code,
      name: tag(block, 'Isim') || tag(block, 'CurrencyName') || code,
      unit: num(tag(block, 'Unit')) ?? 1,
      forexBuying: num(tag(block, 'ForexBuying')),
      forexSelling: num(tag(block, 'ForexSelling')),
      banknoteSelling: num(tag(block, 'BanknoteSelling')),
    })
  }

  if (rates.length === 0) return fail('TCMB bülteninde kur satırı yok', 'empty')

  return {
    ok: true,
    source: SOURCE,
    asOf: new Date().toISOString(),
    data: { bulletinDate, bulletinNo, rates },
  }
}
