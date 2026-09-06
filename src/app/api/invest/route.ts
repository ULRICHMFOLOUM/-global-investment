import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

    const { planId, amount } = await req.json()

    if (!planId || !amount) {
      return NextResponse.json({ message: 'Plan et montant requis' }, { status: 400 })
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan || !plan.isActive) {
      return NextResponse.json({ message: 'Plan invalide ou inactif' }, { status: 400 })
    }

    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return NextResponse.json({ 
        message: `Montant doit être entre ${plan.minAmount} et ${plan.maxAmount} XAF` 
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || user.balance < amount) {
      return NextResponse.json({ message: 'Solde insuffisant' }, { status: 400 })
    }

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.duration)

    // Créer l'investissement et débiter le solde
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { balance: { decrement: amount } }
      }),
      prisma.investment.create({
        data: {
          userId: session.user.id,
          planId,
          amount,
          dailyReturn: plan.dailyReturn,
          endDate,
          status: 'ACTIVE',
        }
      })
    ])

    return NextResponse.json({ 
      success: true, 
      message: `Investissement de ${amount.toLocaleString()} XAF créé avec succès!`
    })
  } catch (error) {
    console.error('Invest error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
