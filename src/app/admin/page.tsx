"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CountUp from "react-countup";
import Confetti from "react-confetti";
import {
  TrendingUp,
  ShieldCheck,
  Users,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Sliders,
  DollarSign,
  AlertTriangle,
  Award,
  Layers,
  Settings,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type TabType = "overview" | "transactions" | "users" | "plans";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimension, setWindowDimension] = useState({ width: 1200, height: 800 });

  // Transactions state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txFilterStatus, setTxFilterStatus] = useState("ALL");
  const [txFilterType, setTxFilterType] = useState("ALL");
  const [txLoading, setTxLoading] = useState(false);
  const [txActionLoading, setTxActionLoading] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState("");
  const [selectedVipLevel, setSelectedVipLevel] = useState<number>(0);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Plans state
  const [plans, setPlans] = useState<any[]>([]);
  const [planActionLoading, setPlanActionLoading] = useState<string | null>(null);

  // Cron state
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => {
        setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        throw new Error("Erreur de chargement des statistiques admin");
      }
      const data = await res.json();
      setStats(data);
      setPlans(data.plans || []);
    } catch (err: any) {
      toast.error(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTxLoading(true);
      const params = new URLSearchParams();
      if (txFilterStatus !== "ALL") params.append("status", txFilterStatus);
      if (txFilterType !== "ALL") params.append("type", txFilterType);
      const res = await fetch(`/api/admin/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userSearch) params.append("search", userSearch);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "transactions") fetchTransactions();
    if (activeTab === "users") fetchUsers();
  }, [activeTab, txFilterStatus, txFilterType]);

  // Trigger Cron Daily Yield
  const handleTriggerCron = async () => {
    setCronRunning(true);
    try {
      const res = await fetch("/api/admin/cron", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCronResult(data);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 7000);
      toast.success(data.message, { duration: 6000 });
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Erreur exécution cron");
    } finally {
      setCronRunning(false);
    }
  };

  // Transaction action (APPROVE / REJECT)
  const handleTransactionAction = async (transactionId: string, action: "APPROVE" | "REJECT") => {
    setTxActionLoading(transactionId);
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      fetchTransactions();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'action");
    } finally {
      setTxActionLoading(null);
    }
  };

  // Update user balance or VIP
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setUserActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          balanceDelta: balanceAdjustAmount ? parseFloat(balanceAdjustAmount) : undefined,
          vipLevel: selectedVipLevel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Utilisateur mis à jour !");
      setUserModalOpen(false);
      setBalanceAdjustAmount("");
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Erreur de mise à jour");
    } finally {
      setUserActionLoading(false);
    }
  };

  // Toggle Plan Status
  const handleTogglePlan = async (plan: any) => {
    setPlanActionLoading(plan.id);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          isActive: !plan.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setPlanActionLoading(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full mb-4 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
        />
        <p className="text-cyan-300 font-mono tracking-widest text-sm uppercase animate-pulse">
          Initialisation du Centre de Commandement GlobalInvest...
        </p>
      </div>
    );
  }

  const metrics = stats?.metrics || {};

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 relative overflow-x-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {showConfetti && (
        <Confetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={false}
          numberOfPieces={350}
          gravity={0.15}
        />
      )}

      {/* Futuristic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Top Cyber Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#070b14]/80 backdrop-blur-xl border-b border-cyan-500/20 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 hover:border-cyan-500/30"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au Dashboard
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-emerald-500 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                <div className="w-full h-full bg-[#070b14] rounded-[11px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </div>
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white">
                    GLOBAL<span className="text-cyan-400">ADMIN</span>
                  </span>
                  <span className="bg-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    LIVE CONTROL
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                  Superviseur Panafricain • Système v2.4
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Instant Cron Yield Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleTriggerCron}
              disabled={cronRunning}
              className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-[1px] shadow-[0_0_25px_rgba(16,185,129,0.35)]"
            >
              <div className="bg-[#070b14]/90 px-4 py-2 rounded-[11px] flex items-center gap-2 transition-colors group-hover:bg-transparent">
                <Zap className={`w-4 h-4 text-emerald-400 ${cronRunning ? "animate-spin" : ""}`} />
                <span className="text-xs font-black tracking-wider uppercase text-white">
                  {cronRunning ? "Distribution en cours..." : "Distribuer Dividendes"}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 group-hover:rotate-45 transition-transform" />
              </div>
            </motion.button>

            {/* Refresh Button */}
            <button
              onClick={fetchStats}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-white transition-all active:scale-95"
              title="Rafraîchir les données"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          {[
            { id: "overview", label: "Vue d'ensemble", icon: Activity, count: null },
            {
              id: "transactions",
              label: "Transactions",
              icon: CreditCard,
              count: (metrics.pendingDepositsCount || 0) + (metrics.pendingWithdrawalsCount || 0),
            },
            { id: "users", label: "Utilisateurs", icon: Users, count: metrics.totalUsers },
            { id: "plans", label: "Plans d'Actifs", icon: Layers, count: plans.length },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as TabType)}
                className={`relative px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-cyan-400" : ""}`} />
                <span className="relative z-10">{t.label}</span>
                {t.count !== null && t.count > 0 && (
                  <span
                    className={`relative z-10 text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isActive
                        ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: VUE D'ENSEMBLE */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* KPI Metrics Grid with CountUp animations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Dépôts */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative overflow-hidden rounded-3xl bg-slate-900/70 border border-emerald-500/30 p-6 shadow-xl backdrop-blur-xl group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <ArrowDownCircle className="w-4 h-4" /> Dépôts Totaux
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Volume Entrant
                  </span>
                </div>
                <div className="text-3xl font-black text-white tracking-tight drop-shadow-md">
                  <CountUp
                    end={metrics.totalDeposited || 0}
                    duration={2}
                    separator=" "
                    suffix=" XAF"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">
                    +{metrics.pendingDepositsCount || 0}
                  </span>{" "}
                  en attente de validation
                </p>
              </motion.div>

              {/* Total Retraits */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative overflow-hidden rounded-3xl bg-slate-900/70 border border-rose-500/30 p-6 shadow-xl backdrop-blur-xl group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-1.5">
                    <ArrowUpCircle className="w-4 h-4" /> Retraits Exécutés
                  </span>
                  <span className="text-[10px] font-bold text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    Volume Sortant
                  </span>
                </div>
                <div className="text-3xl font-black text-white tracking-tight drop-shadow-md">
                  <CountUp
                    end={metrics.totalWithdrawn || 0}
                    duration={2}
                    separator=" "
                    suffix=" XAF"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <span className="text-rose-400 font-bold">
                    +{metrics.pendingWithdrawalsCount || 0}
                  </span>{" "}
                  demandes en attente
                </p>
              </motion.div>

              {/* Réserve Nette */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative overflow-hidden rounded-3xl bg-slate-900/70 border border-cyan-500/30 p-6 shadow-xl backdrop-blur-xl group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Réserve Plateforme
                  </span>
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    Liquidité Nette
                  </span>
                </div>
                <div className="text-3xl font-black text-white tracking-tight drop-shadow-md">
                  <CountUp
                    end={metrics.netReserve || 0}
                    duration={2}
                    separator=" "
                    suffix=" XAF"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">Fonds disponibles en couverture</p>
              </motion.div>

              {/* Utilisateurs & Investissements */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative overflow-hidden rounded-3xl bg-slate-900/70 border border-purple-500/30 p-6 shadow-xl backdrop-blur-xl group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Investisseurs Actifs
                  </span>
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    +{metrics.todayUsers || 0} aujourd'hui
                  </span>
                </div>
                <div className="text-3xl font-black text-white tracking-tight drop-shadow-md">
                  <CountUp end={metrics.totalUsers || 0} duration={1.5} />
                  <span className="text-xs text-purple-300 font-bold ml-2">
                    ({metrics.activeInvestmentsCount || 0} plans en cours)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Volume sous gestion :{" "}
                  <span className="text-purple-400 font-bold">
                    {(metrics.activeInvestmentsVolume || 0).toLocaleString()} XAF
                  </span>
                </p>
              </motion.div>
            </div>

            {/* Interactive Analytics Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" /> Flux de Trésorerie (7 Jours)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Comparatif dynamique des flux de dépôts, retraits et rendements
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Dépôts
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Retraits
                    </span>
                  </div>
                </div>

                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.chartData || []}>
                      <defs>
                        <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="day"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "16px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="deposits"
                        name="Dépôts"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorDeposits)"
                      />
                      <Area
                        type="monotone"
                        dataKey="withdrawals"
                        name="Retraits"
                        stroke="#f43f5e"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorWithdrawals)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Action Hub & System Health */}
              <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-yellow-400" /> Actions Stratégiques
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Pilotez les opérations financières critiques
                  </p>

                  <div className="space-y-3">
                    {/* Action 1: Cron */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Dividendes Quotidiens
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {metrics.activeInvestmentsCount || 0} bénéficiaires
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-3">
                        Crédite instantanément le rendement journalier de chaque contrat actif.
                      </p>
                      <button
                        onClick={handleTriggerCron}
                        disabled={cronRunning}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                      >
                        {cronRunning ? "Calcul en cours..." : "Exécuter maintenant"}
                      </button>
                    </div>

                    {/* Action 2: Review Pending */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" /> Approbations en file
                        </span>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          {(metrics.pendingDepositsCount || 0) +
                            (metrics.pendingWithdrawalsCount || 0)}{" "}
                          en attente
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setTxFilterStatus("PENDING");
                          setActiveTab("transactions");
                        }}
                        className="w-full mt-2 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        Gérer les demandes →
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Status Indicators */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Passerelle Fapshi : Opérationnelle</span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400">100% UPTIME</span>
                </div>
              </div>
            </div>

            {/* Recent Activity Table Preview */}
            <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" /> Dernières Transactions Enregistrées
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Flux financiers récents traités par la plateforme
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  Voir l'intégralité <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Utilisateur</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Montant</th>
                      <th className="pb-3">Opérateur</th>
                      <th className="pb-3">Statut</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(stats?.recentTransactions || []).slice(0, 5).map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5">
                          <p className="font-bold text-white">{tx.depositor?.name || "Inconnu"}</p>
                          <p className="text-[10px] text-slate-400">{tx.depositor?.phone || tx.phone}</p>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              tx.type === "DEPOSIT"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {tx.type === "DEPOSIT" ? "Dépôt" : "Retrait"}
                          </span>
                        </td>
                        <td className="py-3.5 font-black text-white">
                          {tx.amount.toLocaleString()} XAF
                        </td>
                        <td className="py-3.5 font-medium uppercase text-slate-300">
                          {tx.operator}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              tx.status === "SUCCESS"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : tx.status === "PENDING"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {tx.status === "SUCCESS"
                              ? "Validé"
                              : tx.status === "PENDING"
                              ? "En attente"
                              : "Échoué"}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                          {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 text-right">
                          {tx.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleTransactionAction(tx.id, "APPROVE")}
                                disabled={txActionLoading === tx.id}
                                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black transition-all"
                                title="Approuver"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleTransactionAction(tx.id, "REJECT")}
                                disabled={txActionLoading === tx.id}
                                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white transition-all"
                                title="Rejeter"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-medium">Traité</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: GESTION DES TRANSACTIONS */}
        {activeTab === "transactions" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
                  Statut :
                </span>
                {["ALL", "PENDING", "SUCCESS", "FAILED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setTxFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      txFilterStatus === s
                        ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {s === "ALL"
                      ? "Tous"
                      : s === "PENDING"
                      ? "En Attente"
                      : s === "SUCCESS"
                      ? "Validés"
                      : "Rejetés"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
                  Type :
                </span>
                {["ALL", "DEPOSIT", "WITHDRAWAL"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTxFilterType(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      txFilterType === t
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t === "ALL" ? "Tous" : t === "DEPOSIT" ? "Dépôts" : "Retraits"}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-2xl">
              {txLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16">
                  <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">Aucune transaction trouvée</p>
                  <p className="text-slate-600 text-xs mt-1">
                    Essayez de modifier vos filtres de recherche.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Utilisateur</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Montant Net</th>
                        <th className="pb-3">Frais</th>
                        <th className="pb-3">Opérateur & Numéro</th>
                        <th className="pb-3">ID Transaction</th>
                        <th className="pb-3">Statut</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4">
                            <p className="font-bold text-white">
                              {tx.depositor?.name || "Utilisateur"}
                            </p>
                            <p className="text-[10px] text-slate-400">{tx.depositor?.email}</p>
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                tx.type === "DEPOSIT"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {tx.type === "DEPOSIT" ? "Dépôt" : "Retrait"}
                            </span>
                          </td>
                          <td className="py-4 font-black text-white text-sm">
                            {tx.amount.toLocaleString()} XAF
                          </td>
                          <td className="py-4 text-slate-400 font-mono">
                            {(tx.fee || 0).toLocaleString()} XAF
                          </td>
                          <td className="py-4">
                            <span className="font-bold text-slate-200 uppercase">
                              {tx.operator}
                            </span>
                            <p className="text-[10px] font-mono text-slate-400">{tx.phone}</p>
                          </td>
                          <td className="py-4 font-mono text-[10px] text-slate-400">
                            {tx.transactionId || tx.id.slice(0, 10)}
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                tx.status === "SUCCESS"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : tx.status === "PENDING"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {tx.status === "SUCCESS"
                                ? "Validé"
                                : tx.status === "PENDING"
                                ? "En Attente"
                                : "Rejeté"}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {tx.status === "PENDING" ? (
                              <div className="flex items-center justify-end gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleTransactionAction(tx.id, "APPROVE")}
                                  disabled={txActionLoading === tx.id}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-emerald-500/20"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Approuver
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleTransactionAction(tx.id, "REJECT")}
                                  disabled={txActionLoading === tx.id}
                                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Rejeter
                                </motion.button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(tx.createdAt).toLocaleDateString("fr-FR")}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: GESTION DES UTILISATEURS */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Rechercher par nom, email, téléphone ou code parrain..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors backdrop-blur-xl"
              />
            </div>

            {/* Users Table */}
            <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Investisseur</th>
                      <th className="pb-3">Rôle</th>
                      <th className="pb-3">Niveau VIP</th>
                      <th className="pb-3">Solde Principal</th>
                      <th className="pb-3">Bonus Filleuls</th>
                      <th className="pb-3">Code Parrain</th>
                      <th className="pb-3">Investissements</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4">
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {u.email} • {u.phone}
                          </p>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              u.role === "ADMIN"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-slate-700/30 text-slate-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit">
                            <Award className="w-3 h-3" /> VIP {u.vipLevel}
                          </span>
                        </td>
                        <td className="py-4 font-black text-cyan-400 text-sm">
                          {u.balance.toLocaleString()} XAF
                        </td>
                        <td className="py-4 font-black text-emerald-400">
                          {u.bonusBalance.toLocaleString()} XAF
                        </td>
                        <td className="py-4 font-mono text-[11px] text-slate-300">
                          {u.referralCode}
                        </td>
                        <td className="py-4 font-bold text-slate-300">
                          {u._count?.investments || 0} actif(s)
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setSelectedVipLevel(u.vipLevel);
                              setUserModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black text-slate-300 text-xs font-bold transition-all"
                          >
                            Ajuster Solde / VIP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: GESTION DES PLANS */}
        {activeTab === "plans" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-3xl p-6 border transition-all relative overflow-hidden backdrop-blur-xl ${
                    p.isActive
                      ? "bg-slate-900/70 border-white/10 shadow-xl"
                      : "bg-slate-900/30 border-dashed border-white/10 opacity-60"
                  }`}
                >
                  <div
                    className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: p.color || "#3b82f6" }}
                  />

                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-black font-mono"
                      style={{ backgroundColor: p.color || "#3b82f6" }}
                    >
                      {p.category}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        p.isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {p.isActive ? "ACTIF" : "DÉSACTIVÉ"}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-white mb-1">{p.name}</h4>
                  <p className="text-2xl font-black text-cyan-400 tracking-tight mb-4">
                    +{p.dailyReturn}%{" "}
                    <span className="text-xs text-slate-400 font-normal">/ jour</span>
                  </p>

                  <div className="space-y-2 text-xs text-slate-300 font-mono mb-6 bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                    <p className="flex justify-between">
                      <span className="text-slate-500">Min :</span>
                      <span>{p.minAmount.toLocaleString()} XAF</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Max :</span>
                      <span>{p.maxAmount.toLocaleString()} XAF</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Durée :</span>
                      <span>{p.duration} jours</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">VIP requis :</span>
                      <span>Niveau {p.vipRequired}</span>
                    </p>
                    <p className="flex justify-between font-bold text-white pt-1 border-t border-white/5">
                      <span className="text-slate-400">Contrats actifs :</span>
                      <span>{p._count?.investments || 0}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleTogglePlan(p)}
                    disabled={planActionLoading === p.id}
                    className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                      p.isActive
                        ? "bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white"
                        : "bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black"
                    }`}
                  >
                    {planActionLoading === p.id
                      ? "Traitement..."
                      : p.isActive
                      ? "Désactiver ce plan"
                      : "Activer ce plan"}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* MODAL: AJUSTER SOLDE / VIP UTILISATEUR */}
      <AnimatePresence>
        {userModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0e1626] border border-cyan-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-black text-white">Gestion Utilisateur</h3>
                  <p className="text-xs text-cyan-400 font-mono">{selectedUser.name}</p>
                </div>
                <button
                  onClick={() => setUserModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Balance Display */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase font-bold">Solde actuel :</span>
                  <span className="text-lg font-black text-emerald-400">
                    {selectedUser.balance.toLocaleString()} XAF
                  </span>
                </div>

                {/* Adjust Balance */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Ajuster Solde (+/- XAF)
                  </label>
                  <input
                    type="number"
                    value={balanceAdjustAmount}
                    onChange={(e) => setBalanceAdjustAmount(e.target.value)}
                    placeholder="Ex: 50000 pour créditer, -20000 pour débiter"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Les montants positifs créditent le compte ; les négatifs débitent.
                  </p>
                </div>

                {/* Adjust VIP Level */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Niveau VIP
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSelectedVipLevel(lvl)}
                        className={`py-2 rounded-xl text-xs font-black transition-all ${
                          selectedVipLevel === lvl
                            ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/30"
                            : "bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        VIP {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setUserModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={userActionLoading}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20"
                >
                  {userActionLoading ? "Enregistrement..." : "Appliquer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
