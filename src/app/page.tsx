"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import {
  TrendingUp, Shield, Zap, Globe, ChevronRight, Star,
  Users, DollarSign, Sun, Moon, Copy, CheckCircle,
  Award, Handshake, ArrowRight, Phone, Mail, Twitter,
  Facebook, Instagram, Youtube, Send, Menu, X, Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import AnimeHeroBackground from "@/components/landing/AnimeHeroBackground";
import Marquee from "@/components/landing/Marquee";
import RoiCalculator from "@/components/landing/RoiCalculator";
import BentoGrid from "@/components/landing/BentoGrid";

const paymentPartners = [
  { text: "Orange Money Cameroun", icon: "🟠", badge: "Instantané", color: "#f97316" },
  { text: "MTN Mobile Money", icon: "🟡", badge: "24h/7j", color: "#eab308" },
  { text: "Passerelle Officielle Fapshi", icon: "⚡", badge: "Agréé", color: "#60a5fa" },
  { text: "Cartes Visa & Mastercard", icon: "💳", badge: "Sécurisé", color: "#10b981" },
  { text: "Virement UBA & Ecobank", icon: "🏦", badge: "Direct", color: "#8b5cf6" },
];

const liveActivity = [
  { text: "Paul N. (Douala) a investi 50 000 XAF", icon: "🚀", badge: "il y a 2 min", color: "#10b981" },
  { text: "Aminata T. (Douala) a retiré 35 000 XAF via MTN MoMo", icon: "💰", badge: "il y a 5 min", color: "#eab308" },
  { text: "Samuel K. (Abidjan) a activé le Plan Expert", icon: "💎", badge: "il y a 8 min", color: "#f59e0b" },
  { text: "Fatou S. (Yaoundé) a reçu 12 500 XAF de bonus parrainage", icon: "🤝", badge: "il y a 11 min", color: "#a855f7" },
  { text: "Ibrahim D. (Bamako) a déposé 100 000 XAF via Orange Money", icon: "⚡", badge: "il y a 14 min", color: "#10b981" },
  { text: "Christelle M. (Libreville) a retiré 75 000 XAF", icon: "🎉", badge: "il y a 18 min", color: "#06b6d4" },
];

const stats = [
  { label: "Utilisateurs actifs", value: 50000, suffix: "+", icon: Users, color: "text-blue-400" },
  { label: "Investissements", value: 2.5, suffix: " Mds XAF", decimals: 1, icon: DollarSign, color: "text-emerald-400" },
  { label: "Pays couverts", value: 15, suffix: " pays", icon: Globe, color: "text-purple-400" },
  { label: "Satisfaction", value: 4.9, suffix: "/5", decimals: 1, icon: Star, color: "text-yellow-400" },
];

