"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Mail,
  Lock,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedCodeHint, setGeneratedCodeHint] = useState<string | null>(null);

  // Étape 1 : Demande de code par email
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Veuillez saisir votre adresse email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la demande");
      }

      setResetToken(data.resetToken);
      if (data.code) {
        setGeneratedCodeHint(data.code);
      }

      toast.success("Code de sécurité généré !");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la récupération");
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : Réinitialisation du mot de passe
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length < 6) {
      toast.error("Veuillez saisir le code à 6 chiffres");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit comporter au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les deux mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la réinitialisation");
      }

      toast.success("Mot de passe mis à jour avec succès ! 🎉");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Animated background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 right-1/3 w-80 h-80 bg-amber-500 rounded-full blur-[120px]"
        />
      </div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-5 left-5 z-50"
      >
        <Link href="/login" className="back-btn">
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>
      </motion.div>

      {/* Theme toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={toggleTheme}
        className="fixed top-5 right-5 z-50 w-9 h-9 rounded-xl flex items-center justify-center border transition-all hover:scale-110"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/20">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl" style={{ color: "var(--text-primary)" }}>
              Global<span className="text-blue-400">Invest</span>
            </span>
          </motion.div>
          <h1 className="text-3xl font-black mb-1" style={{ color: "var(--text-primary)" }}>
            Récupération
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {step === 1
              ? "Recevez un code de sécurité pour réinitialiser votre accès"
              : "Saisissez votre code et définissez un nouveau mot de passe"}
          </p>
        </div>

        {/* Card Form */}
        <motion.div
          className="glass-card p-8 relative overflow-hidden"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500" />

          {/* Stepper indicator */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 1 ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                }`}
              >
                {step === 2 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
              </span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                Identification
              </span>
            </div>
            <div className="w-8 h-0.5 bg-slate-700" />
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 2 ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-400"
                }`}
              >
                2
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: step === 2 ? "var(--text-primary)" : "var(--text-muted)" }}
              >
                Nouveau mot de passe
              </span>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Votre adresse Email de compte
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="jean@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base font-black shadow-lg shadow-blue-500/20"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Recherche du compte...
                  </>
                ) : (
                  <>
                    Continuer <ArrowLeft className="w-4 h-4 rotate-180" />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Info & Code hint box */}
              {generatedCodeHint && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 rounded-xl border bg-amber-500/10 border-amber-500/30 text-xs"
                >
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                    <Sparkles className="w-4 h-4" /> Code de vérification sécurisé généré :
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-base tracking-widest font-black text-amber-300">
                      {generatedCodeHint}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCode(generatedCodeHint)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                    >
                      Insérer le code
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Input Code */}
              <div>
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Code à 6 chiffres
                </label>
                <div className="relative">
                  <ShieldCheck
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400"
                  />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Ex: 849201"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="input-field pl-11 tracking-widest font-mono text-center font-bold text-lg"
                  />
                </div>
              </div>

              {/* New password */}
              <div>
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="Au moins 6 caractères"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div>
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="Confirmez à nouveau"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base font-black shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 mt-4"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mise à jour du mot de passe...
                  </>
                ) : (
                  "Valider et Changer le mot de passe"
                )}
              </motion.button>
            </form>
          )}

          <div className="text-center mt-6 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Vous vous souvenez de votre mot de passe ?{" "}
              <span className="text-blue-400 font-bold hover:underline">Se connecter</span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
