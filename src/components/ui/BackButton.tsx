'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export default function BackButton({
  href = '/dashboard',
  label = 'Retour',
  className = '',
}: BackButtonProps) {
  const router = useRouter()

  const content = (
    <motion.div
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm cursor-pointer ${className}`}
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-secondary)',
      }}
    >
      <ArrowLeft className="w-4 h-4 text-blue-400" />
      <span>{label}</span>
    </motion.div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return (
    <button type="button" onClick={() => router.back()}>
      {content}
    </button>
  )
}
