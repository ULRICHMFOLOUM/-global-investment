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

    // Pour les plans bancaires, minimum absolu de 2500 XAF (montant libre)
    const BANK_MIN = 2500
    const effectiveMin = plan.category === 'BANK' ? BANK_MIN : plan.minAmount
    if (amount < effectiveMin || amount > plan.maxAmount) {
      return NextResponse.json({ 
        message: plan.category === 'BANK'
          ? `Montant invalide. Minimum ${BANK_MIN.toLocaleString()} XAF, maximum ${plan.maxAmount.toLocaleString()} XAF.`
          : `Montant invalide pour ce plan (${plan.minAmount.toLocaleString()} – ${plan.maxAmount.toLocaleString()} XAF)`
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 404 })
    }

    if (user.balance < amount) {
      return NextResponse.json({ 
        message: `Solde insuffisant (${user.balance.toLocaleString()} XAF disponible). Veuillez effectuer un dépôt de ${amount.toLocaleString()} XAF pour souscrire à ce plan.` 
      }, { status: 400 })
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

    // Activation immédiate de la souscription avec déduction du solde
    const result = await prisma.$transaction(async (tx) => {
      // 1. Débiter le solde de l'utilisateur
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } },
      })

      // 2. Créer l'investissement actif
      const inv = await tx.investment.create({
        data: {
          userId,
          planId,
          amount,
          dailyReturn: plan.dailyReturn,
          totalReturn: 0,
          startDate: now,
          endDate,
          status: 'ACTIVE',
        }
      })

      // 3. Enregistrer la transaction confirmée
      await tx.transaction.create({
        data: {
          userId,
          amount,
          fee: 0,
          type: 'PLAN_SUBSCRIPTION',
          status: 'SUCCESS',
          operator: operator || 'SOLDE DU COMPTE',
          phone: phone || user.phone,
          transactionId: invoiceNumber,
          country: user.country || 'CM',
        }
      })

      // 4. Bonus de parrainage de 1 000 FCFA au parrain si existant
      if (user.referredBy) {
        const referrer = await tx.user.findFirst({
          where: {
            OR: [
              { id: user.referredBy },
              { referralCode: user.referredBy },
            ],
          },
        })

        if (referrer) {
          await tx.user.update({
            where: { id: referrer.id },
            data: {
              balance: { increment: 1000 },
              bonusBalance: { increment: 1000 },
            },
          })

          await tx.transaction.create({
            data: {
              userId: referrer.id,
              amount: 1000,
              type: "BONUS",
              status: "SUCCESS",
              operator: "SYSTEM",
              phone: referrer.phone,
              transactionId: `BONUS-REF-${Date.now()}`,
              country: referrer.country || "CM",
            },
          })

          await tx.notification.create({
            data: {
              userId: referrer.id,
              title: "🎉 Bonus de Parrainage (+1 000 FCFA) !",
              message: `Félicitations ! Votre filleul ${user.name} a activé le plan "${plan.name}". Vous avez reçu 1 000 FCFA sur votre solde !`,
              type: "BONUS",
            },
          })
        }
      }

      // 5. Notification de succès pour le souscripteur
      await tx.notification.create({
        data: {
          userId,
          title: '🎉 Plan Activé avec Succès !',
          message: `Félicitations ! Votre souscription au plan "${plan.name}" (${amount.toLocaleString()} XAF) est validée et active. Vos gains journaliers de +${dailyGain.toLocaleString()} XAF/jour débutent immédiatement !`,
          type: 'PLAN',
        }
      })

      return inv
    })

    return NextResponse.json({ 
      success: true, 
      status: 'ACTIVE',
      message: `Plan "${plan.name}" activé avec succès ! Vos gains journaliers commencent dès aujourd'hui.`,
      planName: plan.name,
      amount,
      dailyGain,
      expectedTotalReturn,
      duration,
      investment: {
        id: result.id,
        planId: plan.id,
        planName: plan.name,
        amount,
        dailyGain,
        totalReturn: expectedTotalReturn,
        duration,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        status: 'ACTIVE',
      },
      invoice: {
        invoiceNumber,
        investmentId: result.id,
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
        status: 'ACTIVE',
      }
    })
  } catch (error: any) {
    console.error('Invest error:', error)
    return NextResponse.json({ message: 'Erreur serveur', error: error.message }, { status: 500 })
  }
}
