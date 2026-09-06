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
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const whereClause: any = {};
    if (status && status !== "ALL") whereClause.status = status;
    if (type && type !== "ALL") whereClause.type = type;

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        depositor: {
          select: { id: true, name: true, email: true, phone: true, country: true, balance: true },
        },
      },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Admin transactions GET error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const { transactionId, action } = await req.json();

    if (!transactionId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ message: "Paramètres invalides" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ message: "Transaction introuvable" }, { status: 404 });
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json(
        { message: `Cette transaction est déjà au statut ${transaction.status}` },
        { status: 400 }
      );
    }

    if (transaction.type === "DEPOSIT") {
      if (action === "APPROVE") {
        await prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: { status: "SUCCESS" },
          });

          await tx.user.update({
            where: { id: transaction.userId },
            data: { balance: { increment: transaction.amount } },
          });

          // Parrainage bonus 5%
          const user = await tx.user.findUnique({
            where: { id: transaction.userId },
          });
          if (user?.referredBy && transaction.amount >= 500) {
            const bonus = Math.floor(transaction.amount * 0.05);
            await tx.user.update({
              where: { id: user.referredBy },
              data: { bonusBalance: { increment: bonus } },
            }).catch(() => {});
          }
        });

        return NextResponse.json({
          success: true,
          message: `Dépôt de ${transaction.amount.toLocaleString()} XAF approuvé et crédité.`,
        });
      } else {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "FAILED" },
        });

        return NextResponse.json({
          success: true,
          message: `Dépôt rejeté.`,
        });
      }
    } else if (transaction.type === "WITHDRAWAL") {
      if (action === "APPROVE") {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "SUCCESS" },
        });

        return NextResponse.json({
          success: true,
          message: `Retrait de ${transaction.amount.toLocaleString()} XAF validé avec succès.`,
        });
      } else {
        // En cas de rejet du retrait, on rembourse le solde de l'utilisateur (net + frais)
        const totalRefund = transaction.amount + (transaction.fee || 0);
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: "FAILED" },
          }),
          prisma.user.update({
            where: { id: transaction.userId },
            data: { balance: { increment: totalRefund } },
          }),
        ]);

        return NextResponse.json({
          success: true,
          message: `Retrait rejeté. ${totalRefund.toLocaleString()} XAF remboursés sur le solde de l'utilisateur.`,
        });
      }
    }

    return NextResponse.json({ message: "Action non gérée" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin transactions POST error:", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
