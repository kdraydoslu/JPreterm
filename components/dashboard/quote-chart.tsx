'use client'

import { useEffect, useRef } from 'react'
import type { ChartPoint } from '@/lib/snapshot-types'
import { fmtWhen } from '@/components/dashboard/format'

export function QuoteChart({
  title,
  source,
  asOf,
  lines,
  tall,
}: {
  title: string
  source: string
  asOf?: string
  lines: { color: string; points: ChartPoint[] }[]
  tall?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const linesRef = useRef(lines)
  linesRef.current = lines
  const usable = lines.filter((line) => line.points.length >= 2)
  const signature = lines
    .map((line) => `${line.color}:${line.points.length}:${line.points[line.points.length - 1]?.time ?? 0}`)
    .join('|')

  useEffect(() => {
    const host = ref.current
    const current = linesRef.current.filter((line) => line.points.length >= 2)
    if (!host || current.length === 0) return
    let removed = false
    let chart: { remove: () => void } | null = null

    ;(async () => {
      const { createChart, AreaSeries, LineSeries, ColorType } = await import('lightweight-charts')
      if (removed || !ref.current) return
      const next = createChart(ref.current, {
        autoSize: true,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#ffbb88',
          fontSize: 11,
        },
        grid: {
          vertLines: { color: 'rgba(255,119,0,0.06)' },
          horzLines: { color: 'rgba(255,119,0,0.06)' },
        },
        rightPriceScale: { borderColor: 'rgba(255,119,0,0.25)' },
        timeScale: { borderColor: 'rgba(255,119,0,0.25)', timeVisible: true, secondsVisible: false },
        handleScroll: false,
        handleScale: false,
      })
      current.forEach((line, index) => {
        const series = next.addSeries(index === 0 ? AreaSeries : LineSeries, {
          lineColor: line.color,
          topColor: 'rgba(255,119,0,0.28)',
          bottomColor: 'rgba(255,119,0,0.02)',
          lineWidth: 2,
          priceLineVisible: false,
        })
        series.setData(line.points.map((point) => ({ time: point.time as never, value: point.value })))
      })
      next.timeScale().fitContent()
      chart = next
    })()

    return () => {
      removed = true
      chart?.remove()
    }
  }, [signature, title])

  return (
    <article className="rounded-md border border-[rgba(255,119,0,0.18)] bg-[rgba(5,1,0,0.92)] p-2 min-w-0">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h3 className="font-[var(--font-orbitron)] text-[11px] tracking-[1px] text-[#ff7700]">{title}</h3>
        <span className="truncate text-[9px] text-[rgba(255,238,221,0.45)]">{source} · {fmtWhen(asOf)}</span>
      </div>
      {usable.length === 0 ? (
        <p className="flex h-32 items-center justify-center text-xs text-[#ffcc00]">Grafik verisi yok</p>
      ) : (
        <div ref={ref} className={tall ? 'h-80' : 'h-44 sm:h-52'} />
      )}
    </article>
  )
}
