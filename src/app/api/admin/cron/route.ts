import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const activeInvestments = await prisma.investment.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { name: true } },
      },
    });

    let totalYieldDistributed = 0;
    const payouts: any[] = [];
    const now = new Date();

    for (const inv of activeInvestments) {
      const dailyGain = (inv.amount * inv.dailyReturn) / 100;
      const isExpired = now >= inv.endDate;

      await prisma.$transaction(async (tx) => {
        await tx.gain.create({
          data: {
            userId: inv.userId,
            investmentId: inv.id,
            amount: dailyGain,
          },
        });

        await tx.user.update({
          where: { id: inv.userId },
          data: { balance: { increment: dailyGain } },
        });

        await tx.investment.update({
          where: { id: inv.id },
          data: {
            totalReturn: { increment: dailyGain },
            status: isExpired ? "COMPLETED" : "ACTIVE",
          },
        });
      });

      totalYieldDistributed += dailyGain;
      payouts.push({
        investmentId: inv.id,
        userName: inv.user.name,
        planName: inv.plan.name,
        amountInvested: inv.amount,
        gainDistributed: dailyGain,
        isCompleted: isExpired,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Cycle de dividendes exécuté avec succès ! ${totalYieldDistributed.toLocaleString()} XAF distribués à ${activeInvestments.length} investissements actifs.`,
      activeInvestmentsCount: activeInvestments.length,
      totalYieldDistributed,
      payouts,
    });
  } catch (error: any) {
    console.error("Admin cron trigger error:", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
