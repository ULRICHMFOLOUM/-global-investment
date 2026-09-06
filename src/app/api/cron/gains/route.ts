import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // En production, vérifiez un jeton secret dans les headers pour sécuriser cet endpoint
  // const authHeader = req.headers.get('authorization')
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return ...

  try {
    const activeInvestments = await prisma.investment.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true }
    })

    const results = []

    for (const inv of activeInvestments) {
      const dailyAmount = (inv.amount * inv.dailyReturn) / 100
      
      const now = new Date()
      const isExpired = now >= inv.endDate

      await prisma.$transaction(async (tx) => {
        // 1. Ajouter le gain à l'historique
        await tx.gain.create({
          data: {
            userId: inv.userId,
            investmentId: inv.id,
            amount: dailyAmount,
          }
        })

        // 2. Créditer le solde de l'utilisateur
        await tx.user.update({
          where: { id: inv.userId },
          data: { balance: { increment: dailyAmount } }
        })

        // 3. Mettre à jour l'investissement
        await tx.investment.update({
          where: { id: inv.id },
          data: { 
            totalReturn: { increment: dailyAmount },
            status: isExpired ? 'COMPLETED' : 'ACTIVE'
          }
        })
      })

      results.push({ id: inv.id, processed: true, amount: dailyAmount, expired: isExpired })
    }

    return NextResponse.json({ 
      success: true, 
      processedCount: results.length,
      details: results 
    })
  } catch (error) {
    console.error('Cron gains error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
