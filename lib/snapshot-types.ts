export type ModuleStatus = 'error' | 'empty' | 'key_required' | 'disabled'

export interface ModuleOk<T> {
  ok: true
  source: string
  asOf: string
  data: T
}

export interface ModuleErr {
  ok: false
  source: string
  asOf: string
  error: string
  status: ModuleStatus
}

export type ModuleResult<T> = ModuleOk<T> | ModuleErr

export interface Quote {
  id: string
  name: string
  price: number
  change: number
  pctChange: number
  previousClose: number
  currency: string | null
  volume: string | null
  region?: string
}

export interface QuoteModuleData {
  changeBasis: 'previous_session_close'
  note: string
  items: Quote[]
  missing: string[]
}

export interface MoversData {
  changeBasis: 'previous_session_close'
  note: string
  gainers: Quote[]
  losers: Quote[]
}

export interface ChartPoint {
  time: number
  value: number
}

export interface ChartSeries {
  id: string
  name: string
  group: 'endeks' | 'kripto' | 'emtia' | 'faiz'
  points: ChartPoint[]
}

export interface ChartModuleData {
  series: ChartSeries[]
  missing: string[]
}

export interface TreasuryYield {
  tenor: string
  label: string
  value: number
}

export interface TreasuryData {
  date: string
  yields: TreasuryYield[]
  spread2s10s: number | null
  history: { time: number; y2: number | null; y10: number | null }[]
}

export interface TcmbRate {
  code: string
  name: string
  unit: number
  forexBuying: number | null
  forexSelling: number | null
  banknoteSelling: number | null
}

export interface TcmbData {
  bulletinDate: string | null
  bulletinNo: string | null
  rates: TcmbRate[]
}

export interface FredPoint {
  id: string
  title: string
  unit: string
  date: string
  value: number
  previousDate: string | null
  previousValue: number | null
  changePct: number | null
  yoyPct: number | null
}

export interface EcbM3 {
  period: string
  m3Yoy: number
  title: string
}

export interface EvdsPoint {
  series: string
  date: string
  value: number
  yoyPct: number | null
}

export interface LiquidityData {
  fred: ModuleResult<{ series: FredPoint[] }>
  ecb: ModuleResult<EcbM3>
  evds: ModuleResult<EvdsPoint>
}

export interface CalendarEvent {
  title: string
  country: string
  impact: string
  forecast: string | null
  previous: string | null
  at: string
  istanbul: string
}

export interface CalendarData {
  events: CalendarEvent[]
  coverageFrom: string | null
  coverageTo: string | null
}

export interface NewsBrief {
  title: string
  source: string
  category: string
  importance: string
  timeAgo: string
  url: string
}

export interface Snapshot {
  generatedAt: string
  timezone: 'Europe/Istanbul'
  refreshHintSeconds: number
  modules: {
    indices: ModuleResult<QuoteModuleData>
    usStocks: ModuleResult<QuoteModuleData>
    bistStocks: ModuleResult<QuoteModuleData>
    commodities: ModuleResult<QuoteModuleData>
    fx: ModuleResult<QuoteModuleData>
    crypto: ModuleResult<QuoteModuleData>
    indicators: ModuleResult<QuoteModuleData>
    movers: ModuleResult<MoversData>
    charts: ModuleResult<ChartModuleData>
    yields: ModuleResult<TreasuryData>
    tcmb: ModuleResult<TcmbData>
    liquidity: ModuleResult<LiquidityData>
    calendar: ModuleResult<CalendarData>
    news: ModuleResult<{ items: NewsBrief[] }>
    finnhub: ModuleResult<{ note: string }>
  }
}
