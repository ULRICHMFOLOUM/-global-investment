import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

  const userId = (session.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      balance: true,
      bonusBalance: true,
      referralCode: true,
      vipLevel: true,
      createdAt: true,
    }
  })

  if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé dans la base de données', details: `userId: ${userId}` }, { status: 404 })

  // Count referrals (users who were referred by this user)
  const referralCount = await prisma.user.count({
    where: {
      OR: [
        { referredBy: user.id },
        { referredBy: user.referralCode },
      ],
    },
  })

  return NextResponse.json({
    ...user,
    referralCount,
    referralEarnings: Math.floor(referralCount * 5000 * 0.05), // estimation
  })
}
