import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Plans d'investissement
  await prisma.plan.createMany({
    data: [
      {
        name: 'Plan Débutant',
        minAmount: 5000, maxAmount: 19999,
        dailyReturn: 6, // 6%
        duration: 30,
        vipRequired: 0,
        color: '#3b82f6',
        icon: 'pickaxe',
      },
      {
        name: 'Plan Bronze',
        minAmount: 20000, maxAmount: 49999,
        dailyReturn: 7.5,
        duration: 30,
        vipRequired: 0,
        color: '#92400e',
        icon: 'gem',
      },
      {
        name: 'Plan Argent',
        minAmount: 50000, maxAmount: 99999,
        dailyReturn: 9,
        duration: 30,
        vipRequired: 1,
        color: '#64748b',
        icon: 'gem',
      },
      {
        name: 'Plan Or',
        minAmount: 100000, maxAmount: 499999,
        dailyReturn: 11,
        duration: 30,
        vipRequired: 1,
        color: '#d97706',
        icon: 'crown',
      },
      {
        name: 'Plan Diamant',
        minAmount: 500000, maxAmount: 9999999,
        dailyReturn: 15,
        duration: 30,
        vipRequired: 2,
        color: '#7c3aed',
        icon: 'zap',
      },
    ]
  })

  console.log('✅ Plans créés')
}

main().then(() => prisma.$disconnect()).catch(console.error)
