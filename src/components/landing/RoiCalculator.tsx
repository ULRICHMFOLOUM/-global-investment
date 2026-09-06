'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function RoiCalculator() {
  const [amount, setAmount] = useState<number>(50000)

  // Calculate return tier based on amount
  let dailyRate = 0.06 // 6%
  let planName = 'Débutant Bronze'
  let planColor = 'text-blue-400'

  if (amount >= 500000) {
    dailyRate = 0.15 // 15%
    planName = 'Élite Diamant'
    planColor = 'text-cyan-400'
  } else if (amount >= 200000) {
    dailyRate = 0.12 // 12%
    planName = 'Expert Or'
    planColor = 'text-yellow-400'
  } else if (amount >= 50000) {
    dailyRate = 0.08 // 8%
    planName = 'Intermédiaire Argent'
    planColor = 'text-emerald-400'
  }

  const duration = 30
  const dailyGain = Math.round(amount * dailyRate)
  const totalReturn = Math.round(dailyGain * duration)
  const netProfit = totalReturn

  const presets = [10000, 25000, 50000, 100000, 250000, 500000]

  return (
    <div className="glass-card p-6 md:p-8 relative overflow-hidden border">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-2"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              <span>Simulateur Intelligent</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
              Calculez vos rendements en direct
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Estimez vos revenus passifs crédités chaque jour sur votre compte
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Plan attribué :</span>
            <span className={`text-xs font-black uppercase ${planColor}`}>{planName}</span>
          </div>
        </div>

        {/* Amount Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-baseline mb-3">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Montant à investir
            </label>
            <div className="text-3xl font-black text-blue-400 tracking-tight">
              {amount.toLocaleString('fr-FR')}{' '}
              <span className="text-sm font-bold opacity-80" style={{ color: 'var(--text-secondary)' }}>XAF</span>
            </div>
          </div>

          <input
            type="range"
            min={5000}
            max={1000000}
            step={5000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-blue-500 bg-slate-700/50"
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 mt-4">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  amount === p
                    ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/30'
                    : 'hover:border-blue-400/50'
                }`}
                style={
                  amount === p
                    ? undefined
                    : {
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-secondary)',
                      }
                }
              >
                {p.toLocaleString('fr-FR')} XAF
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Daily Gain */}
          <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Gain quotidien (+{(dailyRate * 100).toFixed(0)}%)
            </p>
            <p className="text-2xl font-black text-emerald-400">
              +{dailyGain.toLocaleString('fr-FR')}{' '}
              <span className="text-xs text-emerald-400/70">XAF/j</span>
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Crédité automatiquement toutes les 24h
            </p>
          </div>

          {/* 30 Days Total */}
          <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Total après 30 jours
            </p>
            <p className="text-2xl font-black text-blue-400">
              {totalReturn.toLocaleString('fr-FR')}{' '}
              <span className="text-xs text-blue-400/70">XAF</span>
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Retirable instantanément via Fapshi
            </p>
          </div>

          {/* Multiplier / ROI */}
          <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Rendement total
            </p>
            <p className="text-2xl font-black text-amber-400">
              +{(dailyRate * duration * 100).toFixed(0)}%
            </p>
            <p className="text-[11px] mt-1 flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 inline" /> Capital garanti
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>⚡ Paiement Mobile Money sécurisé via <strong>Fapshi</strong></span>
          </div>
          <Link
            href="/register"
            className="btn-primary w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2"
          >
            <span>Investir {amount.toLocaleString('fr-FR')} XAF</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
