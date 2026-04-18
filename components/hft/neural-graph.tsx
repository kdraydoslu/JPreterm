'use client'

import { useEffect, useRef, useState } from 'react'
import { marketDataService } from '@/lib/market-data'
import { correlationService } from '@/lib/correlation-service'

interface Node {
  name: string
  group: 'crypto' | 'equity' | 'bist'
  x: number
  y: number
  color: string
  r: number
  vx: number
  vy: number
  phase: number
  pulse: number
}

interface Edge {
  a: number
  b: number
  corr: number
  phase: number
  speed: number
}

export function NeuralGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])
  const tRef = useRef(0)
  const [maxCorr, setMaxCorr] = useState(0)
  const [minCorr, setMinCorr] = useState(0)

  useEffect(() => {
    const colors: Record<string, string> = { crypto: '#ff7700', equity: '#00ff9d', bist: '#ff00aa' }

    const groups = [
      { name: 'BTC', symbol: 'BTCUSDT', group: 'crypto' as const, x: 0.35, y: 0.35 },
      { name: 'ETH', symbol: 'ETHUSDT', group: 'crypto' as const, x: 0.25, y: 0.55 },
      { name: 'SOL', symbol: 'SOLUSDT', group: 'crypto' as const, x: 0.45, y: 0.65 },
      { name: 'XRP', symbol: 'XRPUSDT', group: 'crypto' as const, x: 0.15, y: 0.42 },
      { name: 'BNB', symbol: 'BNBUSDT', group: 'crypto' as const, x: 0.3, y: 0.25 },
      { name: 'ADA', symbol: 'ADAUSDT', group: 'crypto' as const, x: 0.52, y: 0.48 },
      { name: 'DOGE', symbol: 'DOGEUSDT', group: 'crypto' as const, x: 0.38, y: 0.72 },
    ]

    nodesRef.current = groups.map((g) => ({
      name: g.name,
      group: g.group,
      color: colors[g.group],
      x: g.x,
      y: g.y,
      r: 8 + Math.random() * 6,
      vx: (Math.random() - 0.5) * 0.001,
      vy: (Math.random() - 0.5) * 0.001,
      phase: Math.random() * Math.PI * 2,
      pulse: Math.random(),
    }))

    // Subscribe to price updates for correlation calculation
    groups.forEach((g) => {
      marketDataService.subscribeTicker(g.symbol, (data) => {
        const price = parseFloat(data.price)
        correlationService.addPricePoint(g.symbol, price)
      })
    })

    // Update correlations periodically
    const corrInterval = setInterval(() => {
      const symbols = groups.map((g) => g.symbol)
      const correlations = correlationService.getAllCorrelations(symbols)

      // Update edges with real correlations
      const newEdges: Edge[] = []
      let maxC = 0
      let minC = 0

      correlations.forEach((corrData) => {
        const idx1 = groups.findIndex((g) => g.symbol === corrData.symbol1)
        const idx2 = groups.findIndex((g) => g.symbol === corrData.symbol2)

        if (idx1 !== -1 && idx2 !== -1) {
          newEdges.push({
            a: idx1,
            b: idx2,
            corr: corrData.correlation,
            phase: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.04,
          })

          maxC = Math.max(maxC, corrData.correlation)
          minC = Math.min(minC, corrData.correlation)
        }
      })

      edgesRef.current = newEdges
      setMaxCorr(maxC)
      setMinCorr(minC)
    }, 3000)

    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      const W = canvas.width
      const H = canvas.height
      if (!W || !H) return

      ctx.clearRect(0, 0, W, H)

      const t = tRef.current
      const nodes = nodesRef.current
      const edges = edgesRef.current

      // Update node positions with gentle float
      nodes.forEach((n) => {
        n.x += n.vx + Math.sin(t * 0.3 + n.phase) * 0.0003
        n.y += n.vy + Math.cos(t * 0.2 + n.phase) * 0.0003
        n.x = Math.max(0.08, Math.min(0.92, n.x))
        n.y = Math.max(0.08, Math.min(0.92, n.y))
      })

      // Draw edges
      edges.forEach((e) => {
        const a = nodes[e.a]
        const b = nodes[e.b]
        if (!a || !b) return
        
        const ax = a.x * W
        const ay = a.y * H
        const bx = b.x * W
        const by = b.y * H
        const alpha = 0.15 + Math.abs(e.corr) * 0.3 + Math.sin(t * e.speed + e.phase) * 0.1

        let col: string
        if (e.corr > 0.4) col = `rgba(0,255,157,${alpha})`
        else if (e.corr < -0.2) col = `rgba(255,34,68,${alpha})`
        else col = `rgba(255,119,0,${alpha * 0.6})`

        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.strokeStyle = col
        ctx.lineWidth = Math.abs(e.corr) * 2 + 0.3
        ctx.stroke()

        // Animated particle on edge
        const progress = (Math.sin(t * e.speed * 3 + e.phase) + 1) / 2
        const px = ax + (bx - ax) * progress
        const py = ay + (by - ay) * progress
        ctx.beginPath()
        ctx.arc(px, py, 2, 0, Math.PI * 2)
        ctx.fillStyle = col.replace(/[\d.]+\)$/, '0.9)')
        ctx.fill()
      })

      // Draw nodes
      nodes.forEach((n) => {
        const x = n.x * W
        const y = n.y * H
        const pulse = Math.sin(t * 1.5 + n.phase) * 0.3 + 0.7
        const r = n.r * pulse

        // Outer glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 3)
        const hexToRgba = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16)
          const g = parseInt(hex.slice(3, 5), 16)
          const b = parseInt(hex.slice(5, 7), 16)
          return `rgba(${r},${g},${b},0.3)`
        }
        grd.addColorStop(0, hexToRgba(n.color))
        grd.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(x, y, r * 3, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Inner circle
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = n.color + '33'
        ctx.fill()
        ctx.strokeStyle = n.color
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Center dot
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fillStyle = n.color
        ctx.fill()

        // Label
        ctx.fillStyle = n.color
        ctx.font = "bold 8px 'Share Tech Mono'"
        ctx.textAlign = 'center'
        ctx.fillText(n.name, x, y - r - 3)
      })

      // Cluster labels
      const clusters = [
        { label: 'BTC-ETH-SOL', x: 0.35, y: 0.2 },
        { label: 'XRP-BNB-ADA', x: 0.25, y: 0.15 },
        { label: 'DOGE', x: 0.38, y: 0.85 },
      ]
      clusters.forEach((cl) => {
        ctx.fillStyle = 'rgba(255,119,0,0.4)'
        ctx.font = "7px 'Orbitron'"
        ctx.textAlign = 'center'
        ctx.fillText(cl.label, cl.x * W, cl.y * H)
      })
    }

    const animate = () => {
      tRef.current += 0.02
      draw()
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      clearInterval(corrInterval)
      groups.forEach((g) => {
        marketDataService.unsubscribe(g.symbol)
      })
    }
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      <div className="flex items-center justify-between px-2 py-1 bg-[rgba(10,3,0,0.8)] border-b border-[rgba(255,119,0,0.15)] shrink-0">
        <span className="font-[var(--font-orbitron)] text-[9px] font-bold text-[#ff7700] tracking-[1.5px] [text-shadow:0_0_6px_rgba(255,119,0,0.5)]">
          NEURAL RELATIONSHIP GRAPH
        </span>
        <div className="flex gap-1.5 items-center">
          <span className="text-[8px] text-[rgba(255,119,0,0.4)]">
            HIGH: <span className="text-[#00ff9d]">{maxCorr.toFixed(2)}</span>
          </span>
          <span className="text-[8px] text-[rgba(255,119,0,0.4)]">
            LOW: <span className="text-[#ff2244]">{minCorr.toFixed(2)}</span>
          </span>
          <span className="bg-[rgba(255,34,68,0.15)] border border-[rgba(255,34,68,0.5)] text-[#ff2244] text-[8px] px-1.5 py-0.5 rounded-sm tracking-[2px] font-[var(--font-orbitron)] animate-[liveBlink_1s_step-end_infinite]">
            LIVE
          </span>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      <div className="absolute bottom-1.5 left-2 flex gap-1.5">
        <button className="text-[8px] text-[#ff7700] bg-[rgba(10,3,0,0.8)] border border-[#ff7700] px-2 py-0.5 font-mono rounded-sm shadow-[var(--glow-orange)]">
          Correlations
        </button>
        <button className="text-[8px] text-[rgba(255,119,0,0.6)] bg-[rgba(10,3,0,0.8)] border border-[rgba(255,119,0,0.2)] px-2 py-0.5 font-mono rounded-sm">
          Beta
        </button>
      </div>
      <div className="absolute top-[30px] right-1 flex flex-col gap-0.5 text-[7px]">
        <div className="text-[rgba(255,119,0,0.4)]">
          <span className="text-[#ff7700]">●</span> Crypto
        </div>
      </div>
    </div>
  )
}
