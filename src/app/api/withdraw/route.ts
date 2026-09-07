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

    if (amount < 100) {
      return NextResponse.json({ message: 'Montant minimum de retrait : 100 XAF' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || user.balance < amount) {
      return NextResponse.json({ message: 'Solde insuffisant' }, { status: 400 })
    }

    const fee = amount * 0.03
    const netAmount = amount - fee

    // Déduire du solde + créer la transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { balance: { decrement: amount } }
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          amount: netAmount,
          fee,
          type: 'WITHDRAWAL',
          status: 'PENDING',
          operator,
          phone,
        }
      })
    ])

    // Ici vous integrator CinetPay Transfer API pour envoyer automatiquement
    // await cinetpayTransfer({ amount: netAmount, phone, operator })

    return NextResponse.json({
      success: true,
      message: `Retrait de ${netAmount.toLocaleString()} XAF initiated. Traitement sous 24h.`
    })
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
