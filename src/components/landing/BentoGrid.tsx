'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, ShieldCheck, TrendingUp, Users, Smartphone, Globe, Lock, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function BentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
      {/* 1. Large Card: Fapshi Gateway & Instant Mobile Money */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="md:col-span-2 lg:col-span-2 glass-card p-6 md:p-8 relative overflow-hidden group border"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
        
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>PASSERELLE OFFICIELLE FAPSHI</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              Dépôts & Retraits Instantanés Mobile Money
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              Grâce à notre intégration directe avec <strong>Fapshi</strong>, rechargez votre compte en moins de 10 secondes via Orange Money ou MTN MoMo, sans intermédiaire.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            {[
              { name: 'Orange Money', flag: '🟠', sub: 'Instantané 24/7' },
              { name: 'MTN MoMo', flag: '🟡', sub: 'Instantané 24/7' },
            ].map((m) => (
              <div
                key={m.name}
                className="p-3 rounded-xl border text-center transition-all hover:scale-105"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <span className="text-xl mb-1 block">{m.flag}</span>
                <p className="text-xs font-black truncate" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 2. Card: Rendements Quotidiens */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="md:col-span-1 lg:col-span-2 glass-card p-6 md:p-8 relative overflow-hidden group border"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>ROBOT TRADING & MINING</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              Dividendes Automatisés Toutes les 24 Heures
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Vos capitaux génèrent des rendements stables crédités chaque jour à minuit. Aucun blocage abusif, retirez vos profits quand vous le souhaitez.
            </p>
          </div>

          <div className="mt-6 p-4 rounded-2xl border flex items-center justify-between"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Moyenne mensuelle</span>
              <p className="text-2xl font-black text-emerald-400">+180% à +450%</p>
            </div>
            <Link
              href="/dashboard/invest"
              className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 3. Card: Système de Parrainage Puissant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="md:col-span-2 lg:col-span-2 glass-card p-6 md:p-8 relative overflow-hidden group border"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-4">
              <Users className="w-3.5 h-3.5" />
              <span>AFFILIATION MULTI-NIVEAUX</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              Jusqu'à 15% de Commissions sur vos Filleuls
            </h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Partagez votre lien exclusif et gagnez un bonus immédiat à l'inscription de vos proches + des commissions sur chacun de leurs dépôts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {['Bronze 5%', 'Silver 7%', 'Gold 10%', 'Diamond 15%'].map((rank, i) => (
              <span
                key={rank}
                className="px-3 py-1 rounded-lg text-[11px] font-bold border"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: i === 3 ? '#00d4ff' : 'var(--text-secondary)',
                }}
              >
                {rank}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 4. Card: Sécurité et Conformité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="md:col-span-1 lg:col-span-2 glass-card p-6 md:p-8 relative overflow-hidden group border"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PROTECTION BANCAIRE</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              Chiffrement Militaire SSL & Séquestre 100% Sécurisé
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Données cryptées de bout en bout, surveillance antifraude IA et authentification forte pour chaque transaction.
            </p>
          </div>

          <div className="flex items-center gap-4 mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">🔒 SSL 256-Bit</span>
            <span className="flex items-center gap-1">🛡️ Anti-DDoS Cloudflare</span>
            <span className="flex items-center gap-1">⚡ Audit 2026</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
