'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDownCircle, ArrowUpCircle, Info, CheckCircle, Clock, Landmark, ShieldCheck, Wallet, CreditCard, TrendingUp, Zap } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import BackButton from '@/components/ui/BackButton'

const OPERATORS = [
  { id: 'orange', name: 'Orange Money', logo: '🟠', color: 'border-orange-500/50 bg-orange-500/10', countries: ['CM','SN','CI','ML','BF','GN'] },
  { id: 'mtn', name: 'MTN Mobile Money', logo: '🟡', color: 'border-yellow-500/50 bg-yellow-500/10', countries: ['CM','GN','CD'] },
]

const BANK_ICONS: any = {
  'wallet': Wallet,
  'credit-card': CreditCard,
  'landmark': Landmark,
  'shield-check': ShieldCheck,
}

function BanqueContent() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'depot' | 'retrait' | 'plans'>(
    (searchParams.get('tab') as any) || 'depot'
  )
  const [form, setForm] = useState({
    amount: '', phone: '', operator: 'orange', transactionId: ''
  })
  const [loading, setLoading] = useState(false)
  const [bankPlans, setBankPlans] = useState<any[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [investing, setInvesting] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [balance, setBalance] = useState(0)
  const [userVip, setUserVip] = useState(0)
  const [globalError, setGlobalError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [])

  // Vérification retour paiement Fapshi
  useEffect(() => {
    const isSuccess = searchParams.get('success') === 'true'
    const txId = searchParams.get('txId')
    if (isSuccess) {
      setSuccess(true)
      if (txId) {
        fetch(`/api/deposit/status?txId=${txId}`)
          .then(r => r.json())
          .then(d => {
            if (d.status === 'SUCCESS') {
              fetch('/api/user/me').then(r => r.json()).then(u => setBalance(u.balance))
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
  }, [tab])

  const MIN_DEPOSIT = 100
  const MIN_WITHDRAW = 100
  const WITHDRAW_FEE = 0.03 // 3%

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const endpoint = tab === 'depot' ? '/api/deposit' : '/api/withdraw'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(form.amount),
          phone: form.phone,
          operator: form.operator,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      if (tab === 'depot' && data.payment_url) {
        window.location.href = data.payment_url
      } else {
        setSuccess(true)
        setBalance(prev => prev - parseFloat(form.amount) * (1 + (tab === 'retrait' ? WITHDRAW_FEE : 0)))
        setForm({ amount: '', phone: '', operator: 'orange', transactionId: '' })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInvestBank = async (plan: any) => {
    if (balance < plan.minAmount) {
      alert(`Solde insuffisant. Minimum requis: ${plan.minAmount.toLocaleString()} XAF`)
      return
    }
    setInvesting(plan.id)
    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, amount: plan.minAmount })
      })
      if (!res.ok) throw new Error('Erreur lors de la souscription')
      alert('✅ Souscription au plan bancaire réussie !')
      setBalance(prev => prev - plan.minAmount)
    } catch (err: any) {
      alert(err.message)
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
            {tab === 'depot' ? 'Dépôt Mobile Money' : tab === 'retrait' ? 'Retrait Mobile Money' : 'Épargne'}
          </span>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-black text-white mb-1">Banque & Dépôts</h1>
          <p className="text-slate-400 text-sm">Services financiers sécurisés par Fapshi</p>
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
                      : 'bg-blue-500 text-white shadow-xl shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'depot' ? 'Dépôt' : t === 'retrait' ? 'Retrait' : 'Épargne'}
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
            <button 
              onClick={() => signOut({ callbackUrl: '/register' })}
              className="w-full py-2 bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/30 transition-colors"
            >
              Session expirée ? Déconnexion & Créer un compte
            </button>
          </motion.div>
        )}

        {/* Solde actuel */}
        <div className="glass-card p-5 relative overflow-hidden bg-slate-800/40 border-white/5 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Wallet className="w-3 h-3 text-blue-400" /> Solde disponible
              </p>
              <p className="text-white font-black text-3xl tracking-tighter">
                {balance.toLocaleString()} <span className="text-blue-400 text-sm">XAF</span>
              </p>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
               <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        {tab === 'plans' ? (
          <div className="space-y-4">
            <h2 className="text-white font-black text-sm uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-400" /> Plans d'épargne bancaire
            </h2>
            
            {plansLoading ? (
              <div className="flex justify-center py-10"><Clock className="w-6 h-6 text-blue-500 animate-spin" /></div>
            ) : (
              <div className="grid gap-4">
                {bankPlans.map((plan, i) => {
                  const Icon = BANK_ICONS[plan.icon] || Landmark
                  const isLocked = plan.vipRequired > userVip
                  
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`glass-card p-5 border-white/5 relative overflow-hidden group ${isLocked ? 'opacity-60' : ''}`}
                    >
                      <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-${plan.color.split('#')[1]} to-transparent`} />
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-black text-lg tracking-tight">{plan.name}</h3>
                          <div className="flex items-center gap-2">
                             <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">
                               ROI {plan.dailyReturn}% / jour
                             </span>
                             {isLocked && (
                               <span className="bg-rose-500/20 text-rose-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-rose-500/20">
                                 VIP {plan.vipRequired} REQUIS
                               </span>
                             )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-5 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                        <div className="space-y-1">
                          <p className="text-slate-500 text-[8px] font-black uppercase tracking-wider">Durée Fixe</p>
                          <p className="text-white font-bold text-sm">{plan.duration} Jours</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-slate-500 text-[8px] font-black uppercase tracking-wider">Investissement</p>
                          <p className="text-emerald-400 font-bold text-sm">{plan.minAmount.toLocaleString()} XAF</p>
                        </div>
                      </div>

                      <button
                        onClick={() => !isLocked && handleInvestBank(plan)}
                        disabled={isLocked || investing === plan.id}
                        className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
                          isLocked 
                            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                            : 'bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-white/5'
                        }`}
                      >
                        {investing === plan.id ? 'TRAITEMENT...' : isLocked ? 'VERROUILLÉ' : 'SOUSCRIRE AU PLAN'}
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          /* Formulaire Dépôt/Retrait */
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6 relative overflow-hidden bg-slate-800/30 border-white/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
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
                Numéro de téléphone {tab === 'depot' ? '' : 'récepteur'}
              </label>
              <input
                type="tel" required placeholder="Numéro Mobile Money"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="input-field bg-white/5 border-white/10 rounded-2xl py-4 font-bold tracking-widest"
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
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
                      Paiement via la passerelle sécurisée <span className="text-white font-black underline decoration-emerald-500/50 underline-offset-4">Fapshi</span>. Redirection automatique et validation directe sur votre mobile (Orange / MTN).
                    </p>
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-4 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <p className="text-emerald-300 text-xs font-black uppercase tracking-tight">Opération réussie !</p>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-4 border-rose-500/30 bg-rose-500/10 flex items-center gap-3">
              <Info className="w-6 h-6 text-rose-500" />
              <p className="text-rose-300 text-xs font-bold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
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
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        </DashboardLayout>
      }
    >
      <BanqueContent />
    </Suspense>
  )
}