const features = [
  { icon: TrendingUp, title: "Rendements garantis", desc: "Jusqu'à 15% de retour quotidien sur vos investissements avec nos plans certifiés.", color: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/20" },
  { icon: Zap, title: "Dépôt instantané via Fapshi", desc: "Déposez en quelques secondes via Orange Money ou MTN Mobile Money — powered by Fapshi.", color: "from-yellow-500 to-orange-500", glow: "shadow-yellow-500/20" },
  { icon: Shield, title: "Sécurité maximale", desc: "Vos fonds sont protégés par un chiffrement de niveau bancaire et une surveillance 24h/7j.", color: "from-green-500 to-emerald-500", glow: "shadow-green-500/20" },
  { icon: Globe, title: "Panafricain", desc: "Disponible au Cameroun, Sénégal, Côte d'Ivoire, Mali, Burkina Faso et 10 autres pays.", color: "from-purple-500 to-pink-500", glow: "shadow-purple-500/20" },
];

const plans = [
  { name: "Débutant", invest: "5 000", gain: "300", duration: "30", color: "from-blue-600 to-cyan-500", glow: "shadow-blue-500/30", badge: "POPULAIRE" },
  { name: "Intermédiaire", invest: "20 000", gain: "1 500", duration: "30", color: "from-purple-600 to-violet-500", glow: "shadow-purple-500/30", badge: "RECOMMANDÉ", featured: true },
  { name: "Expert", invest: "100 000", gain: "8 000", duration: "30", color: "from-yellow-500 to-orange-500", glow: "shadow-yellow-500/30", badge: "VIP" },
];

const partnerRanks = [
  { name: "Bronze", min: 0, max: 4, color: "#cd7f32", glow: "rgba(205,127,50,0.4)", icon: "🥉", bonus: "5%" },
  { name: "Silver", min: 5, max: 19, color: "#a8a9ad", glow: "rgba(168,169,173,0.4)", icon: "🥈", bonus: "7%" },
  { name: "Gold", min: 20, max: 49, color: "#ffd700", glow: "rgba(255,215,0,0.4)", icon: "🥇", bonus: "10%" },
  { name: "Diamond", min: 50, max: Infinity, color: "#b9f2ff", glow: "rgba(185,242,255,0.5)", icon: "💎", bonus: "15%" },
];

const testimonials = [
  { name: "Kaltoum M.", country: "🇨🇲 Cameroun", text: "J'ai investi 20 000 XAF et je reçois 1 500 XAF chaque jour. GlobalInvest a changé ma vie!", avatar: "K", color: "bg-blue-500" },
  { name: "Ibrahima D.", country: "🇸🇳 Sénégal", text: "Le système de parrainage est incroyable. J'ai parrainé 12 amis et je gagne des bonus chaque semaine.", avatar: "I", color: "bg-emerald-500" },
  { name: "Aïcha K.", country: "🇨🇮 Côte d'Ivoire", text: "Paiement via Orange Money super rapide. Le retrait est crédité en moins de 24h!", avatar: "A", color: "bg-purple-500" },
];

const footerLinks = {
  produit: [
    { label: "Plans d'investissement", href: "#plans" },
    { label: "Programme Partenariat", href: "#partenariat" },
    { label: "Comment ça marche", href: "#features" },
    { label: "Témoignages", href: "#testimonials" },
  ],
  support: [
    { label: "Centre d'aide", href: "#" },
    { label: "Contact", href: "#contact" },
    { label: "FAQ", href: "#" },
    { label: "Signaler un problème", href: "#" },
  ],
  legal: [
    { label: "Conditions d'utilisation", href: "#" },
    { label: "Politique de confidentialité", href: "#" },
    { label: "Mentions légales", href: "#" },
    { label: "Politique de cookies", href: "#" },
  ],
};

// ── Floating Particles ──────────────────────────
function FloatingParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 6,
    color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
          animate={{
            y: [0, -40, -20, -60, 0],
            x: [0, 15, -10, 20, 0],
            opacity: [0.3, 0.9, 0.5, 0.8, 0.3],
            scale: [1, 1.3, 0.8, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Large Orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
          top: "-20%", left: "30%",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          bottom: "10%", right: "10%",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}

// ── Grid Background ──────────────────────────
function GridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

// ── Animated Counter ──────────────────────────
function AnimatedStat({ stat }: { stat: typeof stats[0] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="stat-card text-center group"
    >
      <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform`}>
        <stat.icon className={`w-5 h-5 ${stat.color}`} />
      </div>
      <div className={`text-2xl font-black ${stat.color}`}>
        {inView ? (
          <CountUp
            end={stat.value}
            duration={2.5}
            decimals={stat.decimals || 0}
            suffix={stat.suffix}
          />
        ) : "—"}
      </div>
      <div className="text-[var(--text-secondary)] text-xs mt-1 font-medium">{stat.label}</div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────
export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [email, setEmail] = useState("");
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const copyReferral = () => {
    navigator.clipboard.writeText("https://globalinvest.africa/ref/DEMO123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isDark = theme === "dark";

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>

      {/* ── NAVBAR ── */}
      <motion.nav
        style={{ backdropFilter: "blur(20px)" }}
        className="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300"
        animate={{ backgroundColor: "var(--navbar-bg)", borderColor: "var(--border-color)" }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl" style={{ color: "var(--text-primary)" }}>
              Global<span className="text-blue-400">Invest</span>
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {["#features", "#plans", "#partenariat", "#testimonials"].map((href, i) => (
              <a key={href} href={href} className="text-sm font-medium transition-colors hover:text-blue-400" style={{ color: "var(--text-secondary)" }}>
                {["Fonctionnalités", "Plans", "Partenariat", "Avis"][i]}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all hover:scale-110" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
              <AnimatePresence mode="wait">
                <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
                </motion.div>
              </AnimatePresence>
            </button>

            <Link href="/login" className="text-sm font-semibold hidden md:block transition-colors hover:text-blue-400" style={{ color: "var(--text-secondary)" }}>
              Connexion
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4 hidden md:flex items-center gap-1.5">
              Commencer <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile menu */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" style={{ color: "var(--text-primary)" }} /> : <Menu className="w-5 h-5" style={{ color: "var(--text-primary)" }} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t px-4 py-4 space-y-3" style={{ background: "var(--navbar-bg)", borderColor: "var(--border-color)" }}>
              {["#features", "#plans", "#partenariat", "#testimonials"].map((href, i) => (
                <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {["Fonctionnalités", "Plans", "Partenariat", "Avis"][i]}
                </a>
              ))}
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1 text-center py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                  Connexion
                </Link>
                <Link href="/register" className="flex-1 btn-primary text-center text-sm py-2.5">
                  S'inscrire
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <GridBackground />
        <FloatingParticles />
        <AnimeHeroBackground />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="badge-live mb-8 mx-auto w-fit"
            >
              <motion.span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              Plateforme N°1 en Afrique — Powered by Fapshi
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8">
              <span style={{ color: "var(--text-primary)" }}>Investissez &</span>{" "}
              <span className="gradient-text">Gagnez</span>
              <br />
              <span style={{ color: "var(--text-primary)" }}>chaque jour</span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              La plateforme d'investissement la plus simple et sécurisée d'Afrique.
              Déposez via <strong className="text-blue-400">Fapshi</strong> (Mobile Money), investissez et recevez vos gains quotidiennement.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link href="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-4 w-full sm:w-auto justify-center">
                <Sparkles className="w-5 h-5" />
                Créer mon compte gratuitement
                <ChevronRight className="w-5 h-5" />
              </Link>
              <a href="#plans" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all w-full sm:w-auto justify-center border"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
                Voir les plans
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Operators */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm mr-1" style={{ color: "var(--text-muted)" }}>Paiements via :</span>
              {["🟠 Orange Money", "🟡 MTN MoMo"].map((op) => (
                <motion.span key={op} whileHover={{ scale: 1.05, y: -1 }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-default"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
                  {op}
                </motion.span>
              ))}
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/15 border border-blue-500/30 text-blue-400">
                ⚡ Fapshi
              </span>
            </motion.div>
          </motion.div>

          {/* Floating cards */}
          <div className="relative mt-16 hidden lg:block">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-4 top-4 glass-card p-4 w-48 text-left shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>Gain reçu</span>
              </div>
              <p className="text-emerald-400 font-black text-lg">+8 000 XAF</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Plan Expert — Aujourd'hui</p>
            </motion.div>

            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute -right-4 top-0 glass-card p-4 w-52 text-left shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>Nouveau filleul</span>
              </div>
              <p className="font-black" style={{ color: "var(--text-primary)" }}>Amadou D.</p>
              <p className="text-purple-400 text-xs font-semibold">+750 XAF de bonus</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── LIVE TICKERS & PARTNERS MARQUEE ── */}
      <div className="border-y py-2 overflow-hidden" style={{ borderColor: "var(--border-color)", background: "var(--bg-secondary)" }}>
        <Marquee items={paymentPartners} speed={25} />
        <Marquee items={liveActivity} speed={32} reverse />
      </div>

      {/* ── STATS ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} stat={stat} />
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-14">
            <span className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-3 block">Pourquoi nous choisir</span>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: "var(--text-primary)" }}>
              Une plateforme taillée<br />pour l'Afrique
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Conçu spécialement avec les opérateurs Mobile Money africains et la passerelle Fapshi.
            </p>
          </motion.div>

          {/* Bento Grid layout */}
          <div className="mb-12">
            <BentoGrid />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass-card p-7 group cursor-default relative overflow-hidden">
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-br ${f.color} opacity-5 group-hover:opacity-10 transition-opacity blur-2xl`} />
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg ${f.glow} group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-black text-lg mb-2" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="plans" className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-blue-500/3 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-14">
            <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-3 block">Plans d'investissement</span>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: "var(--text-primary)" }}>
              Choisissez votre niveau
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>Commencez dès 5 000 XAF et multipliez vos revenus</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`glass-card overflow-hidden relative ${plan.featured ? "ring-2 ring-purple-500/50" : ""}`}>
                {plan.featured && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-violet-500" />
                )}
                <div className={`h-2 bg-gradient-to-r ${plan.color}`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-black text-xl" style={{ color: "var(--text-primary)" }}>Plan {plan.name}</h3>
                    <span className={`text-xs font-black px-3 py-1 rounded-full bg-gradient-to-r ${plan.color} text-white`}>
                      {plan.badge}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      { label: "Investissement", value: `${plan.invest} XAF`, color: "var(--text-primary)" },
                      { label: "Gain quotidien", value: `${plan.gain} XAF/j`, color: "#34d399" },
                      { label: "Durée", value: `${plan.duration} jours`, color: "var(--text-primary)" },
                      { label: "Gain total", value: `${(Number(plan.gain.replace(/\s/g, "")) * Number(plan.duration)).toLocaleString("fr-FR")} XAF`, color: "#60a5fa" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex justify-between text-sm py-2 border-b" style={{ borderColor: "var(--border-color)" }}>
                        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                        <span className="font-bold" style={{ color }} suppressHydrationWarning>{value}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/register"
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-95 bg-gradient-to-r ${plan.color} shadow-lg ${plan.glow}`}>
                    Investir maintenant
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIMULATEUR DE RENDEMENT ROI ── */}
      <section className="py-12 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <RoiCalculator />
        </div>
      </section>

      {/* ── PARTENARIAT ── */}
      <section id="partenariat" className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-14">
            <span className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-3 block">Programme d'affiliation</span>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: "var(--text-primary)" }}>
              Parrainez & Gagnez<br />
              <span className="gradient-text">jusqu'à 15% de bonus</span>
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Invitez vos amis et recevez un bonus sur chaque dépôt qu'ils effectuent. Plus vous parrainez, plus votre rang monte !
            </p>
          </motion.div>

          {/* Ranks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
            {partnerRanks.map((rank, i) => (
              <motion.div key={rank.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="glass-card p-5 text-center cursor-default relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `radial-gradient(circle at center, ${rank.glow} 0%, transparent 70%)` }}
                />
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  className="text-4xl mb-3 relative z-10">
                  {rank.icon}
                </motion.div>
                <h3 className="font-black text-lg mb-1 relative z-10" style={{ color: rank.color }}>{rank.name}</h3>
                <p className="text-xs mb-2 relative z-10" style={{ color: "var(--text-muted)" }}>{rank.min}–{rank.max === Infinity ? "∞" : rank.max} filleuls</p>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-black relative z-10"
                  style={{ background: `${rank.glow}`, color: rank.color, border: `1px solid ${rank.color}40` }}>
                  {rank.bonus}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Referral Demo */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}>
              <h3 className="text-2xl font-black mb-4" style={{ color: "var(--text-primary)" }}>Votre lien de parrainage</h3>
              <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
                Partagez votre lien unique et recevez des bonus automatiquement dès que vos filleuls déposent.
              </p>

              <div className="glass-card p-4 flex items-center gap-3 mb-4">
                <div className="flex-1 text-sm font-mono truncate text-blue-400">
                  globalinvest.africa/ref/<strong>DEMO123</strong>
                </div>
                <motion.button onClick={copyReferral} whileTap={{ scale: 0.9 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ background: copied ? "rgba(16,185,129,0.15)" : "var(--bg-card-hover)", color: copied ? "#34d399" : "var(--text-primary)", border: "1px solid var(--border-color)" }}>
                  {copied ? <><CheckCircle className="w-4 h-4" /> Copié!</> : <><Copy className="w-4 h-4" /> Copier</>}
                </motion.button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Filleuls directs", value: "12", icon: "👥", color: "text-blue-400" },
                  { label: "Bonus ce mois", value: "45 000 XAF", icon: "💰", color: "text-emerald-400" },
                  { label: "Rang actuel", value: "Gold 🥇", icon: "🏆", color: "text-yellow-400" },
                ].map((s) => (
                  <div key={s.label} className="glass-card p-3 text-center">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className={`font-black text-sm ${s.color}`}>{s.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* How it works */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}>
              <div className="space-y-4">
                {[
                  { step: "01", title: "Créez votre compte", desc: "Inscrivez-vous gratuitement en 2 minutes avec votre numéro Mobile Money.", icon: "✍️" },
                  { step: "02", title: "Partagez votre lien", desc: "Copiez votre lien unique et partagez-le sur WhatsApp, Facebook, Telegram.", icon: "🔗" },
                  { step: "03", title: "Vos amis s'inscrivent", desc: "Chaque ami qui s'inscrit et dépose devient votre filleul.", icon: "🤝" },
                  { step: "04", title: "Recevez vos bonus", desc: "5 à 15% du dépôt de chaque filleul est crédité automatiquement.", icon: "💎" },
                ].map((step, i) => (
                  <motion.div key={step.step}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 glass-card p-4 group hover:border-blue-500/30 transition-all">
                    <div className="text-2xl">{step.icon}</div>
                    <div>
                      <div className="text-xs font-black text-blue-400 mb-0.5">ÉTAPE {step.step}</div>
                      <h4 className="font-black text-sm mb-1" style={{ color: "var(--text-primary)" }}>{step.title}</h4>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-14">
            <span className="text-yellow-400 text-sm font-bold uppercase tracking-widest mb-3 block">Témoignages</span>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: "var(--text-primary)" }}>
              Ils nous font confiance
            </h2>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className="glass-card p-8 text-center">
                <div className={`w-16 h-16 rounded-2xl ${testimonials[activeTestimonial].color} flex items-center justify-center mx-auto mb-5 text-white font-black text-2xl`}>
                  {testimonials[activeTestimonial].avatar}
                </div>
                <p className="text-lg font-medium mb-5 leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div>
                  <p className="font-black" style={{ color: "var(--text-primary)" }}>{testimonials[activeTestimonial].name}</p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{testimonials[activeTestimonial].country}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? "w-6 bg-blue-500" : "bg-white/20"}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center relative overflow-hidden gradient-border">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5" />
            <div className="relative z-10">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "var(--text-primary)" }}>Prêt à commencer ?</h2>
              <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
                Rejoignez plus de <strong className="text-white">50 000</strong> investisseurs africains qui font confiance à GlobalInvest.
              </p>
              <Link href="/register" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Créer mon compte gratuit
                <ChevronRight className="w-5 h-5" />
              </Link>
              <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>✅ Gratuit • ✅ Sans frais cachés • ✅ Paiement via Fapshi sécurisé</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" className="border-t pt-16 pb-8 px-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-secondary)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-xl" style={{ color: "var(--text-primary)" }}>
                  Global<span className="text-blue-400">Invest</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-5 max-w-xs" style={{ color: "var(--text-secondary)" }}>
                La plateforme d'investissement N°1 en Afrique. Sécurisée, transparente et disponible 24h/7j avec les paiements Mobile Money via Fapshi.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, color: "hover:text-blue-500", label: "Facebook" },
                  { icon: Twitter, color: "hover:text-sky-400", label: "Twitter" },
                  { icon: Instagram, color: "hover:text-pink-500", label: "Instagram" },
                  { icon: Youtube, color: "hover:text-red-500", label: "YouTube" },
                  { icon: Send, color: "hover:text-blue-400", label: "Telegram" },
                ].map(({ icon: Icon, color, label }) => (
                  <motion.button key={label} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${color}`}
                    style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
                    <Icon className="w-4 h-4" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="font-black text-sm uppercase tracking-widest mb-4 text-blue-400">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="text-sm transition-colors hover:text-blue-400" style={{ color: "var(--text-secondary)" }}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="glass-card p-6 mb-10 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <h4 className="font-black text-base mb-1" style={{ color: "var(--text-primary)" }}>📬 Restez informé</h4>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Recevez les actualités et les nouveaux plans d'investissement.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full md:w-64 text-sm py-3" />
              <button className="btn-primary px-5 py-3 text-sm whitespace-nowrap">S'abonner</button>
            </div>
          </div>

          {/* Operators */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["🟠 Orange Money", "🟡 MTN MoMo", "⚡ Fapshi"].map((op) => (
              <span key={op} className="px-4 py-1.5 rounded-full text-xs font-semibold border"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
                {op}
              </span>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: "var(--border-color)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              © {new Date().getFullYear()} Global Investment Africa. Tous droits réservés. | Sécurisé SSL 256-bit
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
              <a href="#" className="hover:text-blue-400 transition-colors">CGU</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
