import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 30

function cleanText(htmlStr: string): string {
  if (!htmlStr) return ''
  return htmlStr
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

// BIST ve Türkiye ekonomisi gerçek haberleri
export async function GET() {
  try {
    const feeds = [
      {
        url: 'https://www.trthaber.com/ekonomi_articles.rss',
        source: 'TRT Ekonomi'
      },
      {
        url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel',
        source: 'Anadolu Ajansı'
      },
      {
        url: 'https://www.trthaber.com/sondakika_articles.rss',
        source: 'TRT Son Dakika'
      }
    ]

    const allNews: any[] = []

    for (const feed of feeds) {
      try {
        const res = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JarvisPreTerm/1.0',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*'
          },
          next: { revalidate: 30 }
        })

        if (!res.ok) continue
        const xml = await res.text()
        const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || []

        for (let i = 0; i < Math.min(itemMatches.length, 6); i++) {
          const rawItem = itemMatches[i]
          const titleMatch = rawItem.match(/<title>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/title>/is)
          const title = cleanText(titleMatch ? (titleMatch[1] || titleMatch[2] || '') : '')

          const descMatch = rawItem.match(/<description>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/description>/is)
          const content = cleanText(descMatch ? (descMatch[1] || descMatch[2] || '') : '')

          const pubDateMatch = rawItem.match(/<pubDate>(.*?)<\/pubDate>/is)
          const pubDate = pubDateMatch ? pubDateMatch[1].trim() : ''

          const linkMatch = rawItem.match(/<link>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/link>/is)
          const url = (linkMatch ? (linkMatch[1] || linkMatch[2] || '') : '').trim()

          if (!title) continue

          const isHigh = i === 0 || title.toLowerCase().includes('faiz') || title.toLowerCase().includes('enflasyon') || title.toLowerCase().includes('bist')

          allNews.push({
            id: `bist-${feed.source}-${i}-${Date.now()}`,
            time: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            source: feed.source,
            title,
            content: content || title,
            impact: isHigh ? 'HIGH' : 'MEDIUM',
            category: 'MARKET',
            url
          })
        }
      } catch (err) {
        // continue to next feed
      }
    }

    return NextResponse.json({
      news: allNews.length > 0 ? allNews : [
        {
          id: 'default-1',
          time: new Date().toISOString(),
          source: 'BIST / KAP',
          title: 'Borsa İstanbul BIST 100 Endeksi İşlemleri Devam Ediyor',
          content: 'BIST 100 endeksi ve pay piyasalarında canlı fiyatlama aktif veri sağlayıcı üzerinden takip ediliyor.',
          impact: 'HIGH',
          category: 'MARKET'
        }
      ],
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('BIST news fetch error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch news' }, { status: 500 })
  }
}
