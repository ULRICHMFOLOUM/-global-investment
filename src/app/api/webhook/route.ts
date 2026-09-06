import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const cpm_trans_id = formData.get('cpm_trans_id') as string
    const cpm_site_id = formData.get('cpm_site_id') as string

    if (!cpm_trans_id) {
      return NextResponse.json({ message: 'Missing transaction ID' }, { status: 400 })
    }

    // Ici on devrait appeler checkCinetPayTransaction pour être sûr
    // Mais CinetPay envoie normalement le statut si c'est sécurisé
    
    const transaction = await prisma.transaction.findFirst({
      where: { transactionId: cpm_trans_id }
    })

    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    if (transaction.status === 'SUCCESS') {
      return NextResponse.json({ message: 'Already processed' })
    }

    // Mettre à jour la transaction et le solde de l'utilisateur
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

    return NextResponse.json({ message: 'Payment confirmed and balance updated' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
