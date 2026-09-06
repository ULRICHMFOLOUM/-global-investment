import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, referralCode: true, bonusBalance: true },
    })

    if (!user) {
      return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 404 })
    }

    // Récupérer les utilisateurs parrainés par cet utilisateur
    const referrals = await prisma.user.findMany({
      where: {
        OR: [
          { referredBy: user.id },
          { referredBy: user.referralCode },
        ],
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        deposits: {
          where: { status: 'SUCCESS' },
          select: { amount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const formattedReferrals = referrals.map((ref) => {
      const totalDeposited = ref.deposits.reduce((acc, d) => acc + d.amount, 0)
      const initials = ref.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

      return {
        id: ref.id,
        name: ref.name.split(' ')[0] + ' ' + (ref.name.split(' ')[1]?.[0] || '') + '.',
        joined: new Date(ref.createdAt).toLocaleDateString('fr-FR'),
        amount: totalDeposited,
        active: totalDeposited > 0,
        avatar: initials || 'FL',
      }
    })

    return NextResponse.json({
      referrals: formattedReferrals,
      totalCount: referrals.length,
      bonusBalance: user.bonusBalance,
    })
  } catch (error) {
    console.error('Error fetching referrals:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
