import type { Metadata, Viewport } from 'next'
import { Share_Tech_Mono, Orbitron, Rajdhani } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { BackgroundVideo } from '@/components/background-video'
import { WalletProvider } from '@/components/wallet-provider'
import './globals.css'

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-share-tech-mono',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
})

const rajdhani = Rajdhani({
  weight: ['300', '400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
})

export const metadata: Metadata = {
  title: 'JARVIS PRE TERM — Advanced Trading Terminal',
  description: 'Professional Multi-Market Trading Terminal with Real-Time Analytics',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#020810',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#020810]">
      <body
        className={`${shareTechMono.variable} ${orbitron.variable} ${rajdhani.variable} font-mono antialiased`}
      >
        <WalletProvider>
          <BackgroundVideo />
          <div className="relative z-10">
            {children}
          </div>
        </WalletProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
