import { fetchText } from '@/lib/http'
import type { CalendarData, CalendarEvent, ModuleResult } from '@/lib/snapshot-types'

const SOURCE = 'Forex Factory takvimi (nfs.faireconomy.media)'

interface RawEvent {
  title?: string
  country?: string
  date?: string
  impact?: string
  forecast?: string
  previous?: string
}

function fail(error: string, status: 'error' | 'empty' = 'error'): ModuleResult<CalendarData> {
  return { ok: false, source: SOURCE, asOf: new Date().toISOString(), error, status }
}

function istanbulLabel(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export async function loadEconomicCalendar(): Promise<ModuleResult<CalendarData>> {
  let text: string
  try {
    text = await fetchText('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      timeoutMs: 12000,
      accept: 'application/json',
    })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Ekonomi takvimi alınamadı')
  }

  let raw: RawEvent[]
  try {
    const parsed = JSON.parse(text) as unknown
    if (!Array.isArray(parsed)) return fail('Takvim yanıtı liste değil')
    raw = parsed as RawEvent[]
  } catch {
    return fail('Takvim JSON okunamadı')
  }

  const events: CalendarEvent[] = raw.flatMap((item) => {
    if (!item.title || !item.date) return []
    const at = new Date(item.date)
    if (Number.isNaN(at.getTime())) return []
    return [{
      title: item.title,
      country: item.country || '—',
      impact: item.impact || 'Low',
      forecast: item.forecast?.trim() ? item.forecast.trim() : null,
      previous: item.previous?.trim() ? item.previous.trim() : null,
      at: at.toISOString(),
      istanbul: istanbulLabel(at),
    }]
  })

  if (events.length === 0) return fail('Bu hafta için takvim kaydı yok', 'empty')

  events.sort((a, b) => a.at.localeCompare(b.at))
  const now = Date.now()
  const upcoming = events.filter((event) => new Date(event.at).getTime() >= now - 6 * 60 * 60 * 1000)
  const visible = (upcoming.length > 0 ? upcoming : events).slice(0, 24)

  return {
    ok: true,
    source: SOURCE,
    asOf: new Date().toISOString(),
    data: {
      events: visible,
      coverageFrom: events[0]?.at ?? null,
      coverageTo: events[events.length - 1]?.at ?? null,
    },
  }
}
