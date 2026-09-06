"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, EyeOff, Mail, Lock, ArrowLeft, Sun, Moon } from "lucide-react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) throw new Error("Email ou mot de passe incorrect");
      toast.success("Connexion réussie ! Bienvenue 🎉");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 right-1/3 w-80 h-80 bg-emerald-500 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%"><defs><pattern id="grid-login" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid-login)" /></svg>
        </div>
      </div>

      {/* Back button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fixed top-5 left-5 z-50">
        <Link href="/" className="back-btn">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      </motion.div>

      {/* Theme toggle */}
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={toggleTheme}
        className="fixed top-5 right-5 z-50 w-9 h-9 rounded-xl flex items-center justify-center border transition-all hover:scale-110"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <AnimatePresence mode="wait">
          <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl" style={{ color: "var(--text-primary)" }}>
              Global<span className="text-blue-400">Invest</span>
            </span>
          </motion.div>
          <h1 className="text-3xl font-black mb-1" style={{ color: "var(--text-primary)" }}>Connexion</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Accédez à votre tableau de bord</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-8 relative overflow-hidden" style={{ borderColor: "var(--border-color)" }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input type="email" required placeholder="jean@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input type={showPass ? "text" : "password"} required placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-blue-400"
                  style={{ color: "var(--text-muted)" }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 mt-2 text-base font-black">
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connexion...</>
              ) : "Se connecter →"}
            </motion.button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
              S'inscrire gratuitement
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
