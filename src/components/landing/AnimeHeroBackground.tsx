'use client'

import React, { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { useTheme } from '@/components/providers/ThemeProvider'

interface ParticleNode {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseAlpha: number
  alpha: number
  color: string
}

export default function AnimeHeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const iconsContainerRef = useRef<HTMLDivElement | null>(null)
  const { theme } = useTheme()

  // 1. Anime.js floating financial glyphs animation
  useEffect(() => {
    if (!iconsContainerRef.current) return

    const elements = iconsContainerRef.current.querySelectorAll('.anime-floating-badge')
    if (elements.length > 0) {
      animate(elements, {
        translateY: () => [0, -18, 0],
        rotate: () => [-4, 6, -4],
        scale: [1, 1.08, 1],
        duration: 5000,
        delay: stagger(400),
        loop: true,
        ease: 'inOutQuad',
      })
    }
  }, [])

  // 2. High-performance interactive constellation canvas with mouse wave
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Palette depending on theme
    const isLight = theme === 'light'
    const colors = isLight
      ? ['#3b82f6', '#10b981', '#6366f1', '#06b6d4']
      : ['#60a5fa', '#34d399', '#a78bfa', '#38bdf8', '#fbbf24']

    // Create particle nodes
    const nodeCount = Math.min(Math.floor((width * height) / 18000), 55)
    const nodes: ParticleNode[] = []

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.2 + 1.2,
        baseAlpha: Math.random() * 0.4 + 0.2,
        alpha: Math.random() * 0.4 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    // Mouse tracking
    let mouseX = -1000
    let mouseY = -1000
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }
    const handleMouseLeave = () => {
      mouseX = -1000
      mouseY = -1000
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    const maxDistance = 140

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Update & Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        node.x += node.vx
        node.y += node.vy

        // Bounce on boundaries
        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1

        // Mouse interaction: push away or glow
        const dxMouse = node.x - mouseX
        const dyMouse = node.y - mouseY
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)
        if (distMouse < 180) {
          const force = (180 - distMouse) / 180
          node.alpha = Math.min(node.baseAlpha + force * 0.6, 1)
        } else {
          node.alpha = node.baseAlpha
        }

        // Draw connections to nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j]
          const dx = node.x - other.x
          const dy = node.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * (isLight ? 0.15 : 0.22) * node.alpha
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = isLight
              ? `rgba(59, 130, 246, ${lineAlpha})`
              : `rgba(96, 165, 250, ${lineAlpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }

        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.globalAlpha = node.alpha
        ctx.shadowColor = node.color
        ctx.shadowBlur = isLight ? 4 : 10
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [theme])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dynamic interactive canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ opacity: theme === 'light' ? 0.65 : 0.85 }}
      />

      {/* Floating anime.js animated badges with financial badges */}
      <div ref={iconsContainerRef} className="absolute inset-0 select-none">
        <div
          className="anime-floating-badge absolute top-[18%] left-[8%] hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-lg"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'rgba(59,130,246,0.3)',
            color: 'var(--text-primary)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-black">XAF +15% / jour</span>
        </div>

        <div
          className="anime-floating-badge absolute top-[28%] right-[10%] hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-lg"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'rgba(234,179,8,0.3)',
            color: 'var(--text-primary)',
          }}
        >
          <span className="text-sm">⚡</span>
          <span className="text-xs font-black text-amber-400">Paiements Fapshi Instants</span>
        </div>

        <div
          className="anime-floating-badge absolute bottom-[25%] left-[12%] hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'rgba(16,185,129,0.3)',
            color: 'var(--text-primary)',
          }}
        >
          <span className="text-sm">🛡️</span>
          <span className="text-xs font-bold text-emerald-400">Fonds 100% Sécurisés</span>
        </div>

        <div
          className="anime-floating-badge absolute bottom-[35%] right-[8%] hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-lg"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'rgba(147,51,234,0.3)',
            color: 'var(--text-primary)',
          }}
        >
          <span className="text-sm">🤝</span>
          <span className="text-xs font-bold text-purple-400">Programme Partenaire 15%</span>
        </div>
      </div>
    </div>
  )
}
