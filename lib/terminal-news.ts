import { fetchText } from '@/lib/http'

export interface NewsItem {
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

function calculateTimeAgo(dateStr: string): { timeAgo: string; timestamp: string } {
  if (!dateStr) return { timeAgo: 'Az önce', timestamp: 'Şimdi' }

  let date: Date
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
    date = new Date(dateStr.replace(' ', 'T') + 'Z')
  } else {
    date = new Date(dateStr)
  }

  if (isNaN(date.getTime())) return { timeAgo: 'Az önce', timestamp: 'Şimdi' }

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const timestamp = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })

  if (diffMinutes <= 1) return { timeAgo: 'Az önce', timestamp }
  if (diffMinutes < 60) return { timeAgo: `${diffMinutes} dk önce`, timestamp }
  if (diffHours < 24) return { timeAgo: `${diffHours} sa önce`, timestamp }
  return { timeAgo: `${Math.floor(diffHours / 24)} gün önce`, timestamp }
}

function parseRssXml(xml: string, source: string, category: NewsItem['category'], badge: string, isXWire = false): NewsItem[] {
  const items: NewsItem[] = []
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || []

  for (let i = 0; i < Math.min(itemMatches.length, 8); i++) {
    const rawItem = itemMatches[i]
    const titleMatch = rawItem.match(/<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/i)
    const title = cleanText(titleMatch ? (titleMatch[1] || titleMatch[2] || '') : '')
    const linkMatch = rawItem.match(/<link>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/link>/i)
    const link = (linkMatch ? (linkMatch[1] || linkMatch[2] || '') : '').trim()
    const descMatch = rawItem.match(/<description>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/description>/i)
    const desc = cleanText(descMatch ? (descMatch[1] || descMatch[2] || '') : '')
    const pubDate = rawItem.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() || ''
    if (!title) continue
    const { timeAgo, timestamp } = calculateTimeAgo(pubDate)
    items.push({
      id: `${source}-${i}`,
      title,
      summary: desc.length > 220 ? `${desc.substring(0, 220)}...` : desc || title,
      source: isXWire ? 'X / ForexLive Wire' : source,
      category,
      importance: i === 0 ? 'breaking' : 'normal',
      timestamp,
      timeAgo,
      url: link,
      authorHandle: isXWire ? '@ForexLive' : undefined,
      badge,
    })
  }
  return items
}

const FEEDS: Array<{ source: string; url: string; category: NewsItem['category']; badge: string; isXWire?: boolean }> = [
  { source: 'ForexLive Wire', url: 'https://www.forexlive.com/feed/news', category: 'x', badge: 'X TELGRAF', isXWire: true },
  { source: 'TRT Haber Son Dakika', url: 'https://www.trthaber.com/sondakika_articles.rss', category: 'tr', badge: 'SON DAKİKA' },
  { source: 'Anadolu Ajansı', url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel', category: 'tr', badge: 'AA GÜNCEL' },
  { source: 'TRT Ekonomi', url: 'https://www.trthaber.com/ekonomi_articles.rss', category: 'economy', badge: 'EKONOMİ' },
  { source: 'CNBC Finance', url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', category: 'economy', badge: 'KÜRESEL PİYASA' },
  { source: 'Decrypt Live', url: 'https://decrypt.co/feed', category: 'crypto', badge: 'KRİPTO' },
  { source: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'crypto', badge: 'KRİPTO' },
  { source: 'BBC World News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'world', badge: 'DÜNYA' },
]

export async function loadTerminalNews(): Promise<NewsItem[]> {
  const now = Date.now()
  if (cachedNews && now - cachedNews.timestamp < 30000 && cachedNews.data.length > 0) {
    return cachedNews.data
  }

  const settled = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const xml = await fetchText(feed.url, { timeoutMs: 8000, accept: 'application/rss+xml, application/xml, text/xml' })
      return parseRssXml(xml, feed.source, feed.category, feed.badge, feed.isXWire)
    })
  )

  const items = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
  if (items.length > 0) cachedNews = { data: items, timestamp: now }
  return items.length > 0 ? items : cachedNews?.data ?? []
}
