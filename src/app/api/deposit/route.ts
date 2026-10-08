import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

    const { amount, phone, operator } = await req.json()

    if (!amount || !phone || !operator) {
      return NextResponse.json({ message: 'Tous les champs sont requis (Montant, Téléphone, Opérateur)' }, { status: 400 })
    }

    if (amount < 100) {
      return NextResponse.json({ message: 'Montant minimum : 100 XAF' }, { status: 400 })
    }

    // Validation automatique et instantanée du dépôt
    const transactionId_custom = `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    
    await prisma.$transaction(async (tx) => {
      // 1. Créer la transaction marquée SUCCESS
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          amount,
          type: 'DEPOSIT',
          status: 'SUCCESS',
          operator,
          phone,
          transactionId: transactionId_custom,
          country: session.user.country || 'CM',
        }
      })

      // 2. Créditer immédiatement le solde du compte
      await tx.user.update({
        where: { id: session.user.id },
        data: { balance: { increment: amount } }
      })

      // 3. Bonus parrainage 5% si parrainé et montant >= 500 XAF
      const user = await tx.user.findUnique({
        where: { id: session.user.id }
      })
      if (user?.referredBy && amount >= 500) {
        const bonus = Math.floor(amount * 0.05)
        await tx.user.update({
          where: { id: user.referredBy },
          data: { bonusBalance: { increment: bonus } }
        }).catch(() => {})
      }

      // 4. Notification instantanée
      await tx.notification.create({
        data: {
          userId: session.user.id,
          title: "💰 Dépôt Validé Instantanément !",
          message: `Votre dépôt de ${amount.toLocaleString()} XAF via ${operator.toUpperCase()} (${phone}) a été automatiquement validé et crédité sur votre solde disponible.`,
          type: "DEPOSIT",
        }
      })
    })

    return NextResponse.json({
      success: true,
      status: 'SUCCESS',
      amount,
      transactionId: transactionId_custom,
      message: `Votre dépôt de ${amount.toLocaleString()} XAF a été validé automatiquement avec succès ! Votre solde est mis à jour.`
    })
  } catch (error: any) {
    console.error('Deposit error:', error)
    return NextResponse.json({ message: 'Erreur serveur', error: error.message }, { status: 500 })
  }
}
