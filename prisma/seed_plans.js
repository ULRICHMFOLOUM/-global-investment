const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Clear existing plans if necessary (optional)
  // await prisma.plan.deleteMany({})

  const plans = [
    // --- NORMAL PLANS (Mining/Standard) ---
    {
      name: "Starter Mine",
      category: "NORMAL",
      minAmount: 5000,
      maxAmount: 100000,
      dailyReturn: 5.0,
      duration: 30,
      vipRequired: 0,
      color: "#3B82F6",
      icon: "pickaxe"
    },
    {
      name: "Silver Fleet",
      category: "NORMAL",
      minAmount: 50000,
      maxAmount: 500000,
      dailyReturn: 7.2,
      duration: 45,
      vipRequired: 1,
      color: "#94A3B8",
      icon: "pickaxe"
    },
    {
      name: "Golden Rig",
      category: "NORMAL",
      minAmount: 200000,
      maxAmount: 2000000,
      dailyReturn: 10.0,
      duration: 60,
      vipRequired: 2,
      color: "#FBBF24",
      icon: "gem"
    },
    {
      name: "VIP Diamond",
      category: "NORMAL",
      minAmount: 1000000,
      maxAmount: 10000000,
      dailyReturn: 15.0,
      duration: 90,
      vipRequired: 4,
      color: "#2DD4BF",
      icon: "crown"
    },

    // --- BANK PLANS (Savings/Stable) ---
    {
      name: "Savings Classic",
      category: "BANK",
      minAmount: 10000,
      maxAmount: 1000000,
      dailyReturn: 0.8,
      duration: 90,
      vipRequired: 0,
      color: "#10B981",
      icon: "wallet"
    },
    {
      name: "Fixed Deposit Pro",
      category: "BANK",
      minAmount: 100000,
      maxAmount: 5000000,
      dailyReturn: 1.2,
      duration: 180,
      vipRequired: 1,
      color: "#6366F1",
      icon: "credit-card"
    },
    {
      name: "Global Wealth Fund",
      category: "BANK",
      minAmount: 500000,
      maxAmount: 20000000,
      dailyReturn: 1.5,
      duration: 365,
      vipRequired: 3,
      color: "#8B5CF6",
      icon: "landmark"
    },
    {
      name: "Institutional Alpha",
      category: "BANK",
      minAmount: 5000000,
      maxAmount: 100000000,
      dailyReturn: 2.0,
      duration: 365,
      vipRequired: 5,
      color: "#F43F5E",
      icon: "shield-check"
    }
  ]

  console.log('Seeding plans...')

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.name.toLowerCase().replace(/\s/g, '-') }, // Simple ID generation for seeding
      update: plan,
      create: {
        id: plan.name.toLowerCase().replace(/\s/g, '-'),
        ...plan
      }
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
