import { NextResponse } from 'next/server'
import { getSnapshot } from '@/lib/snapshot'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
  const snapshot = await getSnapshot()
  return NextResponse.json(snapshot, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  })
}
