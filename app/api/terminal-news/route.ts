import { NextResponse } from 'next/server'
import { loadTerminalNews } from '@/lib/terminal-news'

export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await loadTerminalNews()
  return NextResponse.json({
    status: items.length > 0 ? 'ok' : 'empty',
    items,
    count: items.length,
    updatedAt: new Date().toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul' }),
  })
}
