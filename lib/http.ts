export class UpstreamError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UpstreamError'
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return 'kaynak'
  }
}

export async function fetchText(
  url: string,
  options: { timeoutMs?: number; accept?: string; headers?: Record<string, string> } = {}
): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 10000)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: options.accept ?? '*/*',
        ...options.headers,
      },
    })
    const text = await response.text()
    if (!response.ok) {
      throw new UpstreamError(`HTTP ${response.status} (${hostOf(url)})`)
    }
    return text
  } catch (error) {
    if (error instanceof UpstreamError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new UpstreamError(`zaman aşımı (${hostOf(url)})`)
    }
    throw new UpstreamError(`kaynak erişilemedi (${hostOf(url)})`)
  } finally {
    clearTimeout(timer)
  }
}
