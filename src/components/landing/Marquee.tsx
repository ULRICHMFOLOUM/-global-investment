'use client'

import React from 'react'

interface MarqueeProps {
  items: Array<{
    id?: string | number
    text: string
    badge?: string
    icon?: string
    color?: string
  }>
  speed?: number
  reverse?: boolean
  className?: string
}

export default function Marquee({
  items,
  speed = 25,
  reverse = false,
  className = '',
}: MarqueeProps) {
  return (
    <div className={`relative overflow-hidden w-full py-2.5 flex select-none ${className}`}>
      {/* Left and right fade gradients */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10"
        style={{
          background: 'linear-gradient(to right, var(--bg-primary), transparent)',
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10"
        style={{
          background: 'linear-gradient(to left, var(--bg-primary), transparent)',
        }}
      />

      {/* Infinite scrolling track */}
      <div
        className={`flex shrink-0 gap-4 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{
          display: 'flex',
          gap: '1rem',
          animationDuration: `${speed}s`,
        }}
      >
        {items.concat(items).map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-semibold backdrop-blur-md transition-all hover:scale-105"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            {item.icon && <span className="text-sm">{item.icon}</span>}
            <span className="whitespace-nowrap">{item.text}</span>
            {item.badge && (
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                style={{
                  background: item.color ? `${item.color}20` : 'rgba(59,130,246,0.2)',
                  color: item.color || '#60a5fa',
                  border: `1px solid ${item.color ? `${item.color}40` : 'rgba(59,130,246,0.3)'}`,
                }}
              >
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
