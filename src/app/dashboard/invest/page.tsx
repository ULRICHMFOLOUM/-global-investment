'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pickaxe, Gem, Crown, Zap, TrendingUp, Lock, Info, CheckCircle2, DollarSign, Landmark, AlertTriangle, FileText, ShieldCheck, CreditCard, Wallet } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useSession, signOut } from 'next-auth/react'
import BackButton from '@/components/ui/BackButton'
import PlanSuccessModal, { PlanSuccessData } from '@/components/plans/PlanSuccessModal'
import SubscriptionInvoiceModal, { InvoiceData } from '@/components/invoice/SubscriptionInvoiceModal'
import toast from 'react-hot-toast'
import Link from 'next/link'

const PLAN_ICONS: Record<string, any> = {
  pickaxe: Pickaxe, gem: Gem, crown: Crown, zap: Zap,
}

const BANK_ICONS: Record<string, any> = {
  wallet: Wallet,
  'credit-card': CreditCard,
  landmark: Landmark,
  'shield-check': ShieldCheck,
}

export default function InvestPage() {
  const { data: session } = useSession()
  const [plans, setPlans] = useState<any[]>([])
  const [userVip, setUserVip] = useState(0)
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [investing, setInvesting] = useState<string | null>(null)
  const [activeInvestments, setActiveInvestments] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Modals
  const [successModalData, setSuccessModalData] = useState<PlanSuccessData | null>(null)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null)

  // Plans bancaires
  const [bankPlans, setBankPlans] = useState<any[]>([])
  const [bankAmounts, setBankAmounts] = useState<Record<string, string>>({})
  const [bankAmountErrors, setBankAmountErrors] = useState<Record<string, string>>({})
  const [bankInvesting, setBankInvesting] = useState<string | null>(null)

  const reloadUserData = async () => {
    try {
      const [u, ai] = await Promise.all([
        fetch('/api/user/me').then(r => r.json()),
        fetch('/api/user/investments').then(r => r.json()).catch(() => []),
      ])
      if (u?.balance !== undefined) setUserBalance(u.balance)
      if (u?.vipLevel !== undefined) setUserVip(u.vipLevel)
      if (Array.isArray(ai)) setActiveInvestments(ai)
    } catch (e) {
      console.error('Error reloading user data:', e)
    }
  }

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

        const [p, u, ai, bp] = await Promise.all([
          fetchWithCheck('/api/plans?category=NORMAL'),
          fetchWithCheck('/api/user/me'),
          fetchWithCheck('/api/user/investments').catch(() => []),
          fetch('/api/plans?category=BANK').then(r => r.ok ? r.json() : []).catch(() => []),
        ])

        if (mounted) {
          if (!u) throw new Error("Données utilisateur introuvables. Veuillez vous reconnecter.")
          setPlans(p)
          setUserVip(u.vipLevel)
          setUserBalance(u.balance)
          setActiveInvestments(ai || [])
          setBankPlans(bp || [])
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
      toast.error(`Solde insuffisant (${userBalance.toLocaleString()} XAF). Minimum requis : ${plan.minAmount.toLocaleString()} XAF. Veuillez recharger votre compte.`)
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

      const duration = plan.duration || 30
      const expectedTotal = plan.totalReturn && plan.totalReturn > 0
        ? plan.totalReturn
        : Math.round(plan.minAmount * (1 + (plan.dailyReturn * duration) / 100))
      const dailyGain = Math.round(expectedTotal / duration)

      // Affichage du modal vert animé de succès
      setSuccessModalData({
        planName: plan.name,
        amount: plan.minAmount,
        dailyGain,
        totalReturn: expectedTotal,
        duration,
        invoice: data.invoice,
      })

      // Déduire le solde local et recharger
      setUserBalance(prev => Math.max(0, prev - plan.minAmount))
      reloadUserData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setInvesting(null)
    }
  }

  // Souscription plan bancaire avec montant libre (min 2500 XAF)
  const MIN_BANK_INVEST = 2500
  const handleBankInvest = async (plan: any) => {
    const rawAmount = bankAmounts[plan.id] || ''
    const userAmount = parseFloat(rawAmount)
    if (!rawAmount || isNaN(userAmount)) {
      setBankAmountErrors(prev => ({ ...prev, [plan.id]: 'Veuillez saisir un montant.' }))
      return
    }
    if (userAmount < MIN_BANK_INVEST) {
      setBankAmountErrors(prev => ({ ...prev, [plan.id]: `Minimum ${MIN_BANK_INVEST.toLocaleString()} XAF requis.` }))
      return
    }
    if (plan.maxAmount && userAmount > plan.maxAmount) {
      setBankAmountErrors(prev => ({ ...prev, [plan.id]: `Maximum ${plan.maxAmount.toLocaleString()} XAF autorisé.` }))
      return
    }
    if (userBalance < userAmount) {
      toast.error(`Solde insuffisant (${userBalance.toLocaleString()} XAF disponible). Déposez ${(userAmount - userBalance).toLocaleString()} XAF supplémentaires.`)
      return
    }
    setBankAmountErrors(prev => ({ ...prev, [plan.id]: '' }))
    setBankInvesting(plan.id)
    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, amount: userAmount })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      const duration = plan.duration || 30
      const dailyReturnPct = plan.dailyReturn || 0
      const expectedTotal = Math.round(userAmount * (1 + (dailyReturnPct * duration) / 100))
      const dailyGain = Math.round(userAmount * dailyReturnPct / 100)

      setSuccessModalData({
        planName: plan.name,
        amount: userAmount,
        dailyGain,
        totalReturn: expectedTotal,
        duration,
        invoice: data.invoice,
      })
      setUserBalance(prev => Math.max(0, prev - userAmount))
      reloadUserData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setBankInvesting(null)
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

        {/* Hero Banner */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 px-4 relative overflow-hidden rounded-3xl bg-slate-800/50 border border-white/5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-emerald-500/5 to-transparent pointer-events-none" />
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">Investir dans les Plans</h1>
          <p className="text-slate-400 max-w-md mx-auto text-xs sm:text-sm">
            Faites fructifier votre capital. Tous les gains journaliers sont <strong className="text-emerald-400">automatiquement crédités</strong> sur votre solde chaque jour !
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-2xl">
            <span className="text-slate-400 text-xs font-bold">Solde disponible :</span>
            <span className="text-emerald-400 font-black text-sm">{userBalance.toLocaleString()} XAF</span>
            <Link href="/dashboard/banque?tab=depot" className="ml-2 text-[10px] font-black uppercase text-cyan-400 underline hover:text-white">
              + Déposer
            </Link>
          </div>
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
                onClick={async () => {
                  await signOut({ redirect: false });
                  window.location.href = '/register';
                }}
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
            {/* Section : Mes investissements actifs */}
            {activeInvestments.length > 0 && (
              <div id="active-investments">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Mes investissements actifs
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
                    {activeInvestments.length} Plan(s) en cours
                  </span>
                </div>

                <div className="grid gap-4">
                  {activeInvestments.map((inv, idx) => {
                    const dur = inv.plan?.duration || 30
                    const planTotal = inv.plan?.totalReturn && inv.plan?.totalReturn > 0
                      ? inv.plan.totalReturn
                      : Math.round(inv.amount * (1 + (inv.dailyReturn * dur) / 100))

                    return (
                      <motion.div 
                        key={inv.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-slate-900/40 to-transparent border-l-4 border-emerald-500 shadow-lg"
                      >
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white font-black text-lg">{inv.plan?.name || 'Plan Actif'}</p>
                              <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                Dividendes Automatiques
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs mt-1">
                              Investissement : <strong className="text-white font-bold">{inv.amount.toLocaleString()} XAF</strong> | Montant total prévu : <strong className="text-amber-400 font-bold">{planTotal.toLocaleString()} XAF</strong>
                            </p>
                            <p className="text-slate-500 text-[11px] mt-0.5">
                              Expire le {new Date(inv.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                          <div>
                            <p className="text-emerald-400 font-black text-xl">+{inv.totalReturn.toLocaleString()} XAF</p>
                            <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Gains déjà perçus</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Plans List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-blue-400" />
                  Catalogue des Plans Disponibles
                </h2>
                <span className="text-slate-400 text-xs">
                  {plans.length} options disponibles
                </span>
              </div>

              <div className="grid gap-6">
                {plans.map((plan, i) => {
                  const Icon = PLAN_ICONS[plan.icon] || Pickaxe
                  const isLocked = plan.vipRequired > userVip
                  const canAfford = userBalance >= plan.minAmount
                  const gradient = gradients[i % gradients.length]
                  const duration = plan.duration || 30
                  const expectedTotal = plan.totalReturn && plan.totalReturn > 0
                    ? plan.totalReturn
                    : Math.round(plan.minAmount * (1 + (plan.dailyReturn * duration) / 100))
                  const dailyGain = Math.round(expectedTotal / duration)

                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ y: -4, scale: 1.005 }}
                      className={`relative group rounded-3xl overflow-hidden glass-card transition-all duration-300 border border-white/10 ${
                        isLocked ? 'grayscale opacity-70' : 'hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/30'
                      }`}
                    >
                      {/* Badge flottant VIP */}
                      <div className="absolute top-4 right-4 z-20">
                         {isLocked ? (
                           <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-tighter">
                             <Lock className="w-3 h-3" /> VIP {plan.vipRequired} REQUIS
                           </div>
                         ) : (
                           <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-tighter">
                             DISPONIBLE
                           </div>
                         )}
                      </div>

                      <div className="flex flex-col md:flex-row">
                        {/* Côté Gauche - Icon & Nom du Plan */}
                        <div className={`w-full md:w-1/3 bg-gradient-to-br ${gradient} p-8 flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10 w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-3 backdrop-blur-xl shadow-inner border border-white/30 group-hover:scale-110 transition-transform">
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          
                          {/* Nom du plan bien en évidence */}
                          <h3 className="relative z-10 text-white font-black text-2xl tracking-tight uppercase drop-shadow-md">
                            {plan.name}
                          </h3>
                          <span className="relative z-10 mt-1 inline-block bg-black/20 text-white/90 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                            Plan de Minage
                          </span>
                        </div>

                        {/* Côté Droit - Détails, Montant Total et Action */}
                        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between bg-slate-900/60">
                          <div>
                            {/* Entête avec Nom du plan et statut */}
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                                  Nom du Plan
                                </span>
                                <h4 className="text-xl font-black text-white uppercase tracking-tight">
                                  {plan.name}
                                </h4>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cycle</span>
                                <span className="text-cyan-400 font-black text-sm">{duration} Jours</span>
                              </div>
                            </div>

                            {/* Mise en avant majeure : MONTANT TOTAL À RECEVOIR */}
                            <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 mb-6 relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <TrendingUp className="w-4 h-4 text-amber-400" /> Montant Total à Recevoir
                                  </p>
                                  <p className="text-amber-300 font-black text-2xl sm:text-3xl tracking-tight mt-0.5 drop-shadow">
                                    {expectedTotal.toLocaleString()} <span className="text-sm font-bold text-amber-400">XAF</span>
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-xl border border-emerald-500/30 block">
                                    +{dailyGain.toLocaleString()} XAF / jour
                                  </span>
                                  <span className="text-slate-400 text-[10px] mt-1 block">Crédité chaque jour</span>
                                </div>
                              </div>
                            </div>

                            {/* Grille des 4 métriques du plan */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                              <div className="space-y-0.5">
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Investissement</p>
                                <p className="text-white font-black text-base tracking-tight">
                                  {plan.minAmount.toLocaleString()} <span className="text-slate-500 text-xs">XAF</span>
                                </p>
                              </div>

                              <div className="space-y-0.5">
                                <p className="text-emerald-500/80 text-[10px] font-bold uppercase tracking-widest">Gain / Jour</p>
                                <p className="text-emerald-400 font-black text-base tracking-tight">
                                  +{dailyGain.toLocaleString()} <span className="text-emerald-500/50 text-xs">XAF</span>
                                </p>
                              </div>

                              <div className="space-y-0.5">
                                <p className="text-amber-400/80 text-[10px] font-bold uppercase tracking-widest">Montant Total</p>
                                <p className="text-amber-300 font-black text-base tracking-tight">
                                  {expectedTotal.toLocaleString()} <span className="text-amber-500/60 text-xs">XAF</span>
                                </p>
                              </div>

                              <div className="space-y-0.5">
                                <p className="text-blue-400/80 text-[10px] font-bold uppercase tracking-widest">Rentabilité Totale</p>
                                <p className="text-blue-400 font-black text-base tracking-tight">
                                  +{Math.round(plan.dailyReturn * duration)}%
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Bouton d'activation et message solde */}
                          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                            {!canAfford && !isLocked && (
                               <div className="w-full sm:flex-1 text-yellow-400 text-xs font-bold bg-yellow-400/10 border border-yellow-400/20 px-4 py-3 rounded-2xl flex items-center justify-between gap-2">
                                 <span>Il vous manque {(plan.minAmount - userBalance).toLocaleString()} XAF.</span>
                                 <Link
                                   href="/dashboard/banque?tab=depot"
                                   className="text-[10px] font-black uppercase text-white bg-yellow-500/30 hover:bg-yellow-500/50 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                                 >
                                   Recharger →
                                 </Link>
                               </div>
                            )}

                            <button
                              onClick={() => !isLocked && handleInvest(plan)}
                              disabled={isLocked || investing === plan.id}
                              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                                isLocked 
                                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-white/5'
                                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20'
                              } flex-1 sm:flex-initial`}
                            >
                              {investing === plan.id ? (
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                  Activation en cours...
                                </span>
                              ) : isLocked ? (
                                "Plan Verrouillé"
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

            {/* ===== SECTION PLANS BANCAIRES ===== */}
            {bankPlans.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-cyan-400" />
                    Plans d'Investissement Bancaire
                  </h2>
                  <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    Montant Libre &bull; Min 2 500 XAF
                  </span>
                </div>

                <p className="text-slate-400 text-xs">
                  Choisissez votre montant d'investissement (minimum <strong className="text-cyan-400">2 500 XAF</strong>). Vos gains journaliers sont crédités automatiquement sur votre solde chaque jour pendant la durée du plan.
                </p>

                <div className="grid gap-5">
                  {bankPlans.map((plan, i) => {
                    const Icon = BANK_ICONS[plan.icon] || Landmark
                    const isLocked = plan.vipRequired > userVip
                    const duration = plan.duration || 30
                    const dailyReturnPct = plan.dailyReturn || 0

                    const rawInput = bankAmounts[plan.id] ?? ''
                    const inputAmount = parseFloat(rawInput) || 0
                    const displayAmount = inputAmount > 0 ? inputAmount : plan.minAmount
                    const computedDailyGain = Math.round(displayAmount * dailyReturnPct / 100)
                    const computedTotal = Math.round(displayAmount * (1 + (dailyReturnPct * duration) / 100))
                    const canAffordBank = userBalance >= (inputAmount > 0 ? inputAmount : MIN_BANK_INVEST)

                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`relative group rounded-3xl overflow-hidden glass-card border border-white/10 transition-all duration-300 ${
                          isLocked ? 'grayscale opacity-70' : 'hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/30'
                        }`}
                      >
                        {/* Badge VIP */}
                        <div className="absolute top-4 right-4 z-20">
                          {isLocked ? (
                            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase">
                              <Lock className="w-3 h-3" /> VIP {plan.vipRequired}
                            </div>
                          ) : (
                            <div className="bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 text-cyan-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                              Plan Bancaire
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col md:flex-row">
                          {/* Côté gauche coloré */}
                          <div className="w-full md:w-1/3 bg-gradient-to-br from-cyan-600 via-teal-600 to-slate-800 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10 w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-3 backdrop-blur-xl shadow-inner border border-white/30 group-hover:scale-110 transition-transform">
                              <Icon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="relative z-10 text-white font-black text-2xl tracking-tight uppercase drop-shadow-md">{plan.name}</h3>
                            <span className="relative z-10 mt-1 inline-block bg-black/20 text-white/90 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                              Plan Bancaire Garanti
                            </span>
                            <div className="relative z-10 mt-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl px-3 py-2 text-center">
                              <p className="text-emerald-300 font-black text-lg">+{computedDailyGain.toLocaleString()} XAF</p>
                              <p className="text-emerald-400/70 text-[9px] font-black uppercase tracking-widest">/ jour</p>
                            </div>
                          </div>

                          {/* Côté droit */}
                          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between bg-slate-900/60">
                            <div>
                              {/* Header */}
                              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Plan Bancaire</span>
                                  <h4 className="text-xl font-black text-white uppercase tracking-tight">{plan.name}</h4>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cycle</span>
                                  <span className="text-cyan-400 font-black text-sm">{duration} Jours</span>
                                </div>
                              </div>

                              {/* Total retour mis en avant */}
                              <div className="bg-gradient-to-r from-amber-500/15 via-cyan-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 mb-5 relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                      <TrendingUp className="w-4 h-4" /> Total à Recevoir
                                    </p>
                                    <p className="text-amber-300 font-black text-2xl sm:text-3xl tracking-tight mt-0.5">
                                      {computedTotal.toLocaleString()} <span className="text-sm font-bold text-amber-400">XAF</span>
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="bg-cyan-500/20 text-cyan-300 text-xs font-black px-3 py-1 rounded-xl border border-cyan-500/30 block">
                                      +{plan.dailyReturn}%/jour
                                    </span>
                                    <span className="text-slate-400 text-[10px] mt-1 block">Crédité chaque jour</span>
                                  </div>
                                </div>
                              </div>

                              {/* Champ montant personnalisé */}
                              <div className="mb-4">
                                <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-2">
                                  Montant à investir <span className="text-cyan-400">(min. 2 500 XAF)</span>
                                  {plan.maxAmount && <span className="text-slate-500"> — max. {plan.maxAmount.toLocaleString()} XAF</span>}
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min={2500}
                                    max={plan.maxAmount || undefined}
                                    step={100}
                                    value={rawInput}
                                    onChange={e => {
                                      const val = e.target.value
                                      setBankAmounts(prev => ({ ...prev, [plan.id]: val }))
                                      if (parseFloat(val) >= 2500) {
                                        setBankAmountErrors(prev => ({ ...prev, [plan.id]: '' }))
                                      }
                                    }}
                                    placeholder={`ex: ${plan.minAmount.toLocaleString()}`}
                                    disabled={isLocked}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-bold text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all pr-16"
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-black">XAF</span>
                                </div>
                                {bankAmountErrors[plan.id] && (
                                  <p className="text-rose-400 text-[11px] font-bold mt-1.5 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />{bankAmountErrors[plan.id]}
                                  </p>
                                )}
                              </div>

                              {/* Métriques dynamiques */}
                              <div className="grid grid-cols-3 gap-3 mb-5 bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-center">
                                <div>
                                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-wider">Invest.</p>
                                  <p className="text-white font-bold text-sm mt-0.5">{displayAmount.toLocaleString()} <span className="text-[10px] text-slate-400">XAF</span></p>
                                </div>
                                <div className="bg-amber-500/10 rounded-xl border border-amber-500/20">
                                  <p className="text-amber-400 text-[9px] font-black uppercase tracking-wider">Total</p>
                                  <p className="text-amber-300 font-black text-sm mt-0.5">{computedTotal.toLocaleString()} <span className="text-[10px] text-amber-400">XAF</span></p>
                                </div>
                                <div>
                                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-wider">Durée</p>
                                  <p className="text-cyan-400 font-bold text-sm mt-0.5">{duration} j.</p>
                                </div>
                              </div>
                            </div>

                            {/* Solde insuffisant */}
                            {!canAffordBank && !isLocked && inputAmount > 0 && (
                              <div className="w-full text-yellow-400 text-xs font-bold bg-yellow-400/10 border border-yellow-400/20 px-4 py-3 rounded-2xl flex items-center justify-between gap-2 mb-3">
                                <span>Il vous manque {(inputAmount - userBalance).toLocaleString()} XAF.</span>
                                <Link href={`/dashboard/banque?tab=depot&amount=${inputAmount - userBalance}`} className="text-[10px] font-black uppercase text-white bg-yellow-500/30 hover:bg-yellow-500/50 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap">
                                  Recharger →
                                </Link>
                              </div>
                            )}

                            {/* Bouton souscrire */}
                            <button
                              onClick={() => !isLocked && handleBankInvest(plan)}
                              disabled={isLocked || bankInvesting === plan.id}
                              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 ${
                                isLocked
                                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-white/5'
                                  : 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-cyan-500/20'
                              }`}
                            >
                              <FileText className="w-4 h-4" />
                              {bankInvesting === plan.id ? (
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                  Génération facture...
                                </span>
                              ) : isLocked ? 'Plan Verrouillé' : 'Souscrire & Obtenir Facture'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Vert Animé de Confirmation de Souscription */}
        <PlanSuccessModal
          isOpen={!!successModalData}
          onClose={() => setSuccessModalData(null)}
          data={successModalData}
          onViewInvestments={() => {
            const el = document.getElementById('active-investments')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
          onOpenInvoice={(inv) => {
            setCurrentInvoice(inv)
            setInvoiceModalOpen(true)
          }}
        />

        {/* Modal Facture */}
        <SubscriptionInvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          invoice={currentInvoice}
        />
      </div>
    </DashboardLayout>
  )
}
