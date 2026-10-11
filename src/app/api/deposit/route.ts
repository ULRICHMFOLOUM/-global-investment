import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fapshiDirectPayment, initializeFapshiPayment } from '@/lib/payment'

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

    // Nettoyer le numéro pour obtenir les 9 chiffres locaux (format Cameroun ex: 690000000)
    const cleanPhone = phone.replace(/\D/g, '').slice(-9)
    if (cleanPhone.length !== 9) {
      return NextResponse.json({ 
        message: 'Numéro de téléphone invalide. Veuillez entrer un numéro Mobile Money valide à 9 chiffres (ex: 690000000 ou 670000000).' 
      }, { status: 400 })
    }

    const medium = operator?.toLowerCase() === 'orange' ? 'orange money' : 'mobile money'
    const transactionId_custom = `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Créer la transaction enregistrée en PENDING (en attente du paiement réel sur Fapshi)
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: 'DEPOSIT',
        status: 'PENDING',
        operator,
        phone: cleanPhone,
        transactionId: transactionId_custom,
        country: session.user.country || 'CM',
      }
    })

    // 1. Tenter l'envoi de la demande directe (Push USSD sur le téléphone du client)
    try {
      const directResult = await fapshiDirectPayment({
        amount,
        phone: cleanPhone,
        email: session.user.email || undefined,
        userId: session.user.id,
        externalId: transactionId_custom,
        medium,
        message: `Dépôt GlobalInvest Africa - ${cleanPhone}`,
      })

      if (directResult && (directResult.transId || directResult.status)) {
        const transId = directResult.transId || transactionId_custom
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { externalId: transId },
        })

        return NextResponse.json({
          success: true,
          status: 'PENDING',
          mode: 'DIRECT',
          transId,
          transactionId: transactionId_custom,
          message: `Une demande de paiement de ${amount.toLocaleString()} XAF a été envoyée sur votre numéro ${cleanPhone}. Veuillez confirmer avec votre code secret Mobile Money pour créditer votre compte.`,
        })
      }
    } catch (directErr: any) {
      console.warn('Fapshi Direct Pay non actif ou indisponible, passage sur Initiate Pay :', directErr.response?.data || directErr.message)
    }

    // 2. Si Direct Pay n'est pas encore activé sur le compte Fapshi (ex: 403 Forbidden), utiliser Initiate Pay (redirection vers page de paiement sécurisée)
    try {
      const initResult = await initializeFapshiPayment({
        amount,
        email: session.user.email || `user-${session.user.id}@globalinvest.com`,
        userId: session.user.id,
        externalId: transactionId_custom,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://globalinvest-africa2.netlify.app'}/dashboard/banque?success=true&txId=${transactionId_custom}`,
        message: `Dépôt GlobalInvest Africa - ${session.user.name || cleanPhone}`,
      })

      if (initResult?.link) {
        if (initResult.transId) {
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: { externalId: initResult.transId },
          })
        }

        return NextResponse.json({
          success: true,
          status: 'PENDING',
          mode: 'REDIRECT',
          payment_url: initResult.link,
          transId: initResult.transId,
          transactionId: transactionId_custom,
          message: 'Redirection vers la passerelle sécurisée Fapshi (Mobile Money)...',
        })
      } else {
        throw new Error(initResult?.message || 'Lien de paiement Fapshi introuvable')
      }
    } catch (initErr: any) {
      console.error('Erreur initialisation Fapshi:', initErr.response?.data || initErr.message)
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      })
      return NextResponse.json({
        message: `Échec de l'initialisation du paiement Fapshi : ${initErr.response?.data?.message || initErr.message || 'Vérifiez les paramètres de passerelle'}`
      }, { status: 502 })
    }

  } catch (error: any) {
    console.error('Deposit error:', error)
    return NextResponse.json({ message: 'Erreur serveur', error: error.message }, { status: 500 })
  }
}
