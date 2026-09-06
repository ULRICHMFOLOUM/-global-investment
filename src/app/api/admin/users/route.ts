import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

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
      take: 50,
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

    const { userId, balanceDelta, vipLevel, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "User ID manquant" }, { status: 400 });
    }

    const updateData: any = {};

    if (balanceDelta !== undefined && !isNaN(Number(balanceDelta))) {
      updateData.balance = { increment: Number(balanceDelta) };
    }

    if (vipLevel !== undefined && !isNaN(Number(vipLevel))) {
      updateData.vipLevel = Math.max(0, Math.min(5, Number(vipLevel)));
    }

    if (role && ["USER", "ADMIN"].includes(role)) {
      updateData.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        vipLevel: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Utilisateur mis à jour avec succès`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Admin user PUT error:", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
