'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[SW] Registered:', reg.scope)
          })
          .catch((err) => {
            console.warn('[SW] Registration failed:', err)
          })
      })
    }
  }, [])

  return null
}
