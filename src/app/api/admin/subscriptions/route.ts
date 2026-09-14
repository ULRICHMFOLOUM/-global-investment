import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";

    const whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const subscriptions = await prisma.investment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
            referralCode: true,
            referredBy: true,
            balance: true,
          },
        },
        plan: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(subscriptions);
  } catch (error: any) {
    console.error("Admin subscriptions GET error:", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const { investmentId, action } = await req.json();

    if (!investmentId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ message: "Paramètres invalides" }, { status: 400 });
    }

    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
      include: {
        user: true,
        plan: true,
      },
    });

    if (!investment) {
      return NextResponse.json({ message: "Souscription introuvable" }, { status: 404 });
    }

    if (investment.status !== "PENDING") {
      return NextResponse.json(
        { message: `Cette souscription est déjà au statut ${investment.status}` },
        { status: 400 }
      );
    }

    if (action === "APPROVE") {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + (investment.plan.duration || 30));

      await prisma.$transaction(async (tx) => {
        // 1. Activer l'investissement
        await tx.investment.update({
          where: { id: investment.id },
          data: {
            status: "ACTIVE",
            startDate: now,
            endDate,
          },
        });

        // 2. Bonus de parrainage de 5 000 FCFA virtuel au parrain
        if (investment.user.referredBy) {
          const referrer = await tx.user.findFirst({
            where: {
              OR: [
                { id: investment.user.referredBy },
                { referralCode: investment.user.referredBy },
              ],
            },
          });

          if (referrer) {
            // Crédit de 1 000 FCFA sur le solde du parrain
            await tx.user.update({
              where: { id: referrer.id },
              data: {
                balance: { increment: 1000 },
                bonusBalance: { increment: 1000 },
              },
            });

            // Enregistrer la transaction bonus
            await tx.transaction.create({
              data: {
                userId: referrer.id,
                amount: 1000,
                type: "BONUS",
                status: "SUCCESS",
                operator: "SYSTEM",
                phone: referrer.phone,
                transactionId: `BONUS-REF-${Date.now()}`,
                country: referrer.country || "CM",
              },
            });

            // Notifier le parrain
            await tx.notification.create({
              data: {
                userId: referrer.id,
                title: "🎉 Bonus de Parrainage (+1 000 FCFA) !",
                message: `Félicitations ! Votre filleul ${investment.user.name} a souscrit au plan "${investment.plan.name}". Vous avez reçu 1 000 FCFA sur votre solde disponible !`,
                type: "BONUS",
              },
            });
          }
        }

        // 3. Notifier le souscripteur
        await tx.notification.create({
          data: {
            userId: investment.userId,
            title: "✅ Souscription Validée !",
            message: `Votre paiement pour le plan "${investment.plan.name}" (${investment.amount.toLocaleString()} XAF) a été validé avec succès par l'administrateur. Vos dividendes quotidiens sont désormais activés !`,
            type: "PLAN",
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Souscription de ${investment.user.name} (${investment.plan.name}) validée et activée ! Bonus parrainage 1000 XAF traité.`,
      });
    } else {
      // REJECT
      await prisma.$transaction(async (tx) => {
        await tx.investment.update({
          where: { id: investment.id },
          data: { status: "REJECTED" },
        });

        await tx.notification.create({
          data: {
            userId: investment.userId,
            title: "❌ Souscription Rejetée",
            message: `Votre demande de souscription pour le plan "${investment.plan.name}" n'a pas été validée par l'administrateur. Veuillez contacter le support.`,
            type: "PLAN",
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Souscription rejetée.`,
      });
    }
  } catch (error: any) {
    console.error("Admin subscriptions POST error:", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
