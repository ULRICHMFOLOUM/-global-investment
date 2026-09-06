import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

    const { amount, phone, operator } = await req.json()

    if (!amount || !phone || !operator) {
      return NextResponse.json({ message: 'Tous les champs sont requis (Montant, Téléphone, Opérateur)' }, { status: 400 })
    }

    if (amount < 500) {
      return NextResponse.json({ message: 'Montant minimum : 500 XAF' }, { status: 400 })
    }

    // Créer la transaction en attente
    const transactionId_custom = `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: 'DEPOSIT',
        status: 'PENDING',
        operator,
        phone,
        transactionId: transactionId_custom,
        country: session.user.country || 'CM',
      }
    })

    // INTÉGRATION FAPSHI
    try {
      const { initializeFapshiPayment } = await import('@/lib/payment')
      
      const paymentData = await initializeFapshiPayment({
        amount,
        email: session.user.email || `user-${session.user.id}@globalinvest.com`,
        externalId: transactionId_custom,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/banque?success=true&txId=${transactionId_custom}`,
        message: `Dépôt Global Invest Africa - ${session.user.name}`,
      })

      if (paymentData.link) {
        return NextResponse.json({ 
          success: true, 
          payment_url: paymentData.link,
          transId: paymentData.transId,
          message: 'Redirection vers Fapshi (Mobile Money)...'
        })
      } else {
        throw new Error(paymentData.message || 'Erreur Fapshi')
      }
    } catch (payError: any) {
      console.error('Fapshi initialization error:', payError.response?.data || payError.message)
      // En mode développement, simuler le succès
      if (process.env.NODE_ENV === 'development' && !process.env.FAPSHI_API_KEY) {
        return NextResponse.json({ 
          success: true, 
          payment_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/banque?success=true&txId=${transactionId_custom}&demo=true`,
          message: 'Mode démo - Fapshi non configuré'
        })
      }
      return NextResponse.json({ 
        message: `Erreur Fapshi : ${payError.response?.data?.message || payError.message}` 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Deposit error:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
