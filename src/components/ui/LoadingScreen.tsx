'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

const LOADING_MESSAGES = [
  'Connexion sécurisée...',
  'Chargement de votre portefeuille...',
  'Synchronisation des données...',
  'Presque prêt...',
]

export default function LoadingScreen({ show }: { show: boolean }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!show) return
    const msgInterval = setInterval(() => {
      setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length)
    }, 700)
    const progInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progInterval); return 100 }
        return p + Math.random() * 18
      })
    }, 200)
    return () => {
      clearInterval(msgInterval)
      clearInterval(progInterval)
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#050B15' }}
        >
          {/* ── Animated background orbs ── */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(212,162,23,0.12) 0%, transparent 70%)',
                top: '10%', left: '30%', transform: 'translate(-50%,-50%)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
                bottom: '10%', right: '10%',
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <motion.div
              className="absolute w-[300px] h-[300px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
                top: '60%', left: '10%',
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
          </div>

          {/* ── Particle dots ── */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${(i * 17 + 5) % 100}%`,
                  top: `${(i * 23 + 10) % 100}%`,
                  width: i % 3 === 0 ? 3 : 2,
                  height: i % 3 === 0 ? 3 : 2,
                  backgroundColor: ['#D4A217', '#10B981', '#3B82F6', '#F59E0B'][i % 4],
                  boxShadow: `0 0 6px ${['#D4A217', '#10B981', '#3B82F6', '#F59E0B'][i % 4]}`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.9, 0.2],
                  scale: [1, 1.4, 1],
                }}
                transition={{
                  duration: 2 + (i % 4),
                  delay: (i * 0.15) % 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* ── Grid lines ── */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="lg" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(212,162,23,0.3)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#lg)" />
            </svg>
          </div>

          {/* ── Main content ── */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-8 max-w-sm w-full">

            {/* Logo with pulsing ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="relative"
            >
              {/* Outer spinning ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  width: 140, height: 140, margin: -10,
                  background: 'conic-gradient(from 0deg, transparent 0%, #D4A217 25%, transparent 50%)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              {/* Inner ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  width: 130, height: 130, margin: -5,
                  background: 'conic-gradient(from 180deg, transparent 0%, #10B981 20%, transparent 40%)',
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              {/* Logo image */}
              <motion.div
                className="relative w-[120px] h-[120px] rounded-3xl overflow-hidden border-2"
                style={{ borderColor: 'rgba(212,162,23,0.5)' }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(212,162,23,0.3)',
                    '0 0 50px rgba(212,162,23,0.7)',
                    '0 0 20px rgba(212,162,23,0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src="/icon-globalinvest.png"
                  alt="Global Investment Africa"
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Brand name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <h1 className="text-2xl font-black text-white tracking-tight">
                Global<span style={{ color: '#D4A217' }}>Invest</span>{' '}
                <span className="text-emerald-400">Africa</span>
              </h1>
              <p className="text-slate-500 text-xs mt-1 font-medium tracking-wider uppercase">
                Plateforme d'investissement N°1
              </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full space-y-3"
            >
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #10B981, #D4A217, #F59E0B)',
                    width: `${Math.min(progress, 100)}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Loading message */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="text-center text-xs font-medium"
                  style={{ color: '#D4A217' }}
                >
                  {LOADING_MESSAGES[msgIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* Security badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-2"
            >
              <motion.div
                className="w-2 h-2 bg-emerald-400 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-slate-600 text-[10px] font-medium tracking-widest uppercase">
                Connexion SSL Sécurisée • 256-bit
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
