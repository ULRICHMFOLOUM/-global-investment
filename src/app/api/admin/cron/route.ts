import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
        plan: true,
      },
    });

    let totalYieldDistributed = 0;
    const payouts: any[] = [];
    const now = new Date();

    for (const inv of activeInvestments) {
      const duration = inv.plan.duration || 30;
      // Gain par jour virtuel = Montant total / 30 jours (ou calculé selon le ROI journalier)
      const dailyGain = inv.plan.totalReturn && inv.plan.totalReturn > 0
        ? Math.round(inv.plan.totalReturn / duration)
        : Math.round((inv.amount * inv.dailyReturn) / 100);

      const isExpired = now >= inv.endDate;

      await prisma.$transaction(async (tx) => {
        // 1. Enregistrer le gain
        await tx.gain.create({
          data: {
            userId: inv.userId,
            investmentId: inv.id,
            amount: dailyGain,
          },
        });

        // 2. Créditer le solde de l'utilisateur
        await tx.user.update({
          where: { id: inv.userId },
          data: { balance: { increment: dailyGain } },
        });

        // 3. Mettre à jour l'investissement
        await tx.investment.update({
          where: { id: inv.id },
          data: {
            totalReturn: { increment: dailyGain },
            status: isExpired ? "COMPLETED" : "ACTIVE",
          },
        });

        // 4. Notifier l'utilisateur
        await tx.notification.create({
          data: {
            userId: inv.userId,
            title: `📈 Dividende Quotidien (+${dailyGain.toLocaleString()} XAF)`,
            message: `Votre dividende journalier de ${dailyGain.toLocaleString()} XAF pour votre plan "${inv.plan.name}" a été ajouté à votre solde disponible !`,
            type: "GAIN",
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
      message: `Cycle de dividendes exécuté avec succès ! ${totalYieldDistributed.toLocaleString()} XAF distribués à ${activeInvestments.length} investissements actifs. Tous les utilisateurs ont été notifiés.`,
      activeInvestmentsCount: activeInvestments.length,
      totalYieldDistributed,
      payouts,
    });
  } catch (error: any) {
    console.error("Admin cron trigger error:", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
