'use client'

import { useEffect, useRef } from 'react'
import { createChart, ColorType, AreaSeries, type Time } from 'lightweight-charts'

interface MarketChartProps {
  data: { time: number; value: number }[]
  color?: string
}

export function MarketChart({ data, color = '#ff7700' }: MarketChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.4)',
      },
      width: chartContainerRef.current.clientWidth,
      height: 200,
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    })

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: color,
      topColor: color,
      bottomColor: 'rgba(255, 119, 0, 0)',
      lineWidth: 2,
    })

    areaSeries.setData(data.map(d => ({ ...d, time: d.time as Time })))
    chart.timeScale().fitContent()

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, color])

  return <div ref={chartContainerRef} className="w-full h-[200px]" />
}
