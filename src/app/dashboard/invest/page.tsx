'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pickaxe, Gem, Crown, Zap, TrendingUp, Lock, Info } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useSession, signOut } from 'next-auth/react'
import BackButton from '@/components/ui/BackButton'

const PLAN_ICONS: Record<string, any> = {
  pickaxe: Pickaxe, gem: Gem, crown: Crown, zap: Zap,
}

export default function InvestPage() {
  const { data: session } = useSession()
  const [plans, setPlans] = useState<any[]>([])
  const [userVip, setUserVip] = useState(0)
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [investing, setInvesting] = useState<string | null>(null)
  const [selected, setSelected] = useState<any | null>(null)

  const [activeInvestments, setActiveInvestments] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        const fetchWithCheck = async (url: string) => {
          const r = await fetch(url)
          if (!r.ok) {
            let detail = ''
            try {
              const data = await r.json()
              detail = data.details || data.error || ''
            } catch (e) {
              detail = await r.text()
            }
            console.error(`API Error ${url}:`, detail)
            throw new Error(`Erreur ${r.status} : ${detail || url}`)
          }
          return r.json()
        }

        const [p, u, ai] = await Promise.all([
          fetchWithCheck('/api/plans?category=NORMAL'),
          fetchWithCheck('/api/user/me'),
          fetchWithCheck('/api/user/investments').catch(() => []),
        ])

        if (mounted) {
          if (!u) throw new Error("Données utilisateur introuvables. Veuillez vous reconnecter.")
          setPlans(p)
          setUserVip(u.vipLevel)
          setUserBalance(u.balance)
          setActiveInvestments(ai || [])
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Initial load failed:', err)
        if (mounted) {
          setError(err.message || 'Une erreur inconnue est survenue')
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [])

  const handleInvest = async (plan: any) => {
    if (userBalance < plan.minAmount) {
      alert(`Solde insuffisant. Minimum requis : ${plan.minAmount.toLocaleString()} XAF`)
      return
    }
    setInvesting(plan.id)
    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, amount: plan.minAmount })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      alert('✅ Investissement réussi ! Vos gains commencent maintenant.')
      setUserBalance(prev => prev - plan.minAmount)
      // Refresh active investments
      fetch('/api/user/investments').then(r => r.json()).then(ai => setActiveInvestments(ai))
    } catch (err: any) {
      alert('❌ ' + err.message)
    } finally {
      setInvesting(null)
    }
  }

  const gradients = [
    'from-blue-600 via-blue-500 to-cyan-400',
    'from-purple-600 via-indigo-500 to-blue-400',
    'from-amber-500 via-orange-500 to-yellow-400',
    'from-emerald-600 via-teal-500 to-emerald-400',
    'from-rose-600 via-pink-500 to-rose-400',
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="flex items-center justify-between">
          <BackButton href="/dashboard" label="Retour" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Plans de minage</span>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 relative overflow-hidden rounded-3xl bg-slate-800/50 border border-white/5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Investir</h1>
          <p className="text-slate-400 max-w-md mx-auto">Faites fructifier votre capital avec nos plans de minage certifiés</p>
        </motion.div>

        {error ? (
          <div className="glass-card p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <Info className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-400 font-bold">{error}</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Réessayer
              </button>
              <button 
                onClick={() => signOut({ callbackUrl: '/register' })}
                className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/30 transition-colors"
              >
                Déconnexion & Créer un compte
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Active Investments Section */}
            {activeInvestments.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Mes investissements actifs
                </h2>
                <div className="grid gap-4">
                  {activeInvestments.map((inv, idx) => (
                    <motion.div 
                      key={inv.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card p-4 flex items-center justify-between bg-gradient-to-r from-emerald-500/5 to-transparent border-l-4 border-emerald-500"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold">{inv.plan.name}</p>
                          <p className="text-slate-500 text-xs">Prend fin le {new Date(inv.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-black">+{inv.totalReturn.toLocaleString()} XAF</p>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Gains accumulés</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Plans List */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-blue-400" />
                Plans disponibles
              </h2>
              <div className="grid gap-6">
                {plans.map((plan, i) => {
                  const Icon = PLAN_ICONS[plan.icon] || Pickaxe
                  const isLocked = plan.vipRequired > userVip
                  const canAfford = userBalance >= plan.minAmount
                  const gradient = gradients[i % gradients.length]

                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ y: -5, scale: 1.01 }}
                      className={`relative group rounded-3xl overflow-hidden glass-card transition-all duration-300 border-white/10 ${isLocked ? 'grayscale opacity-70' : 'hover:shadow-2xl hover:shadow-blue-500/10'}`}
                    >
                      {/* Badge flottant */}
                      <div className="absolute top-4 right-4 z-20">
                         {isLocked ? (
                           <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-tighter">
                             <Lock className="w-3 h-3" /> VIP {plan.vipRequired} REQUIS
                           </div>
                         ) : (
                           <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-tighter">
                             PROPRIÉTÉ ACTIVE
                           </div>
                         )}
                      </div>

                      <div className="flex flex-col md:flex-row">
                        {/* Côté Gauche - Icon & Name */}
                        <div className={`w-full md:w-1/3 bg-gradient-to-br ${gradient} p-8 flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10 w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 backdrop-blur-xl shadow-inner border border-white/30">
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="relative z-10 text-white font-black text-2xl tracking-tight uppercase">{plan.name}</h3>
                          <p className="relative z-10 text-white/70 text-xs font-bold mt-1">SÉRIE LIMITÉE</p>
                        </div>

                        {/* Côté Droit - Details */}
                        <div className="flex-1 p-8 flex flex-col justify-between">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="space-y-1">
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Investissement</p>
                              <p className="text-white font-black text-lg tracking-tight">{plan.minAmount.toLocaleString()} <span className="text-slate-500 text-xs">XAF</span></p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-emerald-500/70 text-[10px] font-bold uppercase tracking-widest">Profit / Jour</p>
                              <p className="text-emerald-400 font-black text-lg tracking-tight">+{ (plan.minAmount * plan.dailyReturn / 100).toLocaleString() } <span className="text-emerald-500/50 text-xs">XAF</span></p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-blue-400/70 text-[10px] font-bold uppercase tracking-widest">ROI Total</p>
                              <p className="text-blue-400 font-black text-lg tracking-tight">{ (plan.dailyReturn * plan.duration).toLocaleString() }%</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Cycle</p>
                              <p className="text-white font-black text-lg tracking-tight">{plan.duration} <span className="text-slate-500 text-xs">JOURS</span></p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {!canAfford && !isLocked && (
                               <div className="flex-1 text-yellow-400/80 text-[10px] font-bold bg-yellow-400/10 border border-yellow-400/20 px-4 py-3 rounded-2xl flex items-center gap-3">
                                 <Info className="w-4 h-4 flex-shrink-0" />
                                 <span>Il vous manque { (plan.minAmount - userBalance).toLocaleString() } XAF pour ce plan.</span>
                               </div>
                            )}
                            <button
                              onClick={() => !isLocked && handleInvest(plan)}
                              disabled={isLocked || investing === plan.id}
                              className={`px-8 py-4 rounded-2xl font-black text-sm tracking-widest group-hover:shadow-2xl transition-all active:scale-95 ${
                                isLocked 
                                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-white/5'
                                  : 'bg-white text-slate-900 hover:bg-slate-200'
                              } flex-1 md:flex-none uppercase`}
                            >
                              {investing === plan.id ? (
                                <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                              ) : isLocked ? (
                                "Verrouillé"
                              ) : (
                                "Activer le plan"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
