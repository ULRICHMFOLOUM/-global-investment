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
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { referralCode: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        balance: true,
        bonusBalance: true,
        vipLevel: true,
        role: true,
        referralCode: true,
        referredBy: true,
        createdAt: true,
        _count: {
          select: {
            investments: true,
            deposits: true,
          },
        },
        deposits: {
          where: { type: "DEPOSIT" },
          select: {
            id: true,
            amount: true,
            status: true,
            operator: true,
            phone: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const { userId, balance, balanceDelta, bonusBalance, vipLevel, role, name, phone } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "User ID manquant" }, { status: 400 });
    }

    const updateData: any = {};

    // Définir un solde exact directement
    if (balance !== undefined && balance !== "" && !isNaN(Number(balance))) {
      updateData.balance = Math.max(0, Number(balance));
    } else if (balanceDelta !== undefined && balanceDelta !== "" && !isNaN(Number(balanceDelta))) {
      // Ajustement relatif (+/-)
      updateData.balance = { increment: Number(balanceDelta) };
    }

    // Définir le bonus de parrainage
    if (bonusBalance !== undefined && bonusBalance !== "" && !isNaN(Number(bonusBalance))) {
      updateData.bonusBalance = Math.max(0, Number(bonusBalance));
    }

    // Modifier le niveau VIP
    if (vipLevel !== undefined && !isNaN(Number(vipLevel))) {
      updateData.vipLevel = Math.max(0, Math.min(5, Number(vipLevel)));
    }

    // Modifier le rôle (ADMIN ou USER)
    if (role && ["USER", "ADMIN"].includes(role)) {
      updateData.role = role;
    }

    if (name && typeof name === "string") {
      updateData.name = name.trim();
    }

    if (phone && typeof phone === "string") {
      updateData.phone = phone.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        balance: true,
        bonusBalance: true,
        vipLevel: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Utilisateur ${updatedUser.name} mis à jour avec succès (Solde : ${updatedUser.balance.toLocaleString()} XAF)`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Admin user PUT error:", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    let userId: string | null = null;
    const { searchParams } = new URL(req.url);
    userId = searchParams.get("userId");

    if (!userId) {
      try {
        const body = await req.json();
        userId = body?.userId;
      } catch {}
    }

    if (!userId) {
      return NextResponse.json({ message: "Identifiant utilisateur manquant" }, { status: 400 });
    }

    if (admin.user.id === userId) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas supprimer votre propre compte administrateur connecté." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
    }

    // Suppression en cascade sécurisée de toutes les dépendances de l'utilisateur
    await prisma.$transaction(async (tx) => {
      // 1. Supprimer les gains journaliers
      await tx.gain.deleteMany({
        where: { userId },
      });

      // 2. Supprimer les investissements
      await tx.investment.deleteMany({
        where: { userId },
      });

      // 3. Supprimer les transactions (dépôts / retraits)
      await tx.transaction.deleteMany({
        where: { userId },
      });

      // 4. Supprimer les notifications
      await tx.notification.deleteMany({
        where: { userId },
      });

      // 5. Dissocier les filleuls référés par cet utilisateur
      await tx.user.updateMany({
        where: { referredBy: userId },
        data: { referredBy: null },
      });
      await tx.user.updateMany({
        where: { referredBy: targetUser.email },
        data: { referredBy: null },
      });

      // 6. Supprimer le compte utilisateur
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({
      success: true,
      message: `L'utilisateur ${targetUser.name} (${targetUser.email}) a été définitivement supprimé avec toutes ses données associées.`,
    });
  } catch (error: any) {
    console.error("Admin user DELETE error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de l'utilisateur", error: error.message },
      { status: 500 }
    );
  }
}
