'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar, DollarSign } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import BackButton from '@/components/ui/BackButton'

export default function GainsPage() {
  const [gains, setGains] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/gains').then(r => r.json()).then(d => {
      setGains(d)
      setLoading(false)
    })
  }, [])

  const totalGains = gains.reduce((sum, g) => sum + g.amount, 0)
  const todayGains = gains.filter(g => {
    const today = new Date()
    const gainDate = new Date(g.date)
    return today.toDateString() === gainDate.toDateString()
  }).reduce((sum, g) => sum + g.amount, 0)

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="flex items-center justify-between">
          <BackButton href="/dashboard" label="Retour" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rendements Quotidiens</span>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 relative overflow-hidden rounded-3xl bg-slate-800/50 border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Mes Gains</h1>
          <p className="text-slate-400">Suivez la performance de vos actifs en temps réel</p>
        </motion.div>

        {/* Stats Section Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-6 border-b-4 border-emerald-500 bg-gradient-to-t from-emerald-500/5 to-transparent relative overflow-hidden group">
            <DollarSign className="w-12 h-12 text-emerald-500/10 absolute -top-2 -right-2 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total des gains accumulés</p>
            <p className="text-white font-black text-3xl tracking-tighter">{totalGains.toLocaleString()} <span className="text-emerald-400 text-sm">XAF</span></p>
          </div>
          <div className="glass-card p-6 border-b-4 border-blue-500 bg-gradient-to-t from-blue-500/5 to-transparent relative overflow-hidden group">
            <TrendingUp className="w-12 h-12 text-blue-500/10 absolute -top-2 -right-2 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Gains générés aujourd'hui</p>
            <p className="text-white font-black text-3xl tracking-tighter">{todayGains.toLocaleString()} <span className="text-blue-400 text-sm">XAF</span></p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            Historique des dividendes
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : gains.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed border-white/10">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 font-bold">Aucun dividende détecté.</p>
              <p className="text-slate-600 text-xs mt-2 max-w-[200px] mx-auto">Activez un plan de minage pour commencer à percevoir vos gains quotidiens.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gains.map((gain, i) => (
                <motion.div
                  key={gain.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 flex items-center justify-between hover:bg-white/[0.02] transition-all border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-black text-sm uppercase tracking-tight">Dividende Quotidien</p>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(gain.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-black text-lg tracking-tighter">+{gain.amount.toLocaleString()} XAF</p>
                    <span className="text-emerald-500/30 text-[8px] font-black uppercase tracking-widest">Confirmé</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
