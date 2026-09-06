import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const input = await req.json();
  try {
    const { name, email, phone, password, country, referralCode } = input;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 },
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanName = name.trim();

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: cleanEmail }, { phone: cleanPhone }] },
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email ou téléphone déjà utilisé" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Chercher le parrain si code fourni
    let referrerId: string | undefined;
    if (referralCode && typeof referralCode === "string" && referralCode.trim()) {
      const cleanRef = referralCode.trim();
      const referrer = await prisma.user.findFirst({
        where: {
          OR: [
            { referralCode: cleanRef },
            { id: cleanRef },
          ],
        },
      });
      if (referrer) referrerId = referrer.id;
    }

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedPassword,
        country: country || "CM",
        referredBy: referrerId,
      },
    });

    // Bonus de bienvenue de parrainage pour le parrain (500 XAF)
    if (referrerId) {
      await prisma.user.update({
        where: { id: referrerId },
        data: { bonusBalance: { increment: 500 } },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("❌ Erreur inscription détaillée:", {
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      meta: (error as any)?.meta,
      name: input.name?.slice(0, 20) || "N/A",
      email: input.email || "N/A",
      phone: input.phone || "N/A",
    });
    const errorMessage =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "Erreur lors de l'inscription";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 },
    );
  }
}
