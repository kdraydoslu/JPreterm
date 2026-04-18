'use client'

import { MiniChart } from './mini-chart'

export function ChartRow() {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT']

  return (
    <div className="grid grid-cols-4 border-b border-[rgba(255,119,0,0.15)] bg-[rgba(10,3,0,0.9)] overflow-hidden p-0">
      {symbols.map((symbol) => (
        <MiniChart key={symbol} symbol={symbol} />
      ))}
    </div>
  )
}
