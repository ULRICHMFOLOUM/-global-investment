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

    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: { investments: true },
        },
      },
      orderBy: { minAmount: "asc" },
    });

    return NextResponse.json(plans);
  } catch (error: any) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const { planId, isActive, dailyReturn, minAmount, maxAmount } = await req.json();

    if (!planId) {
      return NextResponse.json({ message: "Plan ID requis" }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (dailyReturn !== undefined) updateData.dailyReturn = Number(dailyReturn);
    if (minAmount !== undefined) updateData.minAmount = Number(minAmount);
    if (maxAmount !== undefined) updateData.maxAmount = Number(maxAmount);

    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Plan "${updatedPlan.name}" mis à jour avec succès`,
      plan: updatedPlan,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
