import { prisma } from '@/lib/prisma'

/**
 * Traite et crédite automatiquement les gains journaliers sur le site.
 * Idempotent : vérifie le nombre de jours écoulés vs gains déjà enregistrés.
 */
export async function processDailyGains(targetUserId?: string) {
  try {
    const now = new Date()
    const activeInvestments = await prisma.investment.findMany({
      where: {
        status: 'ACTIVE',
        ...(targetUserId ? { userId: targetUserId } : {}),
      },
      include: {
        plan: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })

    if (activeInvestments.length === 0) {
      return { creditedCount: 0, totalAmount: 0, processedInvestments: 0 }
    }

    let totalYieldDistributed = 0
    let creditedCount = 0

    const msPerDay = 24 * 60 * 60 * 1000

    for (const inv of activeInvestments) {
      const duration = inv.plan.duration || 30
      const startDate = new Date(inv.startDate)
      const endDate = new Date(inv.endDate)

      // Calcul du nombre de jours théoriques écoulés depuis le début (1 minimum si au moins 24h ou 1 jour entamé)
      const diffMs = now.getTime() - startDate.getTime()
      const daysElapsed = Math.min(
        duration,
        Math.max(1, Math.floor(diffMs / msPerDay))
      )

      // Nombre de gains déjà attribués pour cet investissement
      const existingGainsCount = await prisma.gain.count({
        where: { investmentId: inv.id },
      })

      // Gains dus et non encore attribués
      const dueDays = Math.max(0, daysElapsed - existingGainsCount)

      if (dueDays > 0) {
        // Gain quotidien calculé
        const dailyGain = inv.plan.totalReturn && inv.plan.totalReturn > 0
          ? Math.round(inv.plan.totalReturn / duration)
          : Math.round((inv.amount * inv.dailyReturn) / 100)

        const totalGainForInv = dailyGain * dueDays
        const isCompleted = (existingGainsCount + dueDays) >= duration || now >= endDate

        await prisma.$transaction(async (tx) => {
          // 1. Création des enregistrements de Gain
          for (let i = 0; i < dueDays; i++) {
            const gainDate = new Date(startDate.getTime() + (existingGainsCount + i + 1) * msPerDay)
            await tx.gain.create({
              data: {
                userId: inv.userId,
                investmentId: inv.id,
                amount: dailyGain,
                date: gainDate > now ? now : gainDate,
              },
            })
          }

          // 2. Crédit immédiat sur le solde utilisateur
          await tx.user.update({
            where: { id: inv.userId },
            data: { balance: { increment: totalGainForInv } },
          })

          // 3. Mise à jour de l'investissement
          await tx.investment.update({
            where: { id: inv.id },
            data: {
              totalReturn: { increment: totalGainForInv },
              status: isCompleted ? 'COMPLETED' : 'ACTIVE',
            },
          })

          // 4. Notification automatique
          await tx.notification.create({
            data: {
              userId: inv.userId,
              title: `📈 Dividende Quotidien (+${totalGainForInv.toLocaleString()} XAF)`,
              message: `Votre dividende automatique de ${totalGainForInv.toLocaleString()} XAF pour votre plan "${inv.plan.name}" a été crédité sur votre solde disponible !`,
              type: 'GAIN',
            },
          })
        })

        totalYieldDistributed += totalGainForInv
        creditedCount += dueDays
      } else if (now >= endDate) {
        // Fin de contrat
        await prisma.investment.update({
          where: { id: inv.id },
          data: { status: 'COMPLETED' },
        })
      }
    }

    return {
      creditedCount,
      totalAmount: totalYieldDistributed,
      processedInvestments: activeInvestments.length,
    }
  } catch (error: any) {
    console.error('Error in processDailyGains:', error)
    return { error: error.message, creditedCount: 0, totalAmount: 0, processedInvestments: 0 }
  }
}
