import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic";

const REQUIRED_REFERRALS_FOR_WITHDRAW = 5;
const WITHDRAW_FEE_RATE = 0.03; // 3%

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

    const userId = (session.user as any).id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true, referralCode: true }
    })

    if (!user) return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 404 })

    // Compter les filleuls ayant au moins un plan souscrit (PENDING, ACTIVE, COMPLETED)
    const activeReferralsCount = await prisma.user.count({
      where: {
        OR: [
          { referredBy: user.id },
          { referredBy: user.referralCode },
        ],
        investments: {
          some: {
            status: { in: ['ACTIVE', 'COMPLETED', 'PENDING'] }
          }
        }
      }
    })

    return NextResponse.json({
      balance: user.balance,
      activeReferralsCount,
      requiredReferrals: REQUIRED_REFERRALS_FOR_WITHDRAW,
      canWithdraw: activeReferralsCount >= REQUIRED_REFERRALS_FOR_WITHDRAW,
      feeRate: WITHDRAW_FEE_RATE,
    })
  } catch (error: any) {
    return NextResponse.json({ message: 'Erreur serveur', error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

    const { amount, phone, operator } = await req.json()

    if (!amount || isNaN(amount) || amount < 100) {
      return NextResponse.json({ message: 'Montant minimum de retrait : 100 XAF' }, { status: 400 })
    }

    if (!phone || !operator) {
      return NextResponse.json({ message: 'Téléphone et opérateur requis' }, { status: 400 })
    }

    const userId = (session.user as any).id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true, referralCode: true, country: true }
    })

    if (!user) {
      return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 404 })
    }

    if (user.balance < amount) {
      return NextResponse.json({ message: 'Solde insuffisant pour ce retrait' }, { status: 400 })
    }

    // Vérifier la règle : au moins 5 personnes parrainées ayant souscrit à un plan
    const activeReferralsCount = await prisma.user.count({
      where: {
        OR: [
          { referredBy: user.id },
          { referredBy: user.referralCode },
        ],
        investments: {
          some: {
            status: { in: ['ACTIVE', 'COMPLETED', 'PENDING'] }
          }
        }
      }
    })

    if (activeReferralsCount < REQUIRED_REFERRALS_FOR_WITHDRAW) {
      return NextResponse.json({
        message: `Condition de retrait non remplie : Vous devez parrainer au moins 5 personnes ayant souscrit à un plan d'investissement pour effectuer un retrait. (Actuellement : ${activeReferralsCount} / ${REQUIRED_REFERRALS_FOR_WITHDRAW} filleuls avec plan).`,
        activeReferralsCount,
        requiredReferrals: REQUIRED_REFERRALS_FOR_WITHDRAW,
      }, { status: 400 })
    }

    const fee = Math.round(amount * WITHDRAW_FEE_RATE)
    const netAmount = amount - fee
    const txId = `RET-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Déduire du solde + créer la transaction en statut PENDING
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } }
      }),
      prisma.transaction.create({
        data: {
          userId,
          amount: netAmount,
          fee,
          type: 'WITHDRAWAL',
          status: 'PENDING',
          operator,
          phone,
          transactionId: txId,
          country: user.country || 'CM',
        }
      }),
      prisma.notification.create({
        data: {
          userId,
          title: '⏳ Retrait en attente de validation',
          message: `Votre demande de retrait de ${netAmount.toLocaleString()} XAF vers ${phone} (${operator.toUpperCase()}) a bien été transmise. Elle est actuellement en attente de validation par l'administrateur.`,
          type: 'WITHDRAW',
        }
      })
    ])

    return NextResponse.json({
      success: true,
      status: 'PENDING',
      message: `Votre demande de retrait de ${netAmount.toLocaleString()} XAF a été enregistrée avec succès. Elle est actuellement en attente de validation par l'administrateur.`,
      txId,
      netAmount,
      fee,
    })
  } catch (error: any) {
    console.error('Withdraw error:', error)
    return NextResponse.json({ message: 'Erreur serveur', error: error.message }, { status: 500 })
  }
}
