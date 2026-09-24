import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 30

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  category: 'all' | 'tr' | 'world' | 'economy' | 'crypto' | 'x'
  importance: 'breaking' | 'high' | 'normal'
  timestamp: string
  timeAgo: string
  url: string
  authorHandle?: string
  badge: string
}

let cachedNews: { data: NewsItem[]; timestamp: number } | null = null

// Strip HTML tags and clean up string
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

// Calculate human-friendly time ago
function calculateTimeAgo(dateStr: string): { timeAgo: string; timestamp: string } {
  if (!dateStr) return { timeAgo: 'Az önce', timestamp: 'Şimdi' }

  let date: Date
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
    date = new Date(dateStr.replace(' ', 'T') + 'Z')
  } else {
    date = new Date(dateStr)
  }

  if (isNaN(date.getTime())) {
    return { timeAgo: 'Az önce', timestamp: 'Şimdi' }
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)

  const timestamp = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

  if (diffMinutes <= 1) return { timeAgo: 'Az önce', timestamp }
  if (diffMinutes < 60) return { timeAgo: `${diffMinutes} dk önce`, timestamp }
  if (diffHours < 24) return { timeAgo: `${diffHours} sa önce`, timestamp }
  return { timeAgo: `${Math.floor(diffHours / 24)} gün önce`, timestamp }
}

// Simple XML RSS parser for Next.js server runtime without external binary dependencies
function parseRssXml(xml: string, source: string, category: NewsItem['category'], badge: string, isXWire = false): NewsItem[] {
  const items: NewsItem[] = []
  const itemRegex = /<item[\s\S]*?<\/item>/gi
  const itemMatches = xml.match(itemRegex) || []

  for (let i = 0; i < Math.min(itemMatches.length, 12); i++) {
    const rawItem = itemMatches[i]

    const titleMatch = rawItem.match(/<title>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/title>/is)
    const title = cleanText(titleMatch ? (titleMatch[1] || titleMatch[2] || '') : '')

    const linkMatch = rawItem.match(/<link>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/link>/is)
    const link = (linkMatch ? (linkMatch[1] || linkMatch[2] || '') : '').trim()

    const descMatch = rawItem.match(/<description>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/description>/is)
    const desc = cleanText(descMatch ? (descMatch[1] || descMatch[2] || '') : '')

    const pubDateMatch = rawItem.match(/<pubDate>(.*?)<\/pubDate>/is)
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : ''

    if (!title) continue

    const { timeAgo, timestamp } = calculateTimeAgo(pubDate)
    const isBreaking = i === 0

    items.push({
      id: `${source}-${i}-${Date.now()}`,
      title,
      summary: desc.length > 220 ? `${desc.substring(0, 220)}...` : desc || title,
      source: isXWire ? 'X / ForexLive Wire' : source,
      category,
      importance: isBreaking ? 'breaking' : 'normal',
      timestamp,
      timeAgo,
      url: link,
      authorHandle: isXWire ? '@ForexLive' : undefined,
      badge
    })
  }

  return items
}

export async function GET() {
  const now = Date.now()
  if (cachedNews && now - cachedNews.timestamp < 30000 && cachedNews.data.length > 0) {
    return NextResponse.json({
      status: 'ok',
      items: cachedNews.data,
      count: cachedNews.data.length,
      cached: true
    })
  }

  const feeds = [
    {
      source: 'ForexLive Wire',
      url: 'https://www.forexlive.com/feed/news',
      category: 'x' as const,
      badge: 'X TELGRAF',
      isXWire: true
    },
    {
      source: 'TRT Haber Son Dakika',
      url: 'https://www.trthaber.com/sondakika_articles.rss',
      category: 'tr' as const,
      badge: 'SON DAKİKA'
    },
    {
      source: 'Anadolu Ajansı',
      url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel',
      category: 'tr' as const,
      badge: 'AA GÜNCEL'
    },
    {
      source: 'TRT Ekonomi',
      url: 'https://www.trthaber.com/ekonomi_articles.rss',
      category: 'economy' as const,
      badge: 'EKONOMİ'
    },
    {
      source: 'CNBC Finance',
      url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',
      category: 'economy' as const,
      badge: 'KÜRESEL PİYASA'
    },
    {
      source: 'Decrypt Live',
      url: 'https://decrypt.co/feed',
      category: 'crypto' as const,
      badge: 'KRİPTO'
    },
    {
      source: 'CoinDesk',
      url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
      category: 'crypto' as const,
      badge: 'KRİPTO'
    },
    {
      source: 'BBC World News',
      url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
      category: 'world' as const,
      badge: 'DÜNYA'
    }
  ]

  const allItems: NewsItem[] = []

  const promises = feeds.map(async (feed) => {
    try {
      const res = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JarvisPreTerm/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        next: { revalidate: 30 }
      })

      if (!res.ok) return []
      const xml = await res.text()
      return parseRssXml(xml, feed.source, feed.category, feed.badge, feed.isXWire)
    } catch {
      return []
    }
  })

  const settled = await Promise.allSettled(promises)
  for (const result of settled) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      allItems.push(...result.value)
    }
  }

  // Interleave and sort by recency
  if (allItems.length > 0) {
    cachedNews = { data: allItems, timestamp: now }
  }

  return NextResponse.json({
    status: 'ok',
    items: allItems.length > 0 ? allItems : (cachedNews?.data || []),
    count: allItems.length,
    cached: false,
    updatedAt: new Date().toLocaleTimeString('tr-TR')
  })
}
