'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, TrendingUp, Calendar, Zap, Sparkles, X, FileText, ArrowRight } from 'lucide-react'
import Confetti from 'react-confetti'

export interface PlanSuccessData {
  planName: string
  amount: number
  dailyGain: number
  totalReturn: number
  duration: number
  invoice?: any
}

interface PlanSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  data: PlanSuccessData | null
  onViewInvestments?: () => void
  onOpenInvoice?: (invoice: any) => void
}

export default function PlanSuccessModal({
  isOpen,
  onClose,
  data,
  onViewInvestments,
  onOpenInvoice,
}: PlanSuccessModalProps) {
  const [windowDimension, setWindowDimension] = useState({ width: 0, height: 0 })
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowDimension({ width: window.innerWidth, height: window.innerHeight })
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    } else {
      setShowConfetti(false)
    }
  }, [isOpen])

  if (!isOpen || !data) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Confetti d'ambiance verte et dorée */}
        {showConfetti && windowDimension.width > 0 && (
          <div className="fixed inset-0 pointer-events-none z-60 overflow-hidden">
            <Confetti
              width={windowDimension.width}
              height={windowDimension.height}
              recycle={false}
              numberOfPieces={250}
              colors={['#10B981', '#34D399', '#059669', '#FBBF24', '#F59E0B', '#38BDF8']}
              gravity={0.25}
            />
          </div>
        )}

        {/* Backdrop sombre flouté */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-emerald-950/40 to-slate-950 rounded-3xl p-6 sm:p-8 border border-emerald-500/40 shadow-2xl shadow-emerald-500/20 z-10 overflow-hidden"
        >
          {/* Lueur verte en arrière-plan */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Bouton Fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icône animée de succès */}
          <div className="text-center relative z-10 mb-5">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 18 }}
              className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)] mb-3"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full border border-emerald-400/50"
              />
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>

            {/* Badge animé */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2"
            >
              <Sparkles className="w-3 h-3 text-emerald-300" /> SOUSCRIPTION VALIDÉE & ACTIVÉE
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-2xl sm:text-3xl font-black text-white tracking-tight"
            >
              Félicitations !
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-emerald-200/80 text-xs sm:text-sm mt-1 max-w-sm mx-auto"
            >
              Votre plan <span className="text-white font-bold underline decoration-emerald-400 underline-offset-4">{data.planName}</span> est désormais actif.
            </motion.p>
          </div>

          {/* Fiche récapitulative du plan */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-black/40 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-emerald-500/20 space-y-4 mb-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Plan Choisi</span>
              <span className="text-emerald-400 font-black text-sm uppercase tracking-wide px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                {data.planName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Investissement</p>
                <p className="text-white font-black text-base sm:text-lg mt-0.5">
                  {data.amount.toLocaleString()} <span className="text-[10px] text-slate-400">XAF</span>
                </p>
              </div>

              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
                <p className="text-emerald-400 text-[9px] font-black uppercase tracking-wider">Gain Quotidien</p>
                <p className="text-emerald-300 font-black text-base sm:text-lg mt-0.5">
                  +{data.dailyGain.toLocaleString()} <span className="text-[10px] text-emerald-400">XAF/j</span>
                </p>
              </div>

              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 col-span-2">
                <p className="text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Montant Total Garanti à Recevoir
                </p>
                <p className="text-amber-300 font-black text-xl sm:text-2xl mt-0.5 tracking-tight">
                  {data.totalReturn.toLocaleString()} <span className="text-xs text-amber-400 font-bold">XAF</span>
                </p>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  Sur une durée de <strong className="text-white">{data.duration} Jours</strong>
                </p>
              </div>
            </div>

            {/* Notification d'automatisation des gains */}
            <div className="flex items-start gap-2.5 bg-emerald-500/15 p-3 rounded-xl border border-emerald-500/30 text-left">
              <Zap className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <p className="text-emerald-200 text-xs leading-relaxed font-medium">
                <strong className="text-white">Crédit automatique :</strong> Vos gains journaliers de <span className="text-white font-bold">+{data.dailyGain.toLocaleString()} XAF</span> seront automatiquement versés chaque jour sur votre solde disponible.
              </p>
            </div>
          </motion.div>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2.5"
          >
            {data.invoice && onOpenInvoice && (
              <button
                onClick={() => {
                  onClose()
                  onOpenInvoice(data.invoice)
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                Télécharger ma facture officielle
              </button>
            )}

            <button
              onClick={() => {
                onClose()
                if (onViewInvestments) onViewInvestments()
              }}
              className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>Accéder à mes investissements</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
