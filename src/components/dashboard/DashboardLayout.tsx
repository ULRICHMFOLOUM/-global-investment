"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home, TrendingUp, DollarSign, CreditCard,
  User, LogOut, Sun, Moon, Users, ShieldCheck,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "@/components/providers/ThemeProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/invest", label: "Investir", icon: TrendingUp },
  { href: "/dashboard/gains", label: "Gains", icon: DollarSign },
  { href: "/dashboard/banque", label: "Banque", icon: CreditCard },
  { href: "/dashboard/partenariat", label: "Filleuls", icon: Users },
  { href: "/dashboard/profil", label: "Profil", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  const isAdmin =
    (session?.user as any)?.role === "ADMIN" ||
    session?.user?.email === "ulrichmfoloum@gmail.com";

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 h-14 flex items-center justify-between border-b"
        style={{
          background: "var(--navbar-bg)",
          backdropFilter: "blur(20px)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
          >
            <TrendingUp className="w-4 h-4 text-white" />
          </motion.div>
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>
            Global<span className="text-blue-400">Invest</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400 hover:text-cyan-300 font-bold text-xs shadow-lg transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}
          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-all"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </motion.button>

          <span className="text-sm hidden sm:block" style={{ color: "var(--text-secondary)" }}>
            {session?.user?.name}
          </span>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-slate-400 hover:text-red-400 transition-colors p-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">{children}</main>

      {/* Bottom nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t"
        style={{
          background: "var(--navbar-bg)",
          backdropFilter: "blur(20px)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex max-w-2xl mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center py-2.5 gap-0.5 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full"
                  />
                )}
                <item.icon
                  className={`w-5 h-5 transition-colors ${isActive ? "text-blue-400" : "text-slate-500"}`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${isActive ? "text-blue-400" : "text-slate-500"}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
