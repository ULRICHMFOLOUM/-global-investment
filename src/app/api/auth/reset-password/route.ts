import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-key-globalinvest";

export async function POST(req: NextRequest) {
  try {
    const { email, code, resetToken, newPassword } = await req.json();

    if (!email || !code || !resetToken || !newPassword) {
      return NextResponse.json(
        { message: "Tous les champs sont requis." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }

    const [expiresAtStr, providedSignature] = resetToken.split(".");
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return NextResponse.json(
        { message: "Le code de réinitialisation a expiré. Veuillez refaire une demande." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Vérifier la signature HMAC
    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(`${normalizedEmail}:${code.trim()}:${expiresAt}`)
      .digest("hex");

    if (expectedSignature !== providedSignature) {
      return NextResponse.json(
        { message: "Code de vérification invalide." },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour dans la base de données
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la réinitialisation du mot de passe." },
      { status: 500 }
    );
  }
}
