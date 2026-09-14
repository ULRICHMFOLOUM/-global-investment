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
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import BackButton from '@/components/ui/BackButton'
import SubscriptionInvoiceModal, { InvoiceData } from '@/components/invoice/SubscriptionInvoiceModal'
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
    amount: '',
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
          setSuccessMessage("Dépôt enregistré avec succès ! En attente de validation par l'administrateur.")
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

  // Souscription au plan bancaire avec Facture en couleur
  const handleInvestBank = async (plan: any) => {
    setInvesting(plan.id)
    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.minAmount,
          phone: form.phone,
          operator: form.operator,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success('🎉 Souscription initiée ! Votre facture est disponible.')
      if (data.invoice) {
        setCurrentInvoice(data.invoice)
        setInvoiceModalOpen(true)
      }
      fetchUserData()
    } catch (err: any) {
      alert('❌ ' + err.message)
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

        {/* TAB 3: PLANS D'INVESTISSEMENT BANCAIRE */}
        {tab === 'plans' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                <Landmark className="w-4 h-4 text-cyan-400" /> Plans d'Investissement Bancaire
              </h2>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Cycle 30 Jours
              </span>
            </div>

            <p className="text-slate-400 text-xs px-1">
              Souscrivez à un plan, téléchargez votre facture officielle et transmettez-la dans le groupe pour validation. Vos gains journaliers seront versés sur votre solde chaque jour pendant 30 jours !
            </p>
            
            {plansLoading ? (
              <div className="flex justify-center py-10"><Clock className="w-6 h-6 text-cyan-500 animate-spin" /></div>
            ) : (
              <div className="grid gap-4">
                {bankPlans.map((plan, i) => {
                  const Icon = BANK_ICONS[plan.icon] || Landmark
                  const isLocked = plan.vipRequired > userVip
                  const duration = plan.duration || 30
                  const expectedTotal = plan.totalReturn && plan.totalReturn > 0
                    ? plan.totalReturn
                    : Math.round(plan.minAmount * (1 + (plan.dailyReturn * duration) / 100))
                  const dailyGain = Math.round(expectedTotal / duration)
                  
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`glass-card p-5 border-white/5 relative overflow-hidden group bg-slate-900/60 ${isLocked ? 'opacity-60' : ''}`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-black text-lg tracking-tight">{plan.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              +{dailyGain.toLocaleString()} XAF / jour
                            </span>
                            {isLocked && (
                              <span className="bg-rose-500/20 text-rose-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-rose-500/20">
                                VIP {plan.vipRequired} REQUIS
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Grille des montants : Montant, Total, Gain/jour */}
                      <div className="grid grid-cols-3 gap-2 mb-4 bg-white/[0.03] p-3.5 rounded-2xl border border-white/5 text-center">
                        <div>
                          <p className="text-slate-500 text-[8px] font-black uppercase tracking-wider">Investissement</p>
                          <p className="text-white font-bold text-xs sm:text-sm mt-0.5">
                            {plan.minAmount.toLocaleString()} <span className="text-[10px] text-slate-400">XAF</span>
                          </p>
                        </div>
                        <div className="border-x border-white/5">
                          <p className="text-slate-500 text-[8px] font-black uppercase tracking-wider">Total à Gagner</p>
                          <p className="text-yellow-400 font-bold text-xs sm:text-sm mt-0.5">
                            {expectedTotal.toLocaleString()} <span className="text-[10px] text-yellow-500">XAF</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[8px] font-black uppercase tracking-wider">Durée</p>
                          <p className="text-cyan-400 font-bold text-xs sm:text-sm mt-0.5">
                            {duration} Jours
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => !isLocked && handleInvestBank(plan)}
                        disabled={isLocked || investing === plan.id}
                        className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                          isLocked 
                            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black hover:opacity-95 shadow-cyan-500/20'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        {investing === plan.id ? 'GÉNÉRATION FACTURE...' : isLocked ? 'VERROUILLÉ' : 'SOUSCRIRE & OBTENIR FACTURE'}
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            )}
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
