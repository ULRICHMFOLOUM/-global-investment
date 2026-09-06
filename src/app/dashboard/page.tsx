
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Wallet, Gift, BarChart3, ArrowDownCircle, ArrowUpCircle, Zap, Crown } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

interface DashboardData {
  balance: number
  bonusBalance: number
  todayGains: number
  activeInvestments: number
  totalBonusReceived: number
  totalReturn: number
  vipLevel: number
  recentTransactions: any[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Solde Card Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 p-8 shadow-2xl shadow-blue-500/30 border border-white/10"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Liquidités disponibles</p>
                <p className="text-white/40 text-[10px] font-bold">SOLDE DU COMPTE PRINCIPAL</p>
              </div>
              <div className="bg-yellow-400/20 backdrop-blur-md border border-yellow-400/30 text-yellow-400 text-[10px] font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Crown className="w-3.5 h-3.5 fill-current" /> VIP {data?.vipLevel ?? 0}
              </div>
            </div>
            
            <div className="mb-8 group cursor-default">
              <span className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                {(data?.balance ?? 0).toLocaleString('fr-FR')}
              </span>
              <span className="text-blue-300 text-xl ml-3 font-black tracking-tighter opacity-80 uppercase">fcfa</span>
            </div>
            
            <div className="flex items-center gap-2 text-blue-100/80 text-xs font-bold bg-white/10 w-fit px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/5">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span>Récompenses d'affiliation :</span>
              <span className="text-white">{(data?.bonusBalance ?? 0).toLocaleString()} <span className="text-[8px]">XAF</span></span>
            </div>

            {/* Premium Buttons */}
            <div className="flex gap-4 mt-8">
              <Link href="/dashboard/banque?tab=depot" className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 rounded-[1.25rem] py-4 text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-white/10">
                <ArrowDownCircle className="w-5 h-5" />
                Dépôt
              </Link>
              <Link href="/dashboard/banque?tab=retrait" className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-[1.25rem] py-4 text-white text-sm font-black uppercase tracking-widest transition-all active:scale-95">
                <ArrowUpCircle className="w-5 h-5 opacity-70" />
                Retrait
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Tableau de bord stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Gains directs', value: `${(data?.todayGains ?? 0).toLocaleString()} XAF`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: 'Calculateurs actifs', value: data?.activeInvestments ?? 0, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'Total Dividendes', value: `${(data?.bonusBalance ?? 0).toLocaleString()} XAF`, icon: Gift, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
            { label: 'Performance', value: `${data?.totalReturn ?? 0}%`, icon: BarChart3, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className={`glass-card p-5 border-l-4 ${stat.border}`}
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4 shadow-inner`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`font-black text-lg tracking-tighter ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Accès rapide Investir Promo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/dashboard/invest" className="block relative group overflow-hidden rounded-[2rem] bg-slate-800/50 border border-white/5 p-6 hover:bg-slate-800 transition-all duration-500">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl shadow-blue-500/20">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-xl tracking-tight">Développer mon Portefeuille</p>
                  <p className="text-slate-500 text-xs font-medium">Découvrez les plans d'investissement haute performance</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-500">
                <ArrowUpCircle className="w-5 h-5 text-blue-400 rotate-45 group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Transactions récentes modernisé */}
        {data?.recentTransactions && data.recentTransactions.length > 0 && (
          <div className="pt-2">
            <h2 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 ml-2">Mouvements de fonds récents</h2>
            <div className="space-y-3">
              {data.recentTransactions.map((tx: any, i: number) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                      tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'
                    }`}>
                      {tx.type === 'DEPOSIT' 
                        ? <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
                        : <ArrowUpCircle className="w-5 h-5 text-rose-400" />
                      }
                    </div>
                    <div>
                      <p className="text-white text-sm font-black uppercase tracking-tight">
                        {tx.type === 'DEPOSIT' ? 'Validation Dépôt' : 'Traitement Retrait'}
                      </p>
                      <p className="text-slate-600 text-[10px] font-bold uppercase">{tx.operator} — {new Date(tx.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg tracking-tight ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount.toLocaleString()}
                    </p>
                    <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full ${
                      tx.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 
                      tx.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
