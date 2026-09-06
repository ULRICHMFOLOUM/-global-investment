'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Globe, Shield, Copy } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import BackButton from '@/components/ui/BackButton'

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => {
      setUser(d)
      setLoading(false)
    })
  }, [])

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const COUNTRIES: Record<string, { name: string, flag: string }> = {
    'CM': { name: 'Cameroun', flag: '🇨🇲' },
    'SN': { name: 'Sénégal', flag: '🇸🇳' },
    'CI': { name: "Côte d'Ivoire", flag: '🇨🇮' },
    'ML': { name: 'Mali', flag: '🇲🇱' },
    'BF': { name: 'Burkina Faso', flag: '🇧🇫' },
    'GN': { name: 'Guinée', flag: '🇬🇳' },
    'TG': { name: 'Togo', flag: '🇹🇬' },
    'BJ': { name: 'Bénin', flag: '🇧🇯' },
    'CD': { name: 'Congo RDC', flag: '🇨🇩' },
    'GA': { name: 'Gabon', flag: '🇬🇦' },
  }

  const getVipProgress = (level: number) => {
    const caps = [0, 50000, 200000, 1000000, 5000000];
    const current = level < caps.length ? caps[level] : caps[caps.length - 1];
    const next = level + 1 < caps.length ? caps[level + 1] : caps[caps.length - 1];
    const progress = level + 1 < caps.length ? (level / (caps.length - 1)) * 100 : 100;
    return { current, next, progress };
  };

  const { progress } = getVipProgress(user?.vipLevel || 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-between">
          <BackButton href="/dashboard" label="Retour" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Paramètres du compte</span>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Mon Profil</h1>
          <p className="text-slate-400">Gérez votre identité et vos privilèges</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Profil Premium */}
            <div className="glass-card p-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-50" />
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-blue-500/30 group-hover:scale-105 transition-transform duration-500">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">{user?.name}</h2>
                <p className="text-blue-400 font-medium text-sm mb-4">{user?.email}</p>
                
                <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                  <Shield className="w-3 h-3" /> Membre VIP Niveau {user?.vipLevel}
                </div>
              </div>
            </div>

            {/* VIP Progress Bar */}
            <div className="glass-card p-6 border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-500/5 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Progression VIP</h3>
                <span className="text-yellow-500 font-black text-xs">DIAMOND GOAL</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                 <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: `${progress}%` }} 
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-gradient-to-r from-yellow-600 to-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.3)]" 
                 />
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                <span>Niveau {user?.vipLevel}</span>
                <span>Niveau {user?.vipLevel + 1}</span>
              </div>
            </div>

            {/* Informations Détaillées */}
            <div className="glass-card divide-y divide-white/5 overflow-hidden">
               {[
                 { label: 'Identifiant Unique', value: user?.id?.substring(0, 12) + '...', icon: Shield },
                 { label: 'Téléphone', value: user?.phone, icon: Phone },
                 { label: 'Pays de Résidence', value: `${COUNTRIES[user?.country]?.flag} ${COUNTRIES[user?.country]?.name}`, icon: Globe },
                 { label: 'Date d\'inscription', value: new Date(user?.createdAt).toLocaleDateString(), icon: Copy },
               ].map((item, i) => (
                 <div key={item.label} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                   <div className="flex items-center gap-3">
                     <item.icon className="w-4 h-4 text-blue-400/60" />
                     <span className="text-slate-400 text-xs font-bold uppercase tracking-tight">{item.label}</span>
                   </div>
                   <span className="text-white font-semibold text-sm">{item.value}</span>
                 </div>
               ))}
            </div>

            {/* Parrainage Visual Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 p-8 shadow-2xl shadow-blue-900/40">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <h3 className="text-white font-black text-xl mb-2">Programme de Parrainage</h3>
                <p className="text-blue-100 text-xs mb-6 max-w-[240px] leading-relaxed opacity-80">
                  Invitez vos amis et recevez <span className="font-black text-white underline decoration-yellow-400 decoration-2 underline-offset-4">500 XAF</span> immédiatement pour chaque nouveau membre actif.
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between group">
                    <code className="text-white font-black font-mono text-xl tracking-widest">{user?.referralCode}</code>
                    <button
                      onClick={copyReferralCode}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {copied ? <span className="text-yellow-400 text-xs font-black">COPIÉ !</span> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
