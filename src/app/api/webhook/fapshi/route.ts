import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Webhook Fapshi — confirme les paiements en succès
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Fapshi Webhook received:', body)

    const { transId, externalId, status, amount } = body

    // Fapshi envoie status: "SUCCESSFUL" quand le paiement est confirmé
    if (status === 'SUCCESSFUL' && externalId) {
      // Trouver la transaction par transactionId
      const transaction = await prisma.transaction.findFirst({
        where: { transactionId: externalId, status: 'PENDING' }
      })

      if (transaction) {
        // Mettre à jour la transaction et le solde en une seule opération
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'SUCCESS' }
          }),
          prisma.user.update({
            where: { id: transaction.userId },
            data: { balance: { increment: transaction.amount } }
          })
        ])

        // Bonus de parrainage si l'utilisateur a été parrainé
        const user = await prisma.user.findUnique({
          where: { id: transaction.userId }
        })

        if (user?.referredBy && transaction.amount >= 500) {
          const bonusAmount = Math.floor(transaction.amount * 0.05) // 5% de bonus parrainage
          await prisma.user.update({
            where: { id: user.referredBy },
            data: { bonusBalance: { increment: bonusAmount } }
          })
        }

        console.log(`✅ Dépôt confirmé: ${transaction.amount} XAF pour user ${transaction.userId}`)
      }
    }

    return NextResponse.json({ message: 'ok' })
  } catch (error) {
    console.error('Fapshi webhook error:', error)
    return NextResponse.json({ message: 'Erreur webhook' }, { status: 500 })
  }
}

// Permettre aussi GET pour vérification Fapshi
export async function GET(req: NextRequest) {
  return NextResponse.json({ status: 'Fapshi webhook actif' })
}
