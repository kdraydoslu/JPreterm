import { NextResponse } from 'next/server'

// BIST ve Türkiye ekonomisi haberleri
export async function GET() {
  try {
    // Gerçek uygulamada RSS feed veya haber API'si kullanılabilir
    const news = [
      {
        id: 1,
        time: new Date(Date.now() - 15 * 60000).toISOString(),
        source: 'Bloomberg HT',
        title: 'TCMB faiz kararını açıkladı',
        content: 'Merkez Bankası politika faizini %50 seviyesinde sabit tuttu.',
        impact: 'HIGH',
        category: 'MONETARY_POLICY'
      },
      {
        id: 2,
        time: new Date(Date.now() - 45 * 60000).toISOString(),
        source: 'Anadolu Ajansı',
        title: 'THYAO yeni uçak siparişi verdi',
        content: 'Türk Hava Yolları 50 adet yeni uçak siparişi verdiğini açıkladı.',
        impact: 'MEDIUM',
        category: 'CORPORATE'
      },
      {
        id: 3,
        time: new Date(Date.now() - 90 * 60000).toISOString(),
        source: 'Reuters',
        title: 'Enflasyon verileri beklentilerin üzerinde',
        content: 'Aylık enflasyon %3.2 olarak açıklandı, beklenti %2.9 idi.',
        impact: 'HIGH',
        category: 'ECONOMIC_DATA'
      },
      {
        id: 4,
        time: new Date(Date.now() - 120 * 60000).toISOString(),
        source: 'Investing.com',
        title: 'ASELS savunma sanayi ihracatını artırdı',
        content: 'Aselsan ilk çeyrek ihracat rakamlarını %45 artışla açıkladı.',
        impact: 'MEDIUM',
        category: 'CORPORATE'
      },
      {
        id: 5,
        time: new Date(Date.now() - 180 * 60000).toISOString(),
        source: 'Dünya Gazetesi',
        title: 'Bankacılık sektörü kâr açıkladı',
        content: 'Özel bankalar ilk çeyrek kârlarını açıkladı, sektör büyümesi devam ediyor.',
        impact: 'MEDIUM',
        category: 'SECTOR'
      },
      {
        id: 6,
        time: new Date(Date.now() - 240 * 60000).toISOString(),
        source: 'TRT Haber',
        title: 'Dolar/TL 34.25 seviyesinde',
        content: 'Dolar/TL paritesi gün içinde %0.45 yükselişle 34.25 seviyesinde işlem görüyor.',
        impact: 'HIGH',
        category: 'FOREX'
      }
    ]

    return NextResponse.json({
      news,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('BIST news fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
