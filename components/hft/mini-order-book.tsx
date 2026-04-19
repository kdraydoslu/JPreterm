'use client'

import { useEffect, useState } from 'react'

interface OrderBookProps {
  tokenId: string
  side: 'YES' | 'NO'
}

export function MiniOrderBook({ tokenId, side }: OrderBookProps) {
  const [book, setBook] = useState<{ price: number; size: number }[]>([])

  useEffect(() => {
    // Simulation for now, can be replaced with real fetching
    const generateBook = () => {
      const base = side === 'YES' ? 0.82 : 0.18
      return Array(5).fill(0).map((_, i) => ({
        price: base + (side === 'YES' ? -i : i) * 0.01,
        size: Math.floor(Math.random() * 5000) + 1000
      }))
    }
    setBook(generateBook())
    const interval = setInterval(() => setBook(generateBook()), 5000)
    return () => clearInterval(interval)
  }, [tokenId, side])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[7px] text-white/30 font-bold uppercase tracking-widest px-1">
         <span>Price</span>
         <span>Size</span>
      </div>
      <div className="space-y-0.5">
        {book.map((row, i) => (
          <div key={i} className="flex justify-between items-center text-[9px] font-mono px-1 hover:bg-white/5 rounded">
             <span className={side === 'YES' ? 'text-[#00ff9d]' : 'text-[#ff3333]'}>
               ${row.price.toFixed(2)}
             </span>
             <span className="text-white/60">
               {(row.size / 1000).toFixed(1)}k
             </span>
          </div>
        ))}
      </div>
    </div>
  )
}
