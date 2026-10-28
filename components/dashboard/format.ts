export function fmt(value: number, digits = 2): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function fmtPx(value: number): string {
  const abs = Math.abs(value)
  const digits = abs >= 100 ? 2 : abs >= 1 ? 4 : 6
  return fmt(value, digits)
}

export function fmtPct(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${fmt(value, 2)}%`
}

export function fmtWhen(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function istanbulClock(date = new Date()): string {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}
