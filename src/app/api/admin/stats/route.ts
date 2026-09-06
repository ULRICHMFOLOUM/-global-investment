import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Accès refusé. Réservé aux administrateurs." }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      todayUsers,
      totalDepositsAgg,
      totalWithdrawalsAgg,
      pendingDepositsAgg,
      pendingWithdrawalsAgg,
      activeInvestmentsAgg,
      allTransactions,
      recentUsers,
      plansWithCount,
      gainsTodayAgg,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.transaction.aggregate({
        where: { type: "DEPOSIT", status: "SUCCESS" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { type: "WITHDRAWAL", status: "SUCCESS" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { type: "DEPOSIT", status: "PENDING" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { type: "WITHDRAWAL", status: "PENDING" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.investment.aggregate({
        where: { status: "ACTIVE" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          depositor: {
            select: { name: true, email: true, phone: true },
          },
        },
      }),
      prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          country: true,
          balance: true,
          vipLevel: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.plan.findMany({
        include: {
          _count: {
            select: { investments: true },
          },
        },
        orderBy: { minAmount: "asc" },
      }),
      prisma.gain.aggregate({
        where: { date: { gte: today } },
        _sum: { amount: true },
      }),
    ]);

    const totalDeposited = totalDepositsAgg._sum.amount || 0;
    const totalWithdrawn = totalWithdrawalsAgg._sum.amount || 0;
    const netReserve = totalDeposited - totalWithdrawn;

    // Simulation de données graphiques sur 7 jours
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
      
      chartData.push({
        day: dayLabel,
        deposits: Math.round(totalDeposited * (0.08 + Math.sin(i + 1) * 0.04)),
        withdrawals: Math.round(totalWithdrawn * (0.06 + Math.cos(i + 1) * 0.03)),
        yield: Math.round((activeInvestmentsAgg._sum.amount || 50000) * 0.05),
      });
    }

    return NextResponse.json({
      metrics: {
        totalUsers,
        todayUsers,
        totalDeposited,
        totalWithdrawn,
        netReserve,
        pendingDepositsCount: pendingDepositsAgg._count,
        pendingDepositsAmount: pendingDepositsAgg._sum.amount || 0,
        pendingWithdrawalsCount: pendingWithdrawalsAgg._count,
        pendingWithdrawalsAmount: pendingWithdrawalsAgg._sum.amount || 0,
        activeInvestmentsCount: activeInvestmentsAgg._count,
        activeInvestmentsVolume: activeInvestmentsAgg._sum.amount || 0,
        gainsDistributedToday: gainsTodayAgg._sum.amount || 0,
      },
      chartData,
      recentTransactions: allTransactions,
      recentUsers,
      plans: plansWithCount,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ message: "Erreur serveur admin", error: error.message }, { status: 500 });
  }
}
