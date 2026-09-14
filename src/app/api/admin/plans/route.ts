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
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      category = "BANK",
      minAmount,
      maxAmount,
      totalReturn,
      dailyReturn,
      duration = 30,
      vipRequired = 0,
      color = "#3B82F6",
      icon = "wallet",
      isActive = true,
    } = body;

    if (!name || minAmount === undefined) {
      return NextResponse.json({ message: "Nom et montant du plan requis" }, { status: 400 });
    }

    const numMin = Number(minAmount);
    const numDuration = Number(duration) || 30;
    const numTotal = totalReturn !== undefined ? Number(totalReturn) : undefined;
    
    // Calcul automatique du dailyReturn si totalReturn est spécifié
    let computedDailyReturn = dailyReturn !== undefined ? Number(dailyReturn) : 0;
    if (numTotal !== undefined && numMin > 0 && numDuration > 0) {
      // Pourcentage par jour : (total / duration / minAmount) * 100
      computedDailyReturn = Number(((numTotal / numDuration / numMin) * 100).toFixed(2));
    }

    const newPlan = await prisma.plan.create({
      data: {
        name,
        category,
        minAmount: numMin,
        maxAmount: maxAmount !== undefined ? Number(maxAmount) : numMin,
        totalReturn: numTotal !== undefined ? numTotal : (numMin * (computedDailyReturn / 100) * numDuration),
        dailyReturn: computedDailyReturn,
        duration: numDuration,
        vipRequired: Number(vipRequired) || 0,
        color,
        icon,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Plan "${newPlan.name}" créé avec succès !`,
      plan: newPlan,
    });
  } catch (error: any) {
    console.error("Admin create plan error:", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const {
      planId,
      name,
      category,
      isActive,
      dailyReturn,
      totalReturn,
      minAmount,
      maxAmount,
      duration,
      vipRequired,
      color,
      icon,
    } = body;

    if (!planId) {
      return NextResponse.json({ message: "Plan ID requis" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (duration !== undefined) updateData.duration = Number(duration);
    if (vipRequired !== undefined) updateData.vipRequired = Number(vipRequired);
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;

    if (minAmount !== undefined) updateData.minAmount = Number(minAmount);
    if (maxAmount !== undefined) updateData.maxAmount = Number(maxAmount);
    if (totalReturn !== undefined) updateData.totalReturn = Number(totalReturn);

    // Ajustement de dailyReturn si fourni ou recalculé
    if (dailyReturn !== undefined) {
      updateData.dailyReturn = Number(dailyReturn);
    } else if (totalReturn !== undefined && (minAmount !== undefined || duration !== undefined)) {
      const existing = await prisma.plan.findUnique({ where: { id: planId } });
      if (existing) {
        const pMin = minAmount !== undefined ? Number(minAmount) : existing.minAmount;
        const pDur = duration !== undefined ? Number(duration) : existing.duration;
        if (pMin > 0 && pDur > 0) {
          updateData.dailyReturn = Number(((Number(totalReturn) / pDur / pMin) * 100).toFixed(2));
        }
      }
    }

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

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const planId = searchParams.get("planId");

    if (!planId) {
      return NextResponse.json({ message: "Plan ID requis" }, { status: 400 });
    }

    const investmentsCount = await prisma.investment.count({ where: { planId } });
    if (investmentsCount > 0) {
      // Soft-delete if investments exist
      await prisma.plan.update({
        where: { id: planId },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: "Plan désactivé car des souscriptions y sont rattachées.",
      });
    }

    await prisma.plan.delete({ where: { id: planId } });
    return NextResponse.json({ success: true, message: "Plan supprimé avec succès." });
  } catch (error: any) {
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
