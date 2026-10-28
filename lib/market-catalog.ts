export type QuoteGroup = 'us' | 'bist' | 'index' | 'commodity' | 'fx' | 'crypto' | 'indicator'
export type ChartGroup = 'endeks' | 'kripto' | 'emtia' | 'faiz'

export interface CatalogItem {
  id: string
  yahoo: string
  name: string
  group: QuoteGroup
  region?: 'amerika' | 'avrupa' | 'asya' | 'turkiye'
  chart?: ChartGroup
}

export const MARKET_CATALOG: CatalogItem[] = [
  { id: 'SPX', yahoo: '^GSPC', name: 'S&P 500', group: 'index', region: 'amerika', chart: 'endeks' },
  { id: 'NDX', yahoo: '^IXIC', name: 'Nasdaq', group: 'index', region: 'amerika', chart: 'endeks' },
  { id: 'DJI', yahoo: '^DJI', name: 'Dow Jones', group: 'index', region: 'amerika' },
  { id: 'RUT', yahoo: '^RUT', name: 'Russell 2000', group: 'index', region: 'amerika' },
  { id: 'BOVESPA', yahoo: '^BVSP', name: 'Bovespa', group: 'index', region: 'amerika' },
  { id: 'DAX', yahoo: '^GDAXI', name: 'DAX', group: 'index', region: 'avrupa' },
  { id: 'FTSE', yahoo: '^FTSE', name: 'FTSE 100', group: 'index', region: 'avrupa' },
  { id: 'CAC', yahoo: '^FCHI', name: 'CAC 40', group: 'index', region: 'avrupa' },
  { id: 'STOXX', yahoo: '^STOXX50E', name: 'Euro Stoxx 50', group: 'index', region: 'avrupa' },
  { id: 'NIKKEI', yahoo: '^N225', name: 'Nikkei 225', group: 'index', region: 'asya' },
  { id: 'KOSPI', yahoo: '^KS11', name: 'KOSPI', group: 'index', region: 'asya' },
  { id: 'HSI', yahoo: '^HSI', name: 'Hang Seng', group: 'index', region: 'asya' },
  { id: 'SHCOMP', yahoo: '000001.SS', name: 'Shanghai', group: 'index', region: 'asya' },
  { id: 'NIFTY', yahoo: '^NSEI', name: 'Nifty 50', group: 'index', region: 'asya' },
  { id: 'BIST100', yahoo: 'XU100.IS', name: 'BIST 100', group: 'index', region: 'turkiye', chart: 'endeks' },

  { id: 'VIX', yahoo: '^VIX', name: 'VIX', group: 'indicator' },
  { id: 'DXY', yahoo: 'DX-Y.NYB', name: 'Dolar endeksi', group: 'indicator' },

  { id: 'GOLD', yahoo: 'GC=F', name: 'Altın', group: 'commodity', chart: 'emtia' },
  { id: 'SILVER', yahoo: 'SI=F', name: 'Gümüş', group: 'commodity' },
  { id: 'WTI', yahoo: 'CL=F', name: 'WTI petrol', group: 'commodity', chart: 'emtia' },
  { id: 'BRENT', yahoo: 'BZ=F', name: 'Brent petrol', group: 'commodity', chart: 'emtia' },
  { id: 'COPPER', yahoo: 'HG=F', name: 'Bakır', group: 'commodity' },

  { id: 'USDTRY', yahoo: 'USDTRY=X', name: 'USD/TRY', group: 'fx' },
  { id: 'EURTRY', yahoo: 'EURTRY=X', name: 'EUR/TRY', group: 'fx' },
  { id: 'GBPTRY', yahoo: 'GBPTRY=X', name: 'GBP/TRY', group: 'fx' },
  { id: 'EURUSD', yahoo: 'EURUSD=X', name: 'EUR/USD', group: 'fx' },
  { id: 'USDJPY', yahoo: 'JPY=X', name: 'USD/JPY', group: 'fx' },

  { id: 'BTC', yahoo: 'BTC-USD', name: 'Bitcoin', group: 'crypto', chart: 'kripto' },
  { id: 'ETH', yahoo: 'ETH-USD', name: 'Ethereum', group: 'crypto', chart: 'kripto' },

  { id: 'NVDA', yahoo: 'NVDA', name: 'NVIDIA', group: 'us' },
  { id: 'AAPL', yahoo: 'AAPL', name: 'Apple', group: 'us' },
  { id: 'MSFT', yahoo: 'MSFT', name: 'Microsoft', group: 'us' },
  { id: 'AMZN', yahoo: 'AMZN', name: 'Amazon', group: 'us' },
  { id: 'GOOGL', yahoo: 'GOOGL', name: 'Alphabet', group: 'us' },
  { id: 'META', yahoo: 'META', name: 'Meta', group: 'us' },
  { id: 'TSLA', yahoo: 'TSLA', name: 'Tesla', group: 'us' },
  { id: 'AVGO', yahoo: 'AVGO', name: 'Broadcom', group: 'us' },
  { id: 'JPM', yahoo: 'JPM', name: 'JPMorgan', group: 'us' },

  { id: 'THYAO', yahoo: 'THYAO.IS', name: 'Türk Hava Yolları', group: 'bist' },
  { id: 'GARAN', yahoo: 'GARAN.IS', name: 'Garanti BBVA', group: 'bist' },
  { id: 'AKBNK', yahoo: 'AKBNK.IS', name: 'Akbank', group: 'bist' },
  { id: 'ASELS', yahoo: 'ASELS.IS', name: 'Aselsan', group: 'bist' },
  { id: 'EREGL', yahoo: 'EREGL.IS', name: 'Ereğli Demir Çelik', group: 'bist' },
  { id: 'TUPRS', yahoo: 'TUPRS.IS', name: 'Tüpraş', group: 'bist' },
  { id: 'SAHOL', yahoo: 'SAHOL.IS', name: 'Sabancı Holding', group: 'bist' },
  { id: 'KCHOL', yahoo: 'KCHOL.IS', name: 'Koç Holding', group: 'bist' },
  { id: 'BIMAS', yahoo: 'BIMAS.IS', name: 'BİM', group: 'bist' },
  { id: 'SISE', yahoo: 'SISE.IS', name: 'Şişecam', group: 'bist' },
  { id: 'YKBNK', yahoo: 'YKBNK.IS', name: 'Yapı Kredi', group: 'bist' },
  { id: 'ISCTR', yahoo: 'ISCTR.IS', name: 'İş Bankası', group: 'bist' },
  { id: 'TCELL', yahoo: 'TCELL.IS', name: 'Turkcell', group: 'bist' },
  { id: 'FROTO', yahoo: 'FROTO.IS', name: 'Ford Otosan', group: 'bist' },
  { id: 'TOASO', yahoo: 'TOASO.IS', name: 'Tofaş', group: 'bist' },
  { id: 'PGSUS', yahoo: 'PGSUS.IS', name: 'Pegasus', group: 'bist' },
  { id: 'ENKAI', yahoo: 'ENKAI.IS', name: 'Enka', group: 'bist' },
]

export const QUOTE_NOTE = 'Yüzde değişim önceki seans kapanışına göredir (günlük).'
