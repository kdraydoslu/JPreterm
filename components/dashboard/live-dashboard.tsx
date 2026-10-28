'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { QuoteChart } from '@/components/dashboard/quote-chart'
import { fmt, fmtPct, fmtPx, fmtWhen, istanbulClock } from '@/components/dashboard/format'
import type {
  CalendarEvent,
  ChartSeries,
  FredPoint,
  ModuleResult,
  NewsBrief,
  Quote,
  QuoteModuleData,
  Snapshot,
  TcmbRate,
  TreasuryYield,
} from '@/lib/snapshot-types'

const SLIDES = ['Özet', 'Piyasalar', 'Faiz ve likidite', 'Takvim ve haber'] as const
const CHART_COLORS: Record<string, string> = {
  SPX: '#ff7700',
  NDX: '#00ff9d',
  BIST100: '#ffcc00',
  BTC: '#ffcc00',
  ETH: '#7eb6ff',
  GOLD: '#ffcc00',
  BRENT: '#ff6644',
  WTI: '#ff9944',
  US10Y: '#7ef0ff',
  US2Y: '#ff66cc',
}

function itemsOf(module: ModuleResult<QuoteModuleData> | undefined): Quote[] {
  return module?.ok ? module.data.items : []
}

function findQuote(lists: Quote[][], id: string): Quote | undefined {
  for (const list of lists) {
    const found = list.find((item) => item.id === id)
    if (found) return found
  }
  return undefined
}

