'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Smartphone, Monitor, X, CheckCircle } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallButtonProps {
  variant?: 'hero' | 'navbar' | 'dashboard' | 'banner'
  className?: string
}

export default function PWAInstallButton({ variant = 'hero', className = '' }: InstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Detect mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))

    // Listen for PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
      // Show banner after 3 seconds if not dismissed
      setTimeout(() => setShowBanner(true), 3000)
    }

    // Listen for app installed
    const handleInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setShowBanner(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setIsInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setShowBanner(false)
      }
    } catch (err) {
      console.error('Install error:', err)
    } finally {
      setIsInstalling(false)
      setDeferredPrompt(null)
      setIsInstallable(false)
    }
  }

  // Don't render if already installed
  if (isInstalled) return null

  // ── BANNER variant (fixed bottom) ──
  if (variant === 'banner') {
    return (
      <AnimatePresence>
        {showBanner && isInstallable && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:w-96"
          >
            <div className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-4">
              {/* Gold shimmer bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
              
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-yellow-500/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon-192.png" alt="GlobalInvest" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm leading-tight">Installer l'application</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-tight">
                    Accès rapide depuis votre {isMobile ? 'téléphone' : 'bureau'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-yellow-500/20"
                  >
                    {isInstalling ? (
                      <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    {isInstalling ? 'Inst...' : 'Installer'}
                  </button>
                  <button
                    onClick={() => setShowBanner(false)}
                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // ── DASHBOARD variant (compact pill) ──
  if (variant === 'dashboard') {
    if (!isInstallable) return null
    return (
      <motion.button
        onClick={handleInstall}
        disabled={isInstalling}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all ${className}`}
      >
        {isInstalling ? (
          <span className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        ) : (
          <Download className="w-4 h-4 text-yellow-400" />
        )}
        <span className="text-yellow-300 text-xs font-bold">
          {isInstalling ? 'Installation...' : 'Installer l\'app'}
        </span>
      </motion.button>
    )
  }

  // ── NAVBAR variant (small button) ──
  if (variant === 'navbar') {
    if (!isInstallable) return null
    return (
      <motion.button
        onClick={handleInstall}
        disabled={isInstalling}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 transition-all ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        Installer
      </motion.button>
    )
  }

  // ── HERO variant (large prominent button) ──
  if (!isInstallable) return null
  
  return (
    <motion.button
      onClick={handleInstall}
      disabled={isInstalling}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm overflow-hidden group ${className}`}
      style={{
        background: 'linear-gradient(135deg, #D4A217 0%, #F5C518 50%, #B8860B 100%)',
        boxShadow: '0 8px 32px rgba(212, 162, 23, 0.4), 0 0 0 1px rgba(212,162,23,0.3)',
        color: '#050B15',
      }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
      />
      
      {isInstalling ? (
        <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
      ) : isMobile ? (
        <Smartphone className="w-5 h-5" />
      ) : (
        <Monitor className="w-5 h-5" />
      )}
      
      <span className="relative z-10">
        {isInstalling ? 'Installation en cours...' : `📲 Installer l'application`}
      </span>
      
      {!isInstalling && (
        <span className="relative z-10 text-[10px] font-bold opacity-70 bg-black/20 px-1.5 py-0.5 rounded-full">
          GRATUIT
        </span>
      )}
    </motion.button>
  )
}
