import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

    const userId = (session.user as any).id
    const { planId, amount, phone, operator } = await req.json()

    if (!planId || !amount) {
      return NextResponse.json({ message: 'Plan et montant requis' }, { status: 400 })
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan || !plan.isActive) {
      return NextResponse.json({ message: 'Plan invalide ou inactif' }, { status: 400 })
    }

    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return NextResponse.json({ 
        message: `Montant invalide pour ce plan (${plan.minAmount.toLocaleString()} XAF requis)` 
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 404 })
    }

    const duration = plan.duration || 30
    const expectedTotalReturn = plan.totalReturn && plan.totalReturn > 0
      ? plan.totalReturn
      : Math.round(amount * (1 + (plan.dailyReturn * duration) / 100))
    const dailyGain = Math.round(expectedTotalReturn / duration)

    const now = new Date()
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + duration)

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`

    // Créer la souscription en statut PENDING (En attente de validation par l'admin)
    const [investment, transaction] = await prisma.$transaction([
      prisma.investment.create({
        data: {
          userId,
          planId,
          amount,
          dailyReturn: plan.dailyReturn,
          totalReturn: 0,
          startDate: now,
          endDate,
          status: 'PENDING',
        }
      }),
      prisma.transaction.create({
        data: {
          userId,
          amount,
          fee: 0,
          type: 'PLAN_SUBSCRIPTION',
          status: 'PENDING',
          operator: operator || 'ORANGE/MTN',
          phone: phone || user.phone,
          transactionId: invoiceNumber,
          country: user.country || 'CM',
        }
      }),
      prisma.notification.create({
        data: {
          userId,
          title: '📋 Facture de Souscription Émise',
          message: `Votre souscription au plan "${plan.name}" (${amount.toLocaleString()} XAF) a été enregistrée avec la facture ${invoiceNumber}. Veuillez la transmettre dans le groupe officiel pour validation.`,
          type: 'PLAN',
        }
      })
    ])

    return NextResponse.json({ 
      success: true, 
      status: 'PENDING',
      message: `Souscription initiée avec succès ! Votre facture est disponible pour validation.`,
      invoice: {
        invoiceNumber,
        investmentId: investment.id,
        createdAt: now.toISOString(),
        userName: user.name,
        userEmail: user.email,
        userPhone: phone || user.phone,
        userCountry: user.country || 'CM',
        planId: plan.id,
        planName: plan.name,
        planCategory: plan.category,
        amount,
        duration,
        totalReturn: expectedTotalReturn,
        dailyGain,
        dailyReturnRate: plan.dailyReturn,
        status: 'PENDING',
      }
    })
  } catch (error: any) {
    console.error('Invest error:', error)
    return NextResponse.json({ message: 'Erreur serveur', error: error.message }, { status: 500 })
  }
}
