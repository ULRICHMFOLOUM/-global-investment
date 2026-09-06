import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

  const userId = (session.user as any).id
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [user, activeInvestments, todayGains, recentTransactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.investment.count({ where: { userId, status: 'ACTIVE' } }),
    prisma.gain.aggregate({
      where: { userId, date: { gte: today } },
      _sum: { amount: true }
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
  ])

  const totalReturn = user?.balance && user.balance > 0
    ? ((await prisma.gain.aggregate({ where: { userId }, _sum: { amount: true } }))._sum.amount || 0) / user.balance * 100
    : 0

  return NextResponse.json({
    balance: user?.balance ?? 0,
    bonusBalance: user?.bonusBalance ?? 0,
    todayGains: todayGains._sum.amount ?? 0,
    activeInvestments,
    totalBonusReceived: user?.bonusBalance ?? 0,
    totalReturn: Math.round(totalReturn),
    vipLevel: user?.vipLevel ?? 0,
    recentTransactions,
  })
}