function Panel({
  title,
  source,
  asOf,
  children,
}: {
  title: string
  source?: string
  asOf?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-md border border-[rgba(255,119,0,0.18)] bg-[rgba(5,1,0,0.92)] p-3 min-w-0">
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-[var(--font-orbitron)] text-[11px] tracking-[1.5px] text-[#ff7700]">{title}</h2>
        <p className="text-[9px] text-[rgba(255,238,221,0.45)]">
          {source || 'kaynak yok'} · {fmtWhen(asOf)}
        </p>
      </header>
      {children}
    </section>
  )
}

function EmptyState({ status, message }: { status?: string; message: string }) {
  const label = status === 'key_required' ? 'ANAHTAR GEREKLİ' : status === 'disabled' ? 'DEVRE DIŞI' : status === 'empty' ? 'VERİ YOK' : 'KAYNAK HATASI'
  return (
    <div className="rounded border border-dashed border-[#ffcc00]/40 bg-[#ffcc00]/5 px-3 py-4 text-sm text-[#ffcc00]">
      <div className="mb-1 font-[var(--font-orbitron)] text-[10px] tracking-[1px]">{label}</div>
      <p>{message}</p>
    </div>
  )
}

function ModuleBody<T>({ module, children }: { module: ModuleResult<T> | undefined; children: (data: T) => React.ReactNode }) {
  if (!module) return <EmptyState message="Modül yanıtı yok" />
  if (!module.ok) return <EmptyState status={module.status} message={module.error} />
  return <>{children(module.data)}</>
}

function Pct({ value }: { value: number }) {
  const up = value >= 0
  return <span className={up ? 'text-[#00ff9d]' : 'text-[#ff2244]'}>{fmtPct(value)}</span>
}

function QuoteRow({ quote, tv }: { quote: Quote; tv?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[rgba(255,119,0,0.08)] py-1.5 last:border-0">
      <div className="min-w-0">
        <div className={`font-bold text-[#ff7700] ${tv ? 'text-base' : 'text-xs'}`}>{quote.name}</div>
        <div className="text-[10px] text-[rgba(255,238,221,0.4)]">{quote.id}{quote.currency ? ` · ${quote.currency}` : ''}</div>
      </div>
      <div className="text-right">
        <div className={`font-mono text-white ${tv ? 'text-xl' : 'text-sm'}`}>{fmtPx(quote.price)}</div>
        <div className={`font-mono ${tv ? 'text-sm' : 'text-[11px]'}`}><Pct value={quote.pctChange} /></div>
      </div>
    </div>
  )
}

function Ticker({ quotes }: { quotes: Quote[] }) {
  if (quotes.length === 0) {
    return <div className="border-y border-[rgba(255,119,0,0.15)] px-3 py-2 text-xs text-[#ffcc00]">Akan şerit için kotasyon yok</div>
  }
  const row = [...quotes, ...quotes]
  return (
    <div className="overflow-hidden border-y border-[rgba(255,119,0,0.18)] bg-[rgba(5,1,0,0.88)]">
      <div className="flex w-max animate-[tickerScroll_80s_linear_infinite] hover:[animation-play-state:paused]">
        {row.map((quote, index) => (
          <div key={`${quote.id}-${index}`} className="flex items-center gap-2 border-r border-[rgba(255,119,0,0.1)] px-4 py-2 text-[12px] whitespace-nowrap sm:text-sm">
            <span className="font-[var(--font-orbitron)] text-[10px] text-[#ff7700]">{quote.id}</span>
            <span className="font-mono text-[#ffeedd]">{fmtPx(quote.price)}</span>
            <Pct value={quote.pctChange} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LiveDashboard() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState('--:--:--')
  const [tv, setTv] = useState(false)
  const [slide, setSlide] = useState(0)
  const [autoSlide, setAutoSlide] = useState(true)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/snapshot', { cache: 'no-store' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const json = (await response.json()) as Snapshot
      setSnapshot(json)
      setError(null)
    } catch {
      setError('Piyasa özeti alınamadı. Son başarılı veri duruyorsa ekranda kalır.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tv') === '1') setTv(true)
    load()
    const timer = setInterval(load, 45000)
    return () => clearInterval(timer)
  }, [load])

  useEffect(() => {
    const tick = () => setClock(istanbulClock())
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!tv || !autoSlide) return
    const timer = setInterval(() => setSlide((current) => (current + 1) % SLIDES.length), 20000)
    return () => clearInterval(timer)
  }, [tv, autoSlide])

  const modules = snapshot?.modules
  const lists = useMemo(() => [
    itemsOf(modules?.indices),
    itemsOf(modules?.usStocks),
    itemsOf(modules?.bistStocks),
    itemsOf(modules?.commodities),
    itemsOf(modules?.fx),
    itemsOf(modules?.crypto),
    itemsOf(modules?.indicators),
  ], [modules])

  const tape = useMemo(() => lists.flat(), [lists])
  const show = (index: number) => !tv || slide === index

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => undefined)
      setTv(true)
    } else {
      await document.exitFullscreen().catch(() => undefined)
    }
  }

  const kpiIds = ['SPX', 'NDX', 'DJI', 'BIST100', 'VIX', 'DXY', 'GOLD', 'WTI', 'BRENT', 'BTC', 'USDTRY', 'ETH']

  return (
    <div className={`min-h-screen bg-[#050100]/95 text-[#ffeedd] ${tv ? 'text-base' : 'text-sm'}`}>
      <header className="sticky top-0 z-20 border-b border-[rgba(255,119,0,0.25)] bg-[#050100]/95 px-3 py-2 backdrop-blur sm:px-5">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="font-[var(--font-orbitron)] text-sm font-black tracking-[2px] text-[#ff7700] sm:text-base">
              JARVIS <span className="text-[#00ff9d]">PRE TERM</span>
            </div>
            <div className="text-[10px] tracking-[1px] text-[rgba(255,238,221,0.55)]">CANLI PANO · İSTANBUL {clock}</div>
          </div>
          <div className="text-[10px] text-[rgba(255,238,221,0.55)] sm:ml-auto">
            <div>Son özet: {fmtWhen(snapshot?.generatedAt)}</div>
            <div>Yenileme: 45 sn · {snapshot ? 'kaynaklar modül başlığında' : 'bekleniyor'}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={load} className="rounded border border-[#ff7700]/50 px-2 py-1 text-[10px] font-[var(--font-orbitron)] text-[#ff7700]">YENİLE</button>
            <button type="button" onClick={() => setTv((value) => !value)} className={`rounded border px-2 py-1 text-[10px] font-[var(--font-orbitron)] ${tv ? 'border-[#00ff9d] text-[#00ff9d]' : 'border-[#ff7700]/50 text-[#ff7700]'}`}>
              {tv ? 'TV AÇIK' : 'TV MODU'}
            </button>
            <button type="button" onClick={toggleFullscreen} className="rounded border border-[#ff7700]/50 px-2 py-1 text-[10px] font-[var(--font-orbitron)] text-[#ff7700]">TAM EKRAN</button>
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-[#ffcc00]">{error}</p>}
        {tv && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {SLIDES.map((label, index) => (
              <button key={label} type="button" onClick={() => setSlide(index)} className={`rounded px-2 py-1 text-[10px] font-[var(--font-orbitron)] ${slide === index ? 'bg-[#ff7700] text-black' : 'text-[#ff7700]'}`}>
                {label}
              </button>
            ))}
            <button type="button" onClick={() => setAutoSlide((value) => !value)} className="text-[10px] text-[#ffcc00]">
              {autoSlide ? 'Slayt otomatik' : 'Slayt durdu'}
            </button>
          </div>
        )}
      </header>

      <Ticker quotes={tape} />

      <main className={`mx-auto flex max-w-[1600px] flex-col gap-3 px-3 py-3 sm:px-5 ${tv ? 'gap-5' : ''}`}>
        {loading && !snapshot && <p className="py-10 text-center text-[#ffcc00]">Canlı veriler yükleniyor…</p>}
        {!loading && !snapshot && <p className="py-10 text-center text-[#ffcc00]">Özet alınamadı. Yenilemeyi deneyin.</p>}

        {snapshot && show(0) && (
          <>
            <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {kpiIds.map((id) => {
                const quote = findQuote(lists, id)
                return (
                  <article key={id} className="rounded-md border border-[rgba(255,119,0,0.18)] bg-[rgba(5,1,0,0.92)] px-3 py-2">
                    <div className="text-[10px] tracking-[1px] text-[rgba(255,119,0,0.7)]">{quote?.name ?? id}</div>
                    {quote ? (
                      <>
                        <div className={`font-mono text-white ${tv ? 'text-3xl' : 'text-lg'}`}>{fmtPx(quote.price)}</div>
                        <div className={tv ? 'text-lg' : 'text-xs'}><Pct value={quote.pctChange} /></div>
                      </>
                    ) : (
                      <div className="py-2 text-xs text-[#ffcc00]">veri yok</div>
                    )}
                  </article>
                )
              })}
            </section>
            <div className="grid gap-3 lg:grid-cols-2">
              <Panel title="ARTANLAR" source={modules?.movers.source} asOf={modules?.movers.asOf}>
                <ModuleBody module={modules?.movers}>
                  {(data) => data.gainers.length === 0
                    ? <EmptyState status="empty" message="Pozitif günlük değişim yok" />
                    : data.gainers.map((quote) => <QuoteRow key={quote.id} quote={quote} tv={tv} />)}
                </ModuleBody>
                {modules?.movers.ok && <p className="mt-2 text-[10px] text-[rgba(255,238,221,0.4)]">{modules.movers.data.note}</p>}
              </Panel>
              <Panel title="AZALANLAR" source={modules?.movers.source} asOf={modules?.movers.asOf}>
                <ModuleBody module={modules?.movers}>
                  {(data) => data.losers.length === 0
                    ? <EmptyState status="empty" message="Negatif günlük değişim yok" />
                    : data.losers.map((quote) => <QuoteRow key={quote.id} quote={quote} tv={tv} />)}
                </ModuleBody>
              </Panel>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <Panel title="ABD HİSSELERİ" source={modules?.usStocks.source} asOf={modules?.usStocks.asOf}>
                <ModuleBody module={modules?.usStocks}>
                  {(data) => data.items.map((quote) => <QuoteRow key={quote.id} quote={quote} tv={tv} />)}
                </ModuleBody>
              </Panel>
              <Panel title="BIST HİSSELERİ" source={modules?.bistStocks.source} asOf={modules?.bistStocks.asOf}>
                <ModuleBody module={modules?.bistStocks}>
                  {(data) => data.items.map((quote) => <QuoteRow key={quote.id} quote={quote} tv={tv} />)}
                </ModuleBody>
              </Panel>
            </div>
          </>
        )}

        {snapshot && show(1) && (
          <>
            <Panel title="KÜRESEL ENDEKSLER" source={modules?.indices.source} asOf={modules?.indices.asOf}>
              <ModuleBody module={modules?.indices}>
                {(data) => (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {(['amerika', 'avrupa', 'asya', 'turkiye'] as const).map((region) => (
                      <div key={region}>
                        <h3 className="mb-1 text-[10px] uppercase tracking-[1px] text-[#ffcc00]">{region}</h3>
                        {data.items.filter((item) => item.region === region).map((quote) => <QuoteRow key={quote.id} quote={quote} tv={tv} />)}
                      </div>
                    ))}
                  </div>
                )}
              </ModuleBody>
              {modules?.indices.ok && modules.indices.data.missing.length > 0 && (
                <p className="mt-2 text-[10px] text-[#ffcc00]">Eksik: {modules.indices.data.missing.join(', ')}</p>
              )}
            </Panel>
            <div className="grid gap-3 lg:grid-cols-3">
              <Panel title="EMTİA" source={modules?.commodities.source} asOf={modules?.commodities.asOf}>
                <ModuleBody module={modules?.commodities}>
                  {(data) => data.items.map((quote) => <QuoteRow key={quote.id} quote={quote} tv={tv} />)}
                </ModuleBody>
              </Panel>
              <Panel title="KUR (PİYASA)" source={modules?.fx.source} asOf={modules?.fx.asOf}>
                <ModuleBody module={modules?.fx}>
                  {(data) => data.items.map((quote) => <QuoteRow key={quote.id} quote={quote} tv={tv} />)}
                </ModuleBody>
              </Panel>
              <Panel title="KRİPTO" source={modules?.crypto.source} asOf={modules?.crypto.asOf}>
                <ModuleBody module={modules?.crypto}>
                  {(data) => data.items.map((quote) => <QuoteRow key={quote.id} quote={quote} tv={tv} />)}
                </ModuleBody>
              </Panel>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <ModuleBody module={modules?.charts}>
                {(data) => data.series.map((series) => (
                  <QuoteChart
                    key={series.id}
                    title={`${series.name} · ${series.group}`}
                    source={modules?.charts.ok ? modules.charts.source : 'Yahoo Finance'}
                    asOf={modules?.charts.asOf}
                    tall={tv}
                    lines={[{ color: CHART_COLORS[series.id] || '#ff7700', points: series.points }]}
                  />
                ))}
              </ModuleBody>
            </div>
          </>
        )}

        {snapshot && show(2) && (
          <>
            <Panel title="ABD HAZİNE GETİRİLERİ" source={modules?.yields.source} asOf={modules?.yields.asOf}>
              <ModuleBody module={modules?.yields}>
                {(data) => (
                  <>
                    <p className="mb-2 text-[11px] text-[rgba(255,238,221,0.55)]">Eğri tarihi: {data.date}{data.spread2s10s != null ? ` · 10Y−2Y ${fmt(data.spread2s10s, 2)} puan` : ''}</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                      {data.yields.map((item: TreasuryYield) => (
                        <div key={item.tenor} className="rounded border border-[rgba(255,119,0,0.12)] px-2 py-2">
                          <div className="text-[10px] text-[rgba(255,119,0,0.65)]">{item.label}</div>
                          <div className={`font-mono text-white ${tv ? 'text-2xl' : 'text-lg'}`}>%{fmt(item.value, 2)}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </ModuleBody>
            </Panel>
            <Panel title="TCMB GÜNLÜK KUR" source={modules?.tcmb.source} asOf={modules?.tcmb.asOf}>
              <ModuleBody module={modules?.tcmb}>
                {(data) => (
                  <>
                    <p className="mb-2 text-[11px] text-[rgba(255,238,221,0.55)]">Bülten {data.bulletinDate || '—'}{data.bulletinNo ? ` · No ${data.bulletinNo}` : ''}</p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left text-xs">
                        <thead className="text-[10px] uppercase text-[rgba(255,119,0,0.6)]">
                          <tr>
                            <th className="py-1">Kur</th>
                            <th>Birim</th>
                            <th>Döviz alış</th>
                            <th>Döviz satış</th>
                            <th>Efektif satış</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.rates.map((rate: TcmbRate) => (
                            <tr key={rate.code} className="border-t border-[rgba(255,119,0,0.08)]">
                              <td className="py-1.5 text-[#ff7700]">{rate.code} · {rate.name}</td>
                              <td className="font-mono">{rate.unit}</td>
                              <td className="font-mono">{rate.forexBuying == null ? '—' : fmt(rate.forexBuying, 4)}</td>
                              <td className="font-mono">{rate.forexSelling == null ? '—' : fmt(rate.forexSelling, 4)}</td>
                              <td className="font-mono">{rate.banknoteSelling == null ? '—' : fmt(rate.banknoteSelling, 4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </ModuleBody>
            </Panel>
            <Panel title="PARA ARZI VE LİKİDİTE" source={modules?.liquidity.source} asOf={modules?.liquidity.asOf}>
              <ModuleBody module={modules?.liquidity}>
                {(data) => (
                  <div className="grid gap-3 lg:grid-cols-3">
                    <div>
                      <h3 className="mb-2 text-[10px] tracking-[1px] text-[#00ff9d]">ABD · {data.fred.source}</h3>
                      <ModuleBody module={data.fred}>
                        {(fred) => fred.series.map((point: FredPoint) => (
                          <div key={point.id} className="mb-2 border-b border-[rgba(255,119,0,0.08)] pb-2">
                            <div className="text-xs text-[#ff7700]">{point.title} · {point.id}</div>
                            <div className={`font-mono text-white ${tv ? 'text-2xl' : 'text-lg'}`}>{fmt(point.value, 2)} <span className="text-[10px] text-[rgba(255,238,221,0.45)]">{point.unit}</span></div>
                            <div className="text-[10px] text-[rgba(255,238,221,0.45)]">
                              {point.date}
                              {point.changePct != null ? ` · önceki gözlem ${fmtPct(point.changePct)}` : ''}
                              {point.yoyPct != null ? ` · yıllık ${fmtPct(point.yoyPct)}` : ''}
                            </div>
                          </div>
                        ))}
                      </ModuleBody>
                    </div>
                    <div>
                      <h3 className="mb-2 text-[10px] tracking-[1px] text-[#00ff9d]">EURO BÖLGESİ · {data.ecb.source}</h3>
                      <ModuleBody module={data.ecb}>
                        {(ecb) => (
                          <div>
                            <div className="text-xs text-[#ff7700]">{ecb.title}</div>
                            <div className={`font-mono text-white ${tv ? 'text-3xl' : 'text-2xl'}`}>%{fmt(ecb.m3Yoy, 2)}</div>
                            <div className="text-[10px] text-[rgba(255,238,221,0.45)]">Dönem {ecb.period} · yıllık büyüme</div>
                          </div>
                        )}
                      </ModuleBody>
                    </div>
                    <div>
                      <h3 className="mb-2 text-[10px] tracking-[1px] text-[#00ff9d]">TÜRKİYE · {data.evds.source}</h3>
                      <ModuleBody module={data.evds}>
                        {(evds) => (
                          <div>
                            <div className="text-xs text-[#ff7700]">{evds.series}</div>
                            <div className={`font-mono text-white ${tv ? 'text-2xl' : 'text-lg'}`}>{fmt(evds.value, 2)}</div>
                            <div className="text-[10px] text-[rgba(255,238,221,0.45)]">
                              {evds.date}{evds.yoyPct != null ? ` · yıllık ${fmtPct(evds.yoyPct)}` : ''}
                            </div>
                          </div>
                        )}
                      </ModuleBody>
                    </div>
                  </div>
                )}
              </ModuleBody>
            </Panel>
          </>
        )}

        {snapshot && show(3) && (
          <div className="grid gap-3 lg:grid-cols-2">
            <Panel title="EKONOMİ TAKVİMİ" source={modules?.calendar.source} asOf={modules?.calendar.asOf}>
              <ModuleBody module={modules?.calendar}>
                {(data) => (
                  <div className="max-h-[70vh] space-y-2 overflow-auto pr-1">
                    {data.events.map((event: CalendarEvent) => (
                      <article key={`${event.at}-${event.title}`} className="border-b border-[rgba(255,119,0,0.08)] pb-2">
                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                          <span className="font-mono text-[#ff7700]">{event.istanbul}</span>
                          <span className="text-[rgba(255,238,221,0.45)]">{event.country}</span>
                          <span className={event.impact === 'High' ? 'text-[#ff2244]' : event.impact === 'Medium' ? 'text-[#ffcc00]' : 'text-[rgba(255,238,221,0.45)]'}>{event.impact}</span>
                        </div>
                        <div className={tv ? 'text-lg' : 'text-sm'}>{event.title}</div>
                        <div className="text-[10px] text-[rgba(255,238,221,0.45)]">
                          Beklenti: {event.forecast ?? '—'} · Önceki: {event.previous ?? '—'}
                        </div>
                      </article>
                    ))}
                    <p className="text-[10px] text-[rgba(255,238,221,0.4)]">
                      Kapsam {fmtWhen(data.coverageFrom)} – {fmtWhen(data.coverageTo)}. Saatler İstanbul.
                    </p>
                  </div>
                )}
              </ModuleBody>
            </Panel>
            <Panel title="HABER GÜNDEMİ" source={modules?.news.source} asOf={modules?.news.asOf}>
              <ModuleBody module={modules?.news}>
                {(data) => (
                  <div className="max-h-[70vh] space-y-2 overflow-auto pr-1">
                    {data.items.map((item: NewsBrief) => (
                      <a key={`${item.source}-${item.title}`} href={item.url || undefined} target="_blank" rel="noreferrer" className="block border-b border-[rgba(255,119,0,0.08)] pb-2 hover:text-[#ff7700]">
                        <div className="text-[10px] text-[rgba(255,238,221,0.45)]">{item.source} · {item.timeAgo} · {item.category}</div>
                        <div className={tv ? 'text-lg' : 'text-sm'}>{item.title}</div>
                      </a>
                    ))}
                  </div>
                )}
              </ModuleBody>
            </Panel>
          </div>
        )}
      </main>
      <footer className="px-5 pb-6 text-[10px] text-[rgba(255,238,221,0.4)]">
        Veriler gecikmeli olabilir. Bu ekran yatırım tavsiyesi değildir. Jarvis için salt okunur özet: /api/snapshot
      </footer>
    </div>
  )
}
