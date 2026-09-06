"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackButton from "@/components/ui/BackButton";
import {
  Users, Copy, Check, Gift, Star, Trophy,
  TrendingUp, Zap, Crown, Diamond, Share2, ChevronRight,
  MessageCircle, Send,
} from "lucide-react";
import toast from "react-hot-toast";

const RANKS = [
  { name: "Bronze", min: 0, max: 2, color: "#cd7f32", bg: "from-amber-700/30 to-amber-600/10", icon: "🥉", bonus: "2%" },
  { name: "Silver", min: 3, max: 9, color: "#c0c0c0", bg: "from-slate-400/30 to-slate-300/10", icon: "🥈", bonus: "3%" },
  { name: "Gold", min: 10, max: 24, color: "#ffd700", bg: "from-yellow-400/30 to-yellow-300/10", icon: "🥇", bonus: "5%" },
  { name: "Diamond", min: 25, max: Infinity, color: "#00d4ff", bg: "from-cyan-400/30 to-cyan-300/10", icon: "💎", bonus: "8%" },
];

const MOCK_REFERRALS = [
  { name: "Jean M.", joined: "il y a 2 jours", amount: 12000, active: true, avatar: "JM" },
  { name: "Fatou S.", joined: "il y a 5 jours", amount: 25000, active: true, avatar: "FS" },
  { name: "Kofi A.", joined: "il y a 1 semaine", amount: 8000, active: false, avatar: "KA" },
  { name: "Amina D.", joined: "il y a 2 semaines", amount: 50000, active: true, avatar: "AD" },
];

