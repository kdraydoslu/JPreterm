import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const symbol = new URL(request.url).searchParams.get('symbol')?.trim().toUpperCase() ?? ''
  if (!/^[A-Z0-9.:_-]{1,24}$/.test(symbol)) {
    return NextResponse.json(
      { ok: false, status: 'error', source: 'Finnhub', error: 'Geçerli bir sembol gerekli' },
      { status: 400 }
    )
  }

  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      status: 'disabled',
      source: 'Finnhub',
      asOf: new Date().toISOString(),
      error: 'FINNHUB_API_KEY tanımlı değil. Finnhub modülü devre dışı.',
    })
  }

  try {
    const url = new URL('https://finnhub.io/api/v1/quote')
    url.searchParams.set('symbol', symbol)
    url.searchParams.set('token', apiKey)
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
      return NextResponse.json(
        { ok: false, status: 'error', source: 'Finnhub', error: `Finnhub HTTP ${response.status}` },
        { status: 502 }
      )
    }
    const quote = await response.json()
    return NextResponse.json({
      ok: true,
      source: 'Finnhub',
      asOf: new Date().toISOString(),
      symbol,
      quote,
    })
  } catch {
    return NextResponse.json(
      { ok: false, status: 'error', source: 'Finnhub', error: 'Finnhub isteği tamamlanamadı' },
      { status: 502 }
    )
  }
}
