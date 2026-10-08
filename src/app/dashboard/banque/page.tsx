'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Info,
  CheckCircle,
  Clock,
  Landmark,
  ShieldCheck,
  Wallet,
  CreditCard,
  TrendingUp,
  Zap,
  Users,
  AlertTriangle,
  FileText,
  Share2,
  ExternalLink,
  Calculator,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import BackButton from '@/components/ui/BackButton'
import SubscriptionInvoiceModal, { InvoiceData } from '@/components/invoice/SubscriptionInvoiceModal'
import PlanSuccessModal, { PlanSuccessData } from '@/components/plans/PlanSuccessModal'
import toast from 'react-hot-toast'

const OPERATORS = [
  { id: 'orange', name: 'Orange Money', logo: '🟠', color: 'border-orange-500/50 bg-orange-500/10', countries: ['CM','SN','CI','ML','BF','GN'] },
  { id: 'mtn', name: 'MTN Mobile Money', logo: '🟡', color: 'border-yellow-500/50 bg-yellow-500/10', countries: ['CM','GN','CD'] },
]

const BANK_ICONS: any = {
  wallet: Wallet,
  'credit-card': CreditCard,
  landmark: Landmark,
  'shield-check': ShieldCheck,
}

function BanqueContent() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'depot' | 'retrait' | 'plans'>(
    (searchParams.get('tab') as any) || 'depot'
  )
  const [form, setForm] = useState({
    amount: searchParams.get('amount') || '',
    phone: '',
    operator: 'orange',
    transactionId: '',
  })
  const [loading, setLoading] = useState(false)
  const [bankPlans, setBankPlans] = useState<any[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [investing, setInvesting] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')
  const [balance, setBalance] = useState(0)
  const [userVip, setUserVip] = useState(0)
  const [globalError, setGlobalError] = useState<string | null>(null)
  // Saisie unique et personnalisée du montant d'investissement bancaire
  const [investAmount, setInvestAmount] = useState<string>('')
  const [investAmountError, setInvestAmountError] = useState<string>('')
  const [validatedPlan, setValidatedPlan] = useState<{
    plan: any;
    amount: number;
    dailyGain: number;
    totalReturn: number;
    duration: number;
    dailyReturnPct: number;
  } | null>(null)

  // Referral withdrawal condition state
  const [withdrawEligibility, setWithdrawEligibility] = useState<{
    activeReferralsCount: number;
    requiredReferrals: number;
    canWithdraw: boolean;
  }>({
    activeReferralsCount: 0,
    requiredReferrals: 5,
    canWithdraw: false,
  })

  // Invoice Modal state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null)
  const [successPlanData, setSuccessPlanData] = useState<PlanSuccessData | null>(null)

  const fetchUserData = () => {
    fetch('/api/user/me')
      .then(async r => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}))
          throw new Error(data.details || data.error || 'Session expirée')
        }
        return r.json()
      })
      .then(d => {
        setBalance(d.balance)
        setUserVip(d.vipLevel)
      })
      .catch(err => setGlobalError(err.message))
  }

  const fetchWithdrawInfo = () => {
    fetch('/api/withdraw')
      .then(r => r.json())
      .then(data => {
        if (data.activeReferralsCount !== undefined) {
          setWithdrawEligibility({
            activeReferralsCount: data.activeReferralsCount,
            requiredReferrals: data.requiredReferrals || 5,
            canWithdraw: Boolean(data.canWithdraw),
          })
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchUserData()
    fetchWithdrawInfo()
  }, [])

  // Vérification retour paiement Fapshi
  useEffect(() => {
    const isSuccess = searchParams.get('success') === 'true'
    const txId = searchParams.get('txId')
    if (isSuccess) {
      setSuccess(true)
      setSuccessMessage("Paiement initié avec succès ! Votre compte sera mis à jour dès confirmation.")
      if (txId) {
        fetch(`/api/deposit/status?txId=${txId}`)
          .then(r => r.json())
          .then(d => {
            if (d.status === 'SUCCESS') {
              fetchUserData()
            }
          })
          .catch(() => {})
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (tab === 'plans') {
      setPlansLoading(true)
      setGlobalError(null)
      fetch('/api/plans?category=BANK')
        .then(async r => {
          if (!r.ok) {
            const data = await r.json().catch(() => ({}))
            throw new Error(data.details || data.error || 'Erreur chargement plans')
          }
          return r.json()
        })
        .then(data => {
          setBankPlans(data)
          setPlansLoading(false)
        })
        .catch(err => {
          setGlobalError(err.message)
          setPlansLoading(false)
        })
    }
    if (tab === 'retrait') {
      fetchWithdrawInfo()
    }
  }, [tab])

  const MIN_DEPOSIT = 100
  const MIN_WITHDRAW = 100
  const WITHDRAW_FEE = 0.03 // 3%

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    setSuccessMessage('')

    try {
      const endpoint = tab === 'depot' ? '/api/deposit' : '/api/withdraw'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(form.amount),
          phone: form.phone,
          operator: form.operator,
          transactionId: form.transactionId,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      if (tab === 'depot' && data.payment_url) {
        window.location.href = data.payment_url
      } else {
        setSuccess(true)
        if (tab === 'retrait') {
          setSuccessMessage(data.message || "Votre demande de retrait a été enregistrée avec succès. Elle est en attente de validation par l'administrateur.")
          setBalance(prev => prev - parseFloat(form.amount))
          fetchWithdrawInfo()
        } else {
          setSuccessMessage(data.message || `Dépôt de ${parseFloat(form.amount).toLocaleString()} XAF validé avec succès ! Votre solde est immédiatement disponible.`)
          fetchUserData()
        }
        setForm({ amount: '', phone: '', operator: 'orange', transactionId: '' })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Logique d'Investissement Bancaire Personnalisé (Min 2 500 XAF)
  const MIN_BANK_INVEST = 2500

  // Trouver le plan bancaire adapté au montant saisi
  const getMatchedBankPlan = (amt: number) => {
    if (!bankPlans || bankPlans.length === 0) {
      return {
        id: 'bank-standard',
        name: 'Épargne Standard Garanti',
        dailyReturn: 6.83,
        duration: 30,
        icon: 'shield-check',
        color: '#06b6d4',
      }
    }
    // Trouver le palier correspondant au montant saisi
    const match = bankPlans.find(p => amt >= p.minAmount && (!p.maxAmount || amt <= p.maxAmount))
      || bankPlans.find(p => !p.maxAmount || amt <= p.maxAmount)
      || bankPlans[0]
    return match
  }

  // Valider le montant saisi et générer le plan personnalisé
  const handleValidateAmount = (customVal?: number) => {
    const rawVal = customVal !== undefined ? customVal : parseFloat(investAmount)
    if (isNaN(rawVal) || rawVal <= 0) {
      setInvestAmountError('Veuillez entrer un montant valide.')
      setValidatedPlan(null)
      return
    }
    if (rawVal < MIN_BANK_INVEST) {
      setInvestAmountError(`Le montant minimum à investir est de ${MIN_BANK_INVEST.toLocaleString()} XAF.`)
      setValidatedPlan(null)
      return
    }
    setInvestAmountError('')

    const plan = getMatchedBankPlan(rawVal)
    const duration = plan.duration || 30
    const dailyReturnPct = plan.dailyReturn || 6.83
    const dailyGain = Math.round(rawVal * dailyReturnPct / 100)
    const totalReturn = Math.round(rawVal * (1 + (dailyReturnPct * duration) / 100))

    setValidatedPlan({
      plan,
      amount: rawVal,
      dailyGain,
      totalReturn,
      duration,
      dailyReturnPct,
    })
  }

  // Boutons rapides de sélection de montant
  const handleQuickAmount = (val: number | 'all') => {
    const targetAmt = val === 'all' ? Math.floor(balance) : val
    setInvestAmount(targetAmt > 0 ? targetAmt.toString() : '')
    if (targetAmt >= MIN_BANK_INVEST) {
      setInvestAmountError('')
      handleValidateAmount(targetAmt)
    } else {
      setInvestAmountError(`Le montant (${targetAmt.toLocaleString()} XAF) est inférieur au minimum requis de ${MIN_BANK_INVEST.toLocaleString()} XAF.`)
      setValidatedPlan(null)
    }
  }

  // Redirection immédiate vers l'onglet dépôt avec montant pré-rempli
  const handleGoToDeposit = (missingAmount: number) => {
    setTab('depot')
    setForm(prev => ({
      ...prev,
      amount: Math.max(missingAmount, MIN_DEPOSIT).toString(),
    }))
    toast.success(`Montant manquant (${missingAmount.toLocaleString()} XAF) pré-rempli pour votre dépôt.`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Confirmer l'investissement depuis le solde disponible
  const handleConfirmInvest = async () => {
    if (!validatedPlan) return
    const { amount, plan } = validatedPlan

    // Vérification du solde disponible
    if (balance < amount) {
      const missing = amount - balance
      toast.error(`Solde insuffisant. Il vous manque ${missing.toLocaleString()} XAF.`)
      handleGoToDeposit(missing)
      return
    }

    setInvesting(plan.id || 'custom')
    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          amount,
          phone: form.phone,
          operator: form.operator,
        })
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.insufficientBalance) {
          toast.error(data.message)
          handleGoToDeposit(data.needed)
          return
        }
        throw new Error(data.message)
      }

      // Déclencher le modal vert avec animation de souscription
      setSuccessPlanData({
        planName: plan.name,
        amount,
        dailyGain: validatedPlan.dailyGain,
        totalReturn: validatedPlan.totalReturn,
        duration: validatedPlan.duration,
        invoice: data.invoice,
      })

      fetchUserData()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la souscription')
    } finally {
      setInvesting(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-lg mx-auto pb-10">
        <div className="flex items-center justify-between">
          <BackButton href="/dashboard" label="Retour" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {tab === 'depot'
              ? 'Dépôt Mobile Money'
              : tab === 'retrait'
              ? 'Retrait Mobile Money'
              : 'Plans Bancaires'}
          </span>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-black text-white mb-1">Banque & Dépôts</h1>
          <p className="text-slate-400 text-sm">Services financiers & Investissements sécurisés</p>
        </motion.div>

        {/* Onglets */}
        <div className="glass-card p-1.5 flex rounded-2xl bg-white/5 border border-white/5">
          {(['depot', 'retrait', 'plans'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSuccess(false); setError('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${
                tab === t
                  ? t === 'depot'
                    ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20'
                    : t === 'retrait'
                      ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20'
                      : 'bg-cyan-500 text-black shadow-xl shadow-cyan-500/20 font-black'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'depot' ? 'Dépôt' : t === 'retrait' ? 'Retrait' : 'Investissements'}
            </button>
          ))}
        </div>

        {globalError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4 border-red-500/30 bg-red-500/10 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-red-500" />
                <p className="text-red-300 text-xs font-bold">{globalError}</p>
              </div>
              <button onClick={() => window.location.reload()} className="text-[10px] font-black uppercase tracking-widest text-white underline underline-offset-4">Réessayer</button>
            </div>
          </motion.div>
        )}

        {/* Solde actuel */}
        <div className="glass-card p-5 relative overflow-hidden bg-slate-800/40 border-white/5 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Wallet className="w-3 h-3 text-cyan-400" /> Solde disponible
              </p>
              <p className="text-white font-black text-3xl tracking-tighter">
                {balance.toLocaleString()} <span className="text-cyan-400 text-sm">XAF</span>
              </p>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* TAB 3: INVESTISSEMENTS BANCAIRES À MONTANT LIBRE */}
        {tab === 'plans' ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                <Landmark className="w-4 h-4 text-cyan-400" /> Investissement Bancaire Personnalisé
              </h2>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                Min. 2 500 XAF
              </span>
            </div>

            {/* Formulaire de saisie du montant (Pas de plans affichés par défaut) */}
            <div className="glass-card p-6 border-white/10 relative overflow-hidden bg-slate-900/70">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div>
                  <h3 className="text-white font-black text-base tracking-tight mb-1">
                    Entrez votre montant à investir
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Définissez librement votre investissement (minimum <strong className="text-cyan-400">2 500 XAF</strong>). Dès validation, votre plan personnalisé avec le calcul exact de vos gains quotidiens et totaux s'affichera.
                  </p>
                </div>

                {/* Rappel solde disponible */}
                <div className="flex items-center justify-between bg-white/[0.04] p-3 rounded-2xl border border-white/5">
                  <span className="text-slate-400 text-xs font-bold flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-cyan-400" /> Solde disponible :
                  </span>
                  <span className="text-white font-black text-sm">
                    {balance.toLocaleString()} <span className="text-cyan-400 text-xs">XAF</span>
                  </span>
                </div>

                {/* Champ de saisie du montant */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1">
                    Montant à investir <span className="text-cyan-400">(XAF)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={2500}
                      step={100}
                      value={investAmount}
                      onChange={e => {
                        const val = e.target.value
                        setInvestAmount(val)
                        if (parseFloat(val) >= 2500) {
                          setInvestAmountError('')
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleValidateAmount()
                        }
                      }}
                      placeholder="Ex: 10 000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white font-black text-lg placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 text-sm font-black">XAF</span>
                  </div>

                  {investAmountError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-rose-400 text-xs font-bold mt-2 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" /> {investAmountError}
                    </motion.p>
                  )}
                </div>

                {/* Montants rapides */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Montants rapides :</span>
                  <div className="flex flex-wrap gap-2">
                    {[2500, 5000, 10000, 25000, 50000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickAmount(amt)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                          investAmount === amt.toString()
                            ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/20 font-black'
                            : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {amt.toLocaleString()} XAF
                      </button>
                    ))}
                    {balance >= 2500 && (
                      <button
                        type="button"
                        onClick={() => handleQuickAmount('all')}
                        className="px-3 py-2 rounded-xl text-xs font-black transition-all border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      >
                        ⚡ Tout mon solde ({balance.toLocaleString()} XAF)
                      </button>
                    )}
                  </div>
                </div>

                {/* Bouton pour valider et faire apparaître le plan */}
                <button
                  type="button"
                  onClick={() => handleValidateAmount()}
                  className="w-full mt-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-cyan-500 to-teal-400 text-black hover:opacity-95 shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  Valider et afficher mon plan
                </button>
              </div>
            </div>

            {/* PLAN D'INVESTISSEMENT (APPARAÎT UNIQUEMENT SI L'UTILISATEUR VALIDE UN MONTANT) */}
            <AnimatePresence>
              {validatedPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card p-6 border-cyan-500/30 relative overflow-hidden bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 shadow-2xl shadow-cyan-500/10"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 space-y-5">
                    {/* Header du plan généré */}
                    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                          <Landmark className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                            Plan Bancaire Garanti
                          </span>
                          <h3 className="text-white font-black text-xl tracking-tight uppercase mt-1">
                            {validatedPlan.plan.name}
                          </h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 text-xs font-black bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl block">
                          +{validatedPlan.dailyReturnPct}% / jour
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 block">Cycle {validatedPlan.duration} jours</span>
                      </div>
                    </div>

                    {/* Grille des 4 métriques du plan */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white/[0.03] p-3.5 rounded-2xl border border-white/5 text-center">
                      <div className="p-2">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Investissement</p>
                        <p className="text-white font-black text-base mt-1">
                          {validatedPlan.amount.toLocaleString()} <span className="text-[10px] text-cyan-400">XAF</span>
                        </p>
                      </div>
                      <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <p className="text-emerald-400 text-[9px] font-black uppercase tracking-wider">Gain / Jour</p>
                        <p className="text-emerald-300 font-black text-base mt-1">
                          +{validatedPlan.dailyGain.toLocaleString()} <span className="text-[10px]">XAF</span>
                        </p>
                      </div>
                      <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <p className="text-amber-400 text-[9px] font-black uppercase tracking-wider">Total Retour</p>
                        <p className="text-amber-300 font-black text-base mt-1">
                          {validatedPlan.totalReturn.toLocaleString()} <span className="text-[10px]">XAF</span>
                        </p>
                      </div>
                      <div className="p-2">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Bénéfice Net</p>
                        <p className="text-cyan-400 font-black text-base mt-1">
                          +{(validatedPlan.totalReturn - validatedPlan.amount).toLocaleString()} <span className="text-[10px]">XAF</span>
                        </p>
                      </div>
                    </div>

                    {/* Zone de vérification du solde et action */}
                    {balance < validatedPlan.amount ? (
                      /* CAS 1 : SOLDE INSUFFISANT -> Inviter à faire un dépôt */
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-amber-300 text-xs font-black uppercase tracking-wider">Solde Insuffisant</p>
                            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                              Votre solde actuel est de <strong className="text-white">{balance.toLocaleString()} XAF</strong>. Il vous manque <strong className="text-amber-300">{(validatedPlan.amount - balance).toLocaleString()} XAF</strong> pour activer ce plan.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleGoToDeposit(validatedPlan.amount - balance)}
                          className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-95 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <ArrowDownCircle className="w-4 h-4" />
                          Faire un dépôt de {(validatedPlan.amount - balance).toLocaleString()} XAF
                        </button>
                      </div>
                    ) : (
                      /* CAS 2 : SOLDE SUFFISANT -> Confirmer et investir */
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-emerald-300 text-xs font-black uppercase tracking-wider">Solde Disponible Suffisant</p>
                            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                              Votre solde (<strong className="text-white">{balance.toLocaleString()} XAF</strong>) couvre cet investissement. Le montant sera déduit de votre compte et commencera à générer des gains immédiatement.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleConfirmInvest}
                          disabled={investing !== null}
                          className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-95 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <FileText className="w-4 h-4" />
                          {investing ? 'Activation en cours...' : `Confirmer et Investir ${validatedPlan.amount.toLocaleString()} XAF`}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setValidatedPlan(null)
                          setInvestAmount('')
                        }}
                        className="text-[11px] text-slate-400 hover:text-white underline underline-offset-4 font-bold"
                      >
                        Modifier le montant
                      </button>
                      <span className="text-[10px] text-slate-500 font-medium">Gains crédités quotidiennement</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Formulaire Dépôt / Retrait */
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6 relative overflow-hidden bg-slate-800/30 border-white/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            {/* Condition de parrainage pour retrait */}
            {tab === 'retrait' && (
              <div className={`p-4 rounded-2xl border ${
                withdrawEligibility.canWithdraw
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  {withdrawEligibility.canWithdraw ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  )}
                  <div className="text-xs space-y-1">
                    <p className={`font-bold ${withdrawEligibility.canWithdraw ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {withdrawEligibility.canWithdraw
                        ? '✅ Condition de retrait remplie'
                        : '⚠️ Condition de retrait requise'}
                    </p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Vous devez avoir parrainé au moins <strong className="text-white">5 personnes ayant souscrit à un plan</strong> pour débloquer les retraits.
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-cyan-400 font-black">
                        Progression : {withdrawEligibility.activeReferralsCount} / {withdrawEligibility.requiredReferrals} filleuls avec plan
                      </span>
                      {!withdrawEligibility.canWithdraw && (
                        <Link
                          href="/dashboard/partenariat"
                          className="text-[10px] font-bold text-amber-400 underline underline-offset-4 hover:text-white"
                        >
                          Inviter des amis →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Opérateur */}
            <div>
              <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-1">Opérateur Mobile Money</label>
              <div className="grid grid-cols-2 gap-3">
                {OPERATORS.map(op => (
                  <button
                    key={op.id} type="button"
                    onClick={() => setForm({...form, operator: op.id})}
                    className={`border-2 rounded-2xl p-4 flex items-center gap-3 transition-all ${
                      form.operator === op.id 
                        ? op.color + ' border-opacity-100 ring-2 ring-white/10' 
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-2xl filter drop-shadow-md">{op.logo}</span>
                    <span className="text-white text-xs font-black uppercase tracking-tighter text-left leading-tight">{op.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Numéro téléphone */}
            <div>
              <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">
                Numéro de téléphone {tab === 'depot' ? 'émetteur' : 'récepteur'}
              </label>
              <input
                type="tel" required placeholder="Ex: 690000000 ou 670000000"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="input-field bg-white/5 border-white/10 rounded-2xl py-4 font-bold tracking-widest text-white"
              />
            </div>

            {/* Montant */}
            <div>
              <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">Montant (XAF)</label>
              <input
                type="number" required
                min={tab === 'depot' ? MIN_DEPOSIT : MIN_WITHDRAW}
                placeholder={`Minimum : ${tab === 'depot' ? MIN_DEPOSIT : MIN_WITHDRAW} XAF`}
                value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                className="input-field bg-white/5 border-white/10 rounded-2xl py-4 text-xl font-black text-emerald-400 tracking-tighter"
              />
              
              <div className="mt-4 bg-white/5 rounded-2xl p-4 border border-white/5">
                {tab === 'depot' ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
                        Paiement via la passerelle sécurisée <span className="text-white font-black underline decoration-emerald-500/50 underline-offset-4">Fapshi</span> ou validation directe par l'administrateur. Votre solde sera mis à jour dès confirmation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-rose-400" />
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider">Frais de réseau (3%)</span>
                    </div>
                    <span className="text-white font-black text-sm">
                      {form.amount ? Math.floor(parseFloat(form.amount) * WITHDRAW_FEE).toLocaleString() : '0'} XAF
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Référence / ID de transaction facultative pour dépôt direct */}
            {tab === 'depot' && (
              <div>
                <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1">
                  ID de transaction (Facultatif si virement manuel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: TXN123456789"
                  value={form.transactionId}
                  onChange={e => setForm({...form, transactionId: e.target.value})}
                  className="input-field bg-white/5 border-white/10 rounded-2xl py-3 font-mono text-xs text-slate-300"
                />
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl ${
                tab === 'depot'
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-400'
                  : 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-400'
              }`}
            >
              {loading ? (
                <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : tab === 'depot' ? 'Valider le dépôt' : 'Confirmer le retrait'}
            </button>
          </form>
        )}

        {/* Feedback Messages */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-4 border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-300 text-xs font-black uppercase tracking-tight">Opération Enregistrée</p>
                <p className="text-emerald-200 text-xs mt-1">{successMessage || "Votre demande a bien été transmise."}</p>
              </div>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-4 border-rose-500/30 bg-rose-500/10 flex items-start gap-3">
              <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-rose-300 text-xs font-bold">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Vert Animé de Confirmation de Souscription */}
        <PlanSuccessModal
          isOpen={!!successPlanData}
          onClose={() => setSuccessPlanData(null)}
          data={successPlanData}
          onViewInvestments={() => {
            setTab('plans')
          }}
          onOpenInvoice={(inv) => {
            setCurrentInvoice(inv)
            setInvoiceModalOpen(true)
          }}
        />

        {/* Modal Facture en Couleur */}
        <SubscriptionInvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          invoice={currentInvoice}
        />
      </div>
    </DashboardLayout>
  )
}

export default function BanquePage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        </DashboardLayout>
      }
    >
      <BanqueContent />
    </Suspense>
  )
}
