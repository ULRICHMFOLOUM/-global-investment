import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-key-globalinvest";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Adresse email requise" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Aucun compte trouvé avec cette adresse email." },
        { status: 404 }
      );
    }

    // Génération d'un code de vérification à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Expiration dans 15 minutes
    const expiresAt = Date.now() + 15 * 60 * 1000;

    // Signature cryptographique HMAC pour éviter toute falsification
    const signature = crypto
      .createHmac("sha256", SECRET)
      .update(`${normalizedEmail}:${code}:${expiresAt}`)
      .digest("hex");

    const resetToken = `${expiresAt}.${signature}`;

    return NextResponse.json({
      success: true,
      message: `Code de réinitialisation généré pour ${user.name}`,
      email: normalizedEmail,
      code, // Fourni pour permettre la validation directe
      resetToken,
      expiresAt,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la demande de réinitialisation" },
      { status: 500 }
    );
  }
}