export default function PartenariatPage() {
  const [copied, setCopied] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [totalEarned, setTotalEarned] = useState(0);
  const [referralCount, setReferralCount] = useState(0);

  const [referralsList, setReferralsList] = useState<any[]>(MOCK_REFERRALS);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        setUserData(d);
        if (d.referralCount !== undefined) setReferralCount(d.referralCount);
        if (d.bonusBalance !== undefined) setTotalEarned(d.bonusBalance);
      })
      .catch(() => {});

    fetch("/api/user/referrals")
      .then((r) => r.json())
      .then((data) => {
        if (data.referrals && data.referrals.length > 0) {
          setReferralsList(data.referrals);
          setReferralCount(data.totalCount);
        }
      })
      .catch(() => {});
  }, []);

  const referralCode = userData?.referralCode || "GLOB" + (userData?.id?.slice(-4)?.toUpperCase() || "1234");
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${referralCode}`;

  const currentRank = RANKS.find(
    (r) => referralCount >= r.min && referralCount <= r.max
  ) || RANKS[0];
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1];

  const progressToNext = nextRank
    ? ((referralCount - currentRank.min) / (nextRank.min - currentRank.min)) * 100
    : 100;

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copié ! 🎉`);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Rejoins-moi sur Global Invest Africa et fais fructifier ton argent ! Utilise mon code ${referralCode} : ${referralLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(`Rejoins Global Invest Africa ! Code: ${referralCode}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <BackButton href="/dashboard" label="Retour" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Affiliation & Parrainage</span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            🤝 Programme Partenariat
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Parrainez des amis et gagnez des commissions sur leurs investissements
          </p>
        </motion.div>

        {/* Rang actuel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`glass-card p-5 bg-gradient-to-br ${currentRank.bg} border`}
          style={{ borderColor: currentRank.color + "40" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>VOTRE RANG</p>
              <div className="flex items-center gap-2 mt-1">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl"
                >
                  {currentRank.icon}
                </motion.span>
                <div>
                  <p className="text-xl font-bold" style={{ color: currentRank.color }}>
                    {currentRank.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    +{currentRank.bonus} commission
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Filleuls</p>
              <motion.p
                key={referralCount}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-3xl font-black"
                style={{ color: currentRank.color }}
              >
                {referralCount}
              </motion.p>
            </div>
          </div>

          {/* Progress to next rank */}
          {nextRank && (
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
                <span>{currentRank.name}</span>
                <span>{nextRank.icon} {nextRank.name} ({nextRank.min} filleuls)</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "var(--bg-card)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${currentRank.color}, ${nextRank?.color || currentRank.color})` }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Plus que {nextRank.min - referralCount} filleul{nextRank.min - referralCount > 1 ? "s" : ""} pour {nextRank.name}
              </p>
            </div>
          )}
          {!nextRank && (
            <div className="flex items-center gap-2 mt-2">
              <Crown className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-cyan-400 font-semibold">Rang maximum atteint ! 🎉</p>
            </div>
          )}
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Gains totaux", value: `${totalEarned.toLocaleString()} FCFA`, icon: TrendingUp, color: "text-emerald-400" },
            { label: "Filleuls actifs", value: `${MOCK_REFERRALS.filter(r => r.active).length}/${referralCount}`, icon: Zap, color: "text-blue-400" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card p-4"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Code parrainage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Gift className="w-4 h-4 text-amber-400" />
            Votre code de parrainage
          </p>

          {/* Code */}
          <div
            className="flex items-center justify-between p-4 rounded-xl mb-3"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
          >
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Code unique</p>
              <p className="text-2xl font-black tracking-widest text-blue-400">{referralCode}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCopy(referralCode, "Code")}
              className="p-3 rounded-xl btn-primary"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Lien */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            <p className="text-xs flex-1 truncate" style={{ color: "var(--text-muted)" }}>
              {referralLink}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCopy(referralLink, "Lien")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 whitespace-nowrap hover:bg-blue-500/30"
            >
              <Copy className="w-3.5 h-3.5" />
              Copier
            </motion.button>
          </div>

          {/* Boutons de partage direct */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={shareWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/30 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={shareTelegram}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 text-xs font-bold hover:bg-sky-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
              Telegram
            </button>
          </div>

          {/* Bonus info */}
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-400 font-semibold">💡 Comment ça marche ?</p>
            <ul className="text-xs mt-1.5 space-y-1" style={{ color: "var(--text-muted)" }}>
              <li>• Votre filleul s'inscrit avec votre code</li>
              <li>• Il investit → vous gagnez <strong className="text-emerald-400">{currentRank.bonus}</strong> de commission</li>
              <li>• Commissions versées directement sur votre solde</li>
            </ul>
          </div>
        </motion.div>

        {/* Tableau des rangs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <p className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Trophy className="w-4 h-4 text-yellow-400" />
            Tableau des rangs
          </p>
          <div className="space-y-2">
            {RANKS.map((rank, i) => (
              <motion.div
                key={rank.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  currentRank.name === rank.name ? "ring-2" : ""
                }`}
                style={{
                  background: `linear-gradient(135deg, ${rank.color}15, transparent)`,
                  borderColor: rank.color + "30",
                  border: `1px solid ${rank.color}30`,
                  boxShadow: currentRank.name === rank.name ? `0 0 12px ${rank.color}40` : "none",
                  ...(currentRank.name === rank.name ? { outline: `2px solid ${rank.color}80` } : {})
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{rank.icon}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: rank.color }}>{rank.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {rank.max === Infinity ? `${rank.min}+ filleuls` : `${rank.min}–${rank.max} filleuls`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: rank.color }}>+{rank.bonus}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>commission</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Liste filleuls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <p className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Users className="w-4 h-4 text-blue-400" />
            Mes filleuls ({referralCount})
          </p>

          {referralCount === 0 ? (
            <div className="text-center py-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-3"
              >
                👥
              </motion.div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Pas encore de filleuls. Partagez votre code !
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {referralsList.map((ref, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                      {ref.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ref.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ref.joined}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">
                        +{(ref.amount * parseFloat(currentRank.bonus) / 100).toLocaleString()} F
                      </p>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${
                        ref.active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                      }`}>
                        {ref.active ? "Actif" : "Inactif"}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
