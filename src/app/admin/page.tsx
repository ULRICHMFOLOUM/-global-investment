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
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  Phone,
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

type TabType = "overview" | "transactions" | "subscriptions" | "users" | "plans";

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
  const [txSearch, setTxSearch] = useState("");
  const [txLoading, setTxLoading] = useState(false);
  const [txActionLoading, setTxActionLoading] = useState<string | null>(null);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Identifiant copié !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subFilterStatus, setSubFilterStatus] = useState("PENDING");
  const [subLoading, setSubLoading] = useState(false);
  const [subActionLoading, setSubActionLoading] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userFilterDeposit, setUserFilterDeposit] = useState<"ALL" | "HAS_DEPOSIT" | "NO_DEPOSIT">("ALL");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [exactBalance, setExactBalance] = useState("");
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState("");
  const [balanceMode, setBalanceMode] = useState<"EXACT" | "DELTA">("EXACT");
  const [exactBonusBalance, setExactBonusBalance] = useState("");
  const [selectedVipLevel, setSelectedVipLevel] = useState<number>(0);
  const [selectedRole, setSelectedRole] = useState<string>("USER");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userDeleteModalOpen, setUserDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Plans state
  const [plans, setPlans] = useState<any[]>([]);
  const [planActionLoading, setPlanActionLoading] = useState<string | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [planForm, setPlanForm] = useState({
    id: "",
    name: "",
    category: "BANK",
    minAmount: 10000,
    maxAmount: 10000,
    totalReturn: 30000,
    duration: 30,
    vipRequired: 0,
    color: "#10B981",
    icon: "wallet",
    isActive: true,
  });
  const [planSaveLoading, setPlanSaveLoading] = useState(false);

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

  const fetchTransactions = async (searchOverride?: string) => {
    try {
      setTxLoading(true);
      const params = new URLSearchParams();
      if (txFilterStatus !== "ALL") params.append("status", txFilterStatus);
      if (txFilterType !== "ALL") params.append("type", txFilterType);
      const q = searchOverride !== undefined ? searchOverride : txSearch;
      if (q && q.trim()) params.append("search", q.trim());
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

  const fetchSubscriptions = async () => {
    try {
      setSubLoading(true);
      const params = new URLSearchParams();
      if (subFilterStatus !== "ALL") params.append("status", subFilterStatus);
      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubLoading(false);
    }
  };

  const fetchUsers = async (searchOverride?: string) => {
    try {
      const params = new URLSearchParams();
      const q = searchOverride !== undefined ? searchOverride : userSearch;
      if (q && q.trim()) params.append("search", q.trim());
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Instant real-time filtering for transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (!txSearch.trim()) return true;
    const q = txSearch.toLowerCase().trim();
    const inName = tx.depositor?.name?.toLowerCase().includes(q);
    const inEmail = tx.depositor?.email?.toLowerCase().includes(q);
    const inAccountPhone = tx.depositor?.phone?.toLowerCase().includes(q);
    const inTxPhone = tx.phone?.toLowerCase().includes(q);
    const inUserId = (tx.depositor?.id || tx.userId || "").toLowerCase().includes(q);
    const inTxId = tx.id?.toLowerCase().includes(q);
    const inExtId = tx.externalId?.toLowerCase().includes(q);
    return inName || inEmail || inAccountPhone || inTxPhone || inUserId || inTxId || inExtId;
  });

  // Instant real-time filtering for users
  const filteredUsers = users.filter((u) => {
    const hasDeposits = (u.deposits && u.deposits.length > 0) || (u._count?.deposits && u._count.deposits > 0);
    if (userFilterDeposit === "HAS_DEPOSIT" && !hasDeposits) return false;
    if (userFilterDeposit === "NO_DEPOSIT" && hasDeposits) return false;

    if (userSearch.trim()) {
      const q = userSearch.toLowerCase().trim();
      const inName = u.name?.toLowerCase().includes(q);
      const inEmail = u.email?.toLowerCase().includes(q);
      const inPhone = u.phone?.toLowerCase().includes(q);
      const inId = u.id?.toLowerCase().includes(q);
      const inRef = u.referralCode?.toLowerCase().includes(q);
      const inDepositPhone = u.deposits?.some((d: any) => d.phone?.toLowerCase().includes(q));
      return inName || inEmail || inPhone || inId || inRef || inDepositPhone;
    }
    return true;
  });

  useEffect(() => {
    fetchStats();
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    if (activeTab === "transactions") fetchTransactions();
    if (activeTab === "subscriptions") fetchSubscriptions();
    if (activeTab === "users") fetchUsers();
  }, [activeTab, txFilterStatus, txFilterType, subFilterStatus]);

  // Action sur souscription (APPROVE / REJECT)
  const handleSubscriptionAction = async (investmentId: string, action: "APPROVE" | "REJECT") => {
    setSubActionLoading(investmentId);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investmentId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message, { duration: 6000 });
      fetchSubscriptions();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'action");
    } finally {
      setSubActionLoading(null);
    }
  };

  // Gestion des plans (Ouvrir création)
  const handleOpenCreatePlan = () => {
    setIsEditingPlan(false);
    setPlanForm({
      id: "",
      name: "",
      category: "BANK",
      minAmount: 10000,
      maxAmount: 10000,
      totalReturn: 30000,
      duration: 30,
      vipRequired: 0,
      color: "#10B981",
      icon: "wallet",
      isActive: true,
    });
    setPlanModalOpen(true);
  };

  // Gestion des plans (Ouvrir modification)
  const handleOpenEditPlan = (p: any) => {
    setIsEditingPlan(true);
    const dur = p.duration || 30;
    const tot = p.totalReturn && p.totalReturn > 0
      ? p.totalReturn
      : Math.round(p.minAmount * (1 + (p.dailyReturn * dur) / 100));
    setPlanForm({
      id: p.id,
      name: p.name,
      category: p.category,
      minAmount: p.minAmount,
      maxAmount: p.maxAmount || p.minAmount,
      totalReturn: tot,
      duration: dur,
      vipRequired: p.vipRequired || 0,
      color: p.color || "#3B82F6",
      icon: p.icon || "wallet",
      isActive: p.isActive,
    });
    setPlanModalOpen(true);
  };

  // Sauvegarder un plan (Création ou Mise à jour)
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanSaveLoading(true);
    try {
      const endpoint = "/api/admin/plans";
      const method = isEditingPlan ? "PUT" : "POST";
      const payload: any = {
        name: planForm.name,
        category: planForm.category,
        minAmount: Number(planForm.minAmount),
        maxAmount: Number(planForm.maxAmount),
        totalReturn: Number(planForm.totalReturn),
        duration: Number(planForm.duration),
        vipRequired: Number(planForm.vipRequired),
        color: planForm.color,
        icon: planForm.icon,
        isActive: planForm.isActive,
      };
      if (isEditingPlan) {
        payload.planId = planForm.id;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      setPlanModalOpen(false);
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement du plan");
    } finally {
      setPlanSaveLoading(false);
    }
  };

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

  // Ouvrir modal utilisateur avec préremplissage
  const handleOpenUserModal = (u: any) => {
    setSelectedUser(u);
    setExactBalance(u.balance !== undefined ? u.balance.toString() : "0");
    setBalanceAdjustAmount("");
    setBalanceMode("EXACT");
    setExactBonusBalance(u.bonusBalance !== undefined ? u.bonusBalance.toString() : "0");
    setSelectedVipLevel(u.vipLevel || 0);
    setSelectedRole(u.role || "USER");
    setUserModalOpen(true);
  };

  // Mettre à jour le solde (exact ou relatif), le bonus, le rôle et le niveau VIP
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setUserActionLoading(true);
    try {
      const payload: any = {
        userId: selectedUser.id,
        vipLevel: selectedVipLevel,
        role: selectedRole,
      };

      if (balanceMode === "EXACT" && exactBalance !== "") {
        payload.balance = parseFloat(exactBalance);
      } else if (balanceMode === "DELTA" && balanceAdjustAmount !== "") {
        payload.balanceDelta = parseFloat(balanceAdjustAmount);
      }

      if (exactBonusBalance !== "") {
        payload.bonusBalance = parseFloat(exactBonusBalance);
      }

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message || "Utilisateur mis à jour avec succès !");
      setUserModalOpen(false);
      setBalanceAdjustAmount("");
      setExactBalance("");
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Erreur de mise à jour");
    } finally {
      setUserActionLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId: string) => {
    setUserActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message || "Compte utilisateur supprimé avec succès !");
      setUserDeleteModalOpen(false);
      setUserToDelete(null);
      setUserModalOpen(false);
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression");
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
            {
              id: "subscriptions",
              label: "Souscriptions",
              icon: FileText,
              count: subscriptions.filter((s) => s.status === "PENDING").length,
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
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              {tx.phone || tx.depositor?.phone || "N/A"}
                            </span>
                            {tx.depositor?.id && (
                              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1 py-0.5 rounded flex items-center gap-0.5">
                                ID: {tx.depositor.id.slice(0, 8)}...
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(tx.depositor.id, "rec-" + tx.id)}
                                  className="text-slate-400 hover:text-white"
                                  title="Copier l'identifiant"
                                >
                                  {copiedId === "rec-" + tx.id ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5" />
                                  )}
                                </button>
                              </span>
                            )}
                          </div>
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
            {/* Filters & Search */}
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

              {/* Recherche rapide par numéro de téléphone ou ID */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") fetchTransactions(); }}
                  placeholder="Rechercher tél, ID client, nom..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-2xl">
              {txLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-16">
                  <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">Aucune transaction trouvée</p>
                  <p className="text-slate-600 text-xs mt-1">
                    Essayez de modifier vos filtres ou termes de recherche.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Utilisateur & Identifiant</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Montant Net</th>
                        <th className="pb-3">Frais</th>
                        <th className="pb-3">Opérateur & N° Téléphone</th>
                        <th className="pb-3">Réf / ID Transaction</th>
                        <th className="pb-3">Statut</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4">
                            <p className="font-bold text-white text-sm">
                              {tx.depositor?.name || "Utilisateur"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{tx.depositor?.email}</p>
                            
                            {/* Identifiant Unique avec bouton Copier */}
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                ID: {(tx.depositor?.id || tx.userId || "").slice(0, 12)}...
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(tx.depositor?.id || tx.userId, "tx-user-" + tx.id)}
                                className="text-slate-400 hover:text-cyan-300 p-0.5 transition-colors"
                                title="Copier l'identifiant du compte"
                              >
                                {copiedId === "tx-user-" + tx.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
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
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-bold text-slate-200 uppercase text-xs">
                                {tx.operator}
                              </span>
                              {tx.type === "DEPOSIT" && (
                                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  Dépôt
                                </span>
                              )}
                            </div>
                            {/* Numéro utilisé pour le dépôt / retrait */}
                            <div className="flex items-center gap-1 text-xs font-mono text-emerald-400 font-black">
                              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{tx.phone || "Non renseigné"}</span>
                            </div>
                            {/* Numéro du compte utilisateur s'il est différent */}
                            {tx.depositor?.phone && tx.depositor.phone !== tx.phone && (
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                Compte: {tx.depositor.phone}
                              </p>
                            )}
                          </td>
                          <td className="py-4 font-mono text-[10px] text-slate-400">
                            {tx.externalId ? (
                              <div>
                                <span className="text-cyan-400 font-bold block">Réf: {tx.externalId}</span>
                                <span className="text-slate-500 text-[9px]">{tx.transactionId || tx.id.slice(0, 10)}</span>
                              </div>
                            ) : (
                              tx.transactionId || tx.id.slice(0, 10)
                            )}
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
            {/* Search Bar & Filtres Déposants */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") fetchUsers(); }}
                  placeholder="Rechercher par nom, email, téléphone ou ID..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors backdrop-blur-xl"
                />
              </div>

              {/* Filtre Déposants */}
              <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10">
                {[
                  { id: "ALL", label: `Tous (${users.length})` },
                  {
                    id: "HAS_DEPOSIT",
                    label: `💰 Déposants (${
                      users.filter((u) => (u.deposits?.length || 0) > 0 || (u._count?.deposits || 0) > 0).length
                    })`,
                  },
                  {
                    id: "NO_DEPOSIT",
                    label: "Sans dépôt",
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setUserFilterDeposit(f.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      userFilterDeposit === f.id
                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Investisseur (Nom, Tél & ID)</th>
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
                    {filteredUsers.map((u) => {
                      const userDeposits = u.deposits || [];
                      const hasDeposits = userDeposits.length > 0 || (u._count?.deposits || 0) > 0;
                      const totalDeposited = userDeposits.reduce(
                        (acc: number, d: any) => acc + (d.status === "SUCCESS" ? d.amount : 0),
                        0
                      );

                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4">
                            <p className="font-bold text-white text-sm">{u.name}</p>
                            
                            {/* Numéro de téléphone en grand et vert */}
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs font-mono font-black text-emerald-400">
                              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{u.phone}</span>
                            </div>

                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{u.email}</p>

                            {/* Identifiant Unique ID avec bouton Copier */}
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                ID: {u.id}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(u.id, "u-id-" + u.id)}
                                className="text-slate-400 hover:text-cyan-300 p-0.5 transition-colors"
                                title="Copier l'identifiant utilisateur"
                              >
                                {copiedId === "u-id-" + u.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {/* Badge Déposant */}
                            {hasDeposits && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                  💰 {userDeposits.length > 0 ? userDeposits.length : u._count?.deposits} Dépôt(s)
                                  {totalDeposited > 0 && ` • ${totalDeposited.toLocaleString()} XAF`}
                                </span>
                                {userDeposits[0]?.phone && userDeposits[0].phone !== u.phone && (
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    (Dépôt via {userDeposits[0].phone})
                                  </span>
                                )}
                              </div>
                            )}
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenUserModal(u)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                              title="Modifier le solde, le bonus ou le niveau VIP"
                            >
                              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                              Modifier
                            </button>
                            <button
                              onClick={() => {
                                setUserToDelete(u);
                                setUserDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all border border-rose-500/20"
                              title="Supprimer définitivement ce compte utilisateur"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: GESTION DES SOUSCRIPTIONS DE PLANS */}
        {activeTab === "subscriptions" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header & Filtres */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-black text-white">Souscriptions aux Plans d'Investissement</h3>
                  <p className="text-xs text-slate-400">
                    Validez le paiement des souscriptions pour activer le plan et verser les 5 000 FCFA au parrain.
                  </p>
                </div>
              </div>

              {/* Filtres de statut */}
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                {[
                  { id: "PENDING", label: "En Attente" },
                  { id: "ACTIVE", label: "Actives" },
                  { id: "ALL", label: "Toutes" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSubFilterStatus(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      subFilterStatus === f.id
                        ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table des souscriptions */}
            <div className="rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider bg-white/[0.02]">
                      <th className="p-4">Investisseur</th>
                      <th className="p-4">Plan Souscrit</th>
                      <th className="p-4">Montant</th>
                      <th className="p-4">Gain Total (30j)</th>
                      <th className="p-4">Dividende / Jour</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subLoading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <Clock className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                          Chargement des souscriptions...
                        </td>
                      </tr>
                    ) : subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          Aucune souscription trouvée pour ce filtre.
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((s) => {
                        const dur = s.plan?.duration || 30;
                        const expTotal = s.plan?.totalReturn && s.plan.totalReturn > 0
                          ? s.plan.totalReturn
                          : Math.round(s.amount * (1 + (s.dailyReturn * dur) / 100));
                        const daily = Math.round(expTotal / dur);

                        return (
                          <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-white">{s.user?.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {s.user?.phone} • {s.user?.email}
                              </p>
                              {s.user?.referredBy && (
                                <p className="text-[9px] text-amber-400 mt-0.5">
                                  Parrainé par : {s.user.referredBy} (Bonus 1 000 FCFA éligible)
                                </p>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-white">{s.plan?.name}</span>
                              <span className="block text-[10px] text-cyan-400 uppercase font-mono">
                                {s.plan?.category}
                              </span>
                            </td>
                            <td className="p-4 font-black text-white text-sm">
                              {s.amount.toLocaleString()} XAF
                            </td>
                            <td className="p-4 font-black text-yellow-400">
                              {expTotal.toLocaleString()} XAF
                            </td>
                            <td className="p-4 font-black text-emerald-400">
                              +{daily.toLocaleString()} XAF/j
                            </td>
                            <td className="p-4 text-slate-400 text-[11px]">
                              {new Date(s.createdAt).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                  s.status === "ACTIVE"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : s.status === "PENDING"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                }`}
                              >
                                {s.status === "PENDING"
                                  ? "EN ATTENTE"
                                  : s.status === "ACTIVE"
                                  ? "ACTIF"
                                  : s.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {s.status === "PENDING" ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleSubscriptionAction(s.id, "APPROVE")}
                                    disabled={subActionLoading === s.id}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md shadow-emerald-500/20"
                                    title="Valider le paiement, activer le plan et verser 1 000 FCFA au parrain"
                                  >
                                    {subActionLoading === s.id ? "Validation..." : "Valider Paiement"}
                                  </button>
                                  <button
                                    onClick={() => handleSubscriptionAction(s.id, "REJECT")}
                                    disabled={subActionLoading === s.id}
                                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold transition-all"
                                  >
                                    Rejeter
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {s.status === "ACTIVE" ? "Plan en cours" : "Traité"}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
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
            {/* Header de la gestion des plans */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-black text-white">Gestion des Plans d'Investissement</h3>
                  <p className="text-xs text-slate-400">
                    Créez et modifiez les montants, le gain total garanti et les versements quotidiens sur 30 jours.
                  </p>
                </div>
              </div>

              {/* Bouton Créer un Plan */}
              <button
                onClick={handleOpenCreatePlan}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                + Nouveau Plan
              </button>
            </div>

            {/* Grille des Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map((p) => {
                const dur = p.duration || 30;
                const total = p.totalReturn && p.totalReturn > 0
                  ? p.totalReturn
                  : Math.round(p.minAmount * (1 + (p.dailyReturn * dur) / 100));
                const daily = Math.round(total / dur);

                return (
                  <div
                    key={p.id}
                    className={`rounded-3xl p-6 border transition-all relative overflow-hidden backdrop-blur-xl flex flex-col justify-between ${
                      p.isActive
                        ? "bg-slate-900/70 border-white/10 shadow-xl"
                        : "bg-slate-900/30 border-dashed border-white/10 opacity-60"
                    }`}
                  >
                    <div
                      className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none"
                      style={{ backgroundColor: p.color || "#3b82f6" }}
                    />

                    <div>
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
                      
                      {/* Gains journaliers */}
                      <p className="text-2xl font-black text-emerald-400 tracking-tight mb-4">
                        +{daily.toLocaleString()} XAF{" "}
                        <span className="text-xs text-slate-400 font-normal">/ jour</span>
                      </p>

                      <div className="space-y-2 text-xs text-slate-300 font-mono mb-6 bg-white/[0.03] p-3.5 rounded-2xl border border-white/5">
                        <p className="flex justify-between">
                          <span className="text-slate-500">Investissement :</span>
                          <span className="font-bold text-white">{p.minAmount.toLocaleString()} XAF</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-500">Total à Gagner :</span>
                          <span className="font-bold text-yellow-400">{total.toLocaleString()} XAF</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-500">Durée :</span>
                          <span>{dur} jours</span>
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
                    </div>

                    <div className="space-y-2">
                      {/* Bouton Modifier les montants */}
                      <button
                        onClick={() => handleOpenEditPlan(p)}
                        className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        Modifier les montants
                      </button>

                      {/* Bouton Activer / Désactiver */}
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
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>

      {/* MODAL: AJUSTER SOLDE / VIP UTILISATEUR */}
      <AnimatePresence>
        {/* MODAL: GESTION COMPLÈTE UTILISATEUR & MODIFICATION DE SOLDE */}
        {userModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0e1626] border border-cyan-500/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 my-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-black text-white">Gestion de l'Utilisateur</h3>
                  <p className="text-xs text-cyan-400 font-mono">
                    {selectedUser.name} • {selectedUser.email}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {selectedUser.phone}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                      ID: {selectedUser.id}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedUser.id, "modal-" + selectedUser.id)}
                        className="text-slate-400 hover:text-white p-0.5 ml-1 transition-colors"
                        title="Copier l'identifiant"
                      >
                        {copiedId === "modal-" + selectedUser.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setUserModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Visualisation des soldes actuels */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">
                      Solde Principal Actuel
                    </span>
                    <span className="text-base font-black text-emerald-400">
                      {selectedUser.balance.toLocaleString()} XAF
                    </span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">
                      Bonus Parrainage Actuel
                    </span>
                    <span className="text-base font-black text-amber-400">
                      {(selectedUser.bonusBalance || 0).toLocaleString()} XAF
                    </span>
                  </div>
                </div>

                {/* Sélecteur de mode de solde */}
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                      Modifier le Solde Principal
                    </label>
                    <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/10 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setBalanceMode("EXACT")}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          balanceMode === "EXACT"
                            ? "bg-cyan-500 text-black shadow-md font-black"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Nouveau Solde Fixe
                      </button>
                      <button
                        type="button"
                        onClick={() => setBalanceMode("DELTA")}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          balanceMode === "DELTA"
                            ? "bg-cyan-500 text-black shadow-md font-black"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Ajuster (+ / -)
                      </button>
                    </div>
                  </div>

                  {balanceMode === "EXACT" ? (
                    <div>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={exactBalance}
                        onChange={(e) => setExactBalance(e.target.value)}
                        placeholder="Entrez le solde exact voulu (ex: 150000)"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-emerald-400 font-mono text-sm font-black focus:outline-none focus:border-cyan-400"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Le solde principal de l'utilisateur deviendra exactement ce montant en XAF.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="number"
                        step="any"
                        value={balanceAdjustAmount}
                        onChange={(e) => setBalanceAdjustAmount(e.target.value)}
                        placeholder="Ex: 50000 pour ajouter, -20000 pour déduire"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Valeur positive pour créditer, valeur négative pour débiter.
                      </p>
                    </div>
                  )}
                </div>

                {/* Modifier le Bonus de Parrainage */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                    Solde Bonus Parrainage (XAF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={exactBonusBalance}
                    onChange={(e) => setExactBonusBalance(e.target.value)}
                    placeholder="Montant du bonus parrainage"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-amber-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Rôle & Niveau VIP */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Rôle Système
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-cyan-500"
                    >
                      <option value="USER">Utilisateur (USER)</option>
                      <option value="ADMIN">Administrateur (ADMIN)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Niveau VIP (0 à 5)
                    </label>
                    <div className="grid grid-cols-6 gap-1">
                      {[0, 1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSelectedVipLevel(lvl)}
                          className={`py-2 rounded-lg text-xs font-black transition-all ${
                            selectedVipLevel === lvl
                              ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/30"
                              : "bg-white/5 text-slate-400 hover:text-white"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Zone de Danger: Supprimer ce compte */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Besoin de retirer cet utilisateur ?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUserToDelete(selectedUser);
                      setUserDeleteModalOpen(true);
                    }}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer ce compte
                  </button>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleUpdateUser}
                  disabled={userActionLoading}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20"
                >
                  {userActionLoading ? "Enregistrement..." : "Appliquer les Modifications"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: CONFIRMATION SUPPRESSION DÉFINITIVE D'UN COMPTE UTILISATEUR */}
        {userDeleteModalOpen && userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#12111d] border border-rose-500/40 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3 text-rose-400 border-b border-rose-500/20 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Supprimer ce Compte ?</h3>
                  <p className="text-xs text-rose-300 font-mono">Action irréversible</p>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2 text-xs text-slate-300">
                <p>
                  Êtes-vous sûr de vouloir supprimer définitivement le compte de{" "}
                  <strong className="text-white font-bold">{userToDelete.name}</strong> ?
                </p>
                <div className="text-[11px] font-mono text-slate-400 pt-1 space-y-0.5">
                  <p>📧 Email : {userToDelete.email}</p>
                  <p>📱 Téléphone : {userToDelete.phone}</p>
                  <p>💰 Solde : {userToDelete.balance?.toLocaleString()} XAF</p>
                </div>
                <p className="text-[10px] text-rose-400/80 pt-2 border-t border-white/5">
                  ⚠️ Tous les investissements, gains, dépôts, retraits et notifications liés à cet utilisateur seront également supprimés.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUserDeleteModalOpen(false);
                    setUserToDelete(null);
                  }}
                  disabled={userActionLoading}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteUser(userToDelete.id)}
                  disabled={userActionLoading}
                  className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2"
                >
                  {userActionLoading ? "Suppression..." : "Confirmer la Suppression"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: CRÉER / MODIFIER UN PLAN D'INVESTISSEMENT */}
        {planModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0e1628] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-5 my-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {isEditingPlan ? "Modifier le Plan d'Investissement" : "Nouveau Plan d'Investissement"}
                  </h3>
                  <p className="text-xs text-cyan-400 font-mono">
                    {isEditingPlan ? `ID : ${planForm.id}` : "Configuration du contrat & dividendes"}
                  </p>
                </div>
                <button
                  onClick={() => setPlanModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Nom du plan */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                      Nom du Plan
                    </label>
                    <input
                      type="text"
                      required
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      placeholder="Ex: Plan Bronze Épargne"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-bold"
                    />
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                      Catégorie
                    </label>
                    <select
                      value={planForm.category}
                      onChange={(e) => setPlanForm({ ...planForm, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-bold"
                    >
                      <option value="BANK">Bancaire (BANK)</option>
                      <option value="NORMAL">Standard (NORMAL)</option>
                    </select>
                  </div>

                  {/* VIP Requis */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                      VIP Requis (0 à 5)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={planForm.vipRequired}
                      onChange={(e) => setPlanForm({ ...planForm, vipRequired: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-bold"
                    />
                  </div>
                </div>

                {/* Montants : Investissement, Total à Gagner, Durée */}
                <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Montant d'investissement */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-cyan-400 mb-1 tracking-wider">
                        Montant Investi (XAF)
                      </label>
                      <input
                        type="number"
                        required
                        min="100"
                        value={planForm.minAmount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setPlanForm({ ...planForm, minAmount: val, maxAmount: val });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-white text-sm font-black focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Montant Total à Gagner */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-yellow-400 mb-1 tracking-wider">
                        Total à Gagner (XAF)
                      </label>
                      <input
                        type="number"
                        required
                        min="100"
                        value={planForm.totalReturn}
                        onChange={(e) => setPlanForm({ ...planForm, totalReturn: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-yellow-500/30 text-yellow-400 text-sm font-black focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  {/* Durée en jours */}
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                        Durée du Contrat (Jours)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={planForm.duration}
                        onChange={(e) => setPlanForm({ ...planForm, duration: parseInt(e.target.value) || 30 })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Aperçu en direct du dividende quotidien */}
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-right">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Gain Journalier</span>
                      <span className="text-emerald-400 font-black text-sm">
                        +{planForm.duration > 0 ? Math.round(planForm.totalReturn / planForm.duration).toLocaleString() : 0} XAF/j
                      </span>
                    </div>
                  </div>
                </div>

                {/* Couleur et Icône */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                      Couleur Thème
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={planForm.color}
                        onChange={(e) => setPlanForm({ ...planForm, color: e.target.value })}
                        className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={planForm.color}
                        onChange={(e) => setPlanForm({ ...planForm, color: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                      Icône
                    </label>
                    <select
                      value={planForm.icon}
                      onChange={(e) => setPlanForm({ ...planForm, icon: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-bold"
                    >
                      <option value="wallet">Portefeuille (wallet)</option>
                      <option value="credit-card">Carte (credit-card)</option>
                      <option value="landmark">Banque (landmark)</option>
                      <option value="shield-check">Bouclier (shield-check)</option>
                      <option value="gem">Diamant (gem)</option>
                      <option value="crown">Couronne (crown)</option>
                      <option value="pickaxe">Mine (pickaxe)</option>
                    </select>
                  </div>
                </div>

                {/* Statut actif */}
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="planActiveCheck"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/10"
                  />
                  <label htmlFor="planActiveCheck" className="text-xs font-bold text-slate-300 cursor-pointer">
                    Plan actif et visible pour les investisseurs
                  </label>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setPlanModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={planSaveLoading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20"
                  >
                    {planSaveLoading ? "Enregistrement..." : isEditingPlan ? "Mettre à jour" : "Créer le Plan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
