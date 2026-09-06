"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  TrendingUp, Eye, EyeOff, User, Mail, Phone,
  Lock, Globe, ArrowLeft, Sun, Moon, Check, Gift,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/components/providers/ThemeProvider";

const COUNTRIES = [
  { code: "CM", name: "Cameroun", flag: "🇨🇲", dial: "+237" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", dial: "+221" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", dial: "+225" },
  { code: "ML", name: "Mali", flag: "🇲🇱", dial: "+223" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", dial: "+226" },
  { code: "GN", name: "Guinée", flag: "🇬🇳", dial: "+224" },
  { code: "TG", name: "Togo", flag: "🇹🇬", dial: "+228" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯", dial: "+229" },
  { code: "CD", name: "Congo RDC", flag: "🇨🇩", dial: "+243" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", dial: "+241" },
];

const STEPS = ["Identité", "Contact", "Sécurité"];

export default function RegisterPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    country: "CM",
    referralCode: "",
  });

  const selectedCountry = COUNTRIES.find((c) => c.code === form.country);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) { setStep(s => s + 1); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription");

      toast.success("Compte créé avec succès ! 🎉");

      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-16 relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 7, repeat: Infinity }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.12, 0.05] }} transition={{ duration: 9, repeat: Infinity, delay: 3 }}
          className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%"><defs><pattern id="grid-reg" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid-reg)" /></svg>
        </div>
      </div>

      {/* Back button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fixed top-5 left-5 z-50">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} className="back-btn">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        ) : (
          <Link href="/" className="back-btn">
            <ArrowLeft className="w-4 h-4" />
            Accueil
          </Link>
        )}
      </motion.div>

      {/* Theme toggle */}
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={toggleTheme}
        className="fixed top-5 right-5 z-50 p-2.5 rounded-xl glass-card border border-white/10 text-slate-400 hover:text-yellow-400 transition-all">
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </motion.button>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl" style={{ color: "var(--text-primary)" }}>
              Global<span className="text-emerald-400">Invest</span>
            </span>
          </motion.div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Créer votre compte</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Rejoignez des milliers d'investisseurs africains
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <motion.div
                animate={{ scale: step === i ? 1.1 : 1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > i ? "bg-emerald-500 text-white" :
                  step === i ? "bg-blue-500 text-white" :
                  "bg-white/10 text-slate-400"
                }`}
              >
                {step > i ? <Check className="w-4 h-4" /> : i + 1}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className={`w-10 h-0.5 transition-all ${step > i ? "bg-emerald-500" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  {/* Google Quick Sign-Up */}
                  <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-bold text-sm border transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer shadow-sm mb-4"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>S'inscrire avec Google</span>
                  </button>

                  <div className="relative my-3 flex items-center justify-center">
                    <div className="w-full border-t" style={{ borderColor: "var(--border-color)" }} />
                    <span className="absolute px-3 text-xs font-bold uppercase tracking-wider" style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>
                      ou continuer manuellement
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-emerald-400 mb-4">👤 Informations personnelles</p>
                  {/* Pays */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      <Globe className="w-4 h-4 inline mr-1" /> Pays
                    </label>
                    <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="input-field appearance-none cursor-pointer">
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code} className="bg-slate-900">
                          {c.flag} {c.name} ({c.dial})
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      <User className="w-4 h-4 inline mr-1" /> Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input-field pl-10" placeholder="Jean Dupont" required />
                    </div>
                  </div>
                  {/* Code parrainage */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      <Gift className="w-4 h-4 inline mr-1" /> Code de parrainage (optionnel)
                    </label>
                    <div className="relative">
                      <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                      <input type="text" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
                        className="input-field pl-10 border-amber-500/20" placeholder="CODE123" />
                    </div>
                    {form.referralCode && (
                      <p className="text-xs text-emerald-400 mt-1">✅ Bonus de bienvenue activé !</p>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <p className="text-sm font-semibold text-blue-400 mb-4">📬 Coordonnées</p>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      <Mail className="w-4 h-4 inline mr-1" /> Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input-field pl-10" placeholder="jean@example.com" required />
                    </div>
                  </div>
                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      <Phone className="w-4 h-4 inline mr-1" /> Numéro Mobile Money
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 glass-card border border-white/10 rounded-xl text-sm whitespace-nowrap">
                        <span>{selectedCountry?.flag}</span>
                        <span className="text-slate-300">{selectedCountry?.dial}</span>
                      </div>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="input-field pl-10 w-full" placeholder="6XXXXXXXX" required />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <p className="text-sm font-semibold text-purple-400 mb-4">🔐 Sécurité du compte</p>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      <Lock className="w-4 h-4 inline mr-1" /> Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="input-field pl-10 pr-10" placeholder="••••••••" minLength={8} required />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${form.password.length >= i*2 ? (i<=2?"bg-red-400":i<=3?"bg-yellow-400":"bg-emerald-400") : "bg-white/10"}`} />
                      ))}
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {form.password.length < 4 ? "Trop court" : form.password.length < 6 ? "Faible" : form.password.length < 8 ? "Moyen" : "Fort ✅"}
                    </p>
                  </div>
                  {/* Recap */}
                  <div className="glass-card p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl">
                    <p className="text-xs font-semibold text-emerald-400 mb-2">📋 Récapitulatif</p>
                    <div className="space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <p>👤 {form.name}</p>
                      <p>📧 {form.email}</p>
                      <p>📱 {selectedCountry?.dial} {form.phone}</p>
                      <p>🌍 {selectedCountry?.flag} {selectedCountry?.name}</p>
                      {form.referralCode && <p>🎁 Code parrain: {form.referralCode}</p>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base font-semibold mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  Création en cours...
                </span>
              ) : step < 2 ? (
                <span>Continuer →</span>
              ) : (
                <span>🚀 Créer mon compte</span>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
            Déjà un compte ?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>🔒 SSL Sécurisé</span>
          <span>•</span>
          <span>🛡️ Données protégées</span>
          <span>•</span>
          <span>✅ 100% Légal</span>
        </div>
      </motion.div>
    </div>
  );
}
