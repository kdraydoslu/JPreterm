import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'all'
  
  try {
    const url = `https://gamma-api.polymarket.com/markets?active=true&closed=false&order=volume&dir=desc&limit=25`
    
    // Add User-Agent or other headers to prevent blocks
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      // cache: "no-store", // Optional: avoid aggressive caching
    })

    if (!response.ok) {
      throw new Error(`Polymarket API returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Polymarket Proxy Error:", error.message)
    return NextResponse.json({ error: "Failed to fetch from Polymarket", details: error.message }, { status: 500 })
  }
}
