import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic";

// Webhook Fapshi — confirme les paiements en succès ou échec
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Fapshi Webhook received:', body)

    const { transId, externalId, status, amount } = body

    if (!transId && !externalId) {
      return NextResponse.json({ message: 'Identifiant manquant' }, { status: 400 })
    }

    // Trouver la transaction correspondante en attente
    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          ...(externalId ? [{ transactionId: externalId }] : []),
          ...(transId ? [{ externalId: transId }, { transactionId: transId }] : []),
        ],
        status: 'PENDING',
      },
    })

    if (!transaction) {
      console.log('Transaction non trouvée ou déjà traitée pour webhook:', { transId, externalId })
      return NextResponse.json({ message: 'Transaction non trouvée ou déjà traitée' })
    }

    // Fapshi envoie status: "SUCCESSFUL" quand le paiement est confirmé
    if (status === 'SUCCESSFUL') {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: { 
            status: 'SUCCESS',
            ...(transId ? { externalId: transId } : {}),
          },
        }),
        prisma.user.update({
          where: { id: transaction.userId },
          data: { balance: { increment: transaction.amount } },
        }),
        prisma.notification.create({
          data: {
            userId: transaction.userId,
            title: "💰 Dépôt Confirmé & Crédité !",
            message: `Votre dépôt de ${transaction.amount.toLocaleString()} XAF via Mobile Money a été confirmé avec succès par Fapshi. Votre solde a été mis à jour.`,
            type: "DEPOSIT",
          },
        }),
      ])

      // Bonus de parrainage de 5% si l'utilisateur a été parrainé
      const user = await prisma.user.findUnique({
        where: { id: transaction.userId },
      })

      if (user?.referredBy && transaction.amount >= 500) {
        const bonusAmount = Math.floor(transaction.amount * 0.05) // 5% de bonus parrainage
        await prisma.user.update({
          where: { id: user.referredBy },
          data: { bonusBalance: { increment: bonusAmount } },
        }).catch(() => {})
      }

      console.log(`✅ Webhook: Dépôt confirmé ${transaction.amount} XAF pour utilisateur ${transaction.userId}`)
    } else if (status === 'FAILED') {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      })
      console.log(`❌ Webhook: Dépôt échoué pour transaction ${transaction.id}`)
    }

    return NextResponse.json({ message: 'ok' })
  } catch (error) {
    console.error('Fapshi webhook error:', error)
    return NextResponse.json({ message: 'Erreur webhook' }, { status: 500 })
  }
}

// Permettre aussi GET pour vérification de l'URL par Fapshi
export async function GET(req: NextRequest) {
  return NextResponse.json({ status: 'Fapshi webhook actif' })
}
