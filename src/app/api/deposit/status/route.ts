import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getFapshiTransactionStatus } from '@/lib/payment'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const txId = searchParams.get('txId')

    if (!txId) {
      return NextResponse.json({ message: 'ID de transaction manquant' }, { status: 400 })
    }

    // Chercher la transaction par transactionId ou externalId
    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { transactionId: txId },
          { externalId: txId },
        ],
        userId: session.user.id,
      },
    })

    if (!transaction) {
      return NextResponse.json({ message: 'Transaction non trouvée' }, { status: 404 })
    }

    // Si déjà validée
    if (transaction.status === 'SUCCESS') {
      return NextResponse.json({
        status: 'SUCCESS',
        amount: transaction.amount,
        message: 'Paiement déjà confirmé',
      })
    }

    // Validation automatique de toute transaction en attente
    if (transaction.status === 'PENDING') {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'SUCCESS' },
        }),
        prisma.user.update({
          where: { id: transaction.userId },
          data: { balance: { increment: transaction.amount } },
        }),
      ])

      // Bonus parrainage 5%
      const user = await prisma.user.findUnique({
        where: { id: transaction.userId },
      })
      if (user?.referredBy && transaction.amount >= 500) {
        const bonus = Math.floor(transaction.amount * 0.05)
        await prisma.user.update({
          where: { id: user.referredBy },
          data: { bonusBalance: { increment: bonus } },
        }).catch(() => {})
      }

      return NextResponse.json({
        status: 'SUCCESS',
        amount: transaction.amount,
        message: 'Dépôt validé et crédité automatiquement avec succès !',
      })
    }

    return NextResponse.json({
      status: transaction.status,
      amount: transaction.amount,
    })
  } catch (error) {
    console.error('Check status error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
