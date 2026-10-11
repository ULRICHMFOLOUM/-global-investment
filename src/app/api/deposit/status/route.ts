import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getFapshiTransactionStatus } from '@/lib/payment'

export const dynamic = "force-dynamic";

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
        message: 'Paiement confirmé et solde crédité.',
      })
    }

    // Si déjà en échec
    if (transaction.status === 'FAILED') {
      return NextResponse.json({
        status: 'FAILED',
        amount: transaction.amount,
        message: 'La transaction a échoué ou a été annulée.',
      })
    }

    // Si la transaction est en attente, interroger Fapshi pour vérifier si le client a payé
    if (transaction.status === 'PENDING') {
      const fapshiId = transaction.externalId || transaction.transactionId
      let fapshiData: any = null

      if (fapshiId) {
        try {
          fapshiData = await getFapshiTransactionStatus(fapshiId)
        } catch (fapshiErr: any) {
          console.warn('Erreur interrogation Fapshi status:', fapshiErr.response?.data || fapshiErr.message)
        }
      }

      if (fapshiData && fapshiData.status === 'SUCCESSFUL') {
        // Valider et créditer UNIQUEMENT si Fapshi confirme le succès
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'SUCCESS' },
          }),
          prisma.user.update({
            where: { id: transaction.userId },
            data: { balance: { increment: transaction.amount } },
          }),
          prisma.notification.create({
            data: {
              userId: transaction.userId,
              title: "💰 Dépôt Confirmé & Crédité !",
              message: `Votre dépôt de ${transaction.amount.toLocaleString()} XAF via Mobile Money a été validé avec succès par Fapshi. Votre solde a été mis à jour.`,
              type: "DEPOSIT",
            },
          }),
        ])

        // Bonus parrainage 5% si parrainé et montant >= 500 XAF
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
          message: 'Paiement confirmé par Fapshi ! Votre compte a été crédité.',
        })
      } else if (fapshiData && fapshiData.status === 'FAILED') {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED' },
        })

        return NextResponse.json({
          status: 'FAILED',
          amount: transaction.amount,
          message: fapshiData.reason || 'Le paiement a échoué ou a été annulé par le client.',
        })
      }

      return NextResponse.json({
        status: 'PENDING',
        amount: transaction.amount,
        message: 'En attente de validation sur votre téléphone...',
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
