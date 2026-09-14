const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding investment plans...')

  const plans = [
    // --- NORMAL PLANS (Standard / Mining) ---
    {
      id: "starter-mine",
      name: "Starter Mine",
      category: "NORMAL",
      minAmount: 5000,
      maxAmount: 100000,
      dailyReturn: 5.0,
      totalReturn: 7500,
      duration: 30,
      vipRequired: 0,
      color: "#3B82F6",
      icon: "pickaxe"
    },
    {
      id: "silver-fleet",
      name: "Silver Fleet",
      category: "NORMAL",
      minAmount: 50000,
      maxAmount: 500000,
      dailyReturn: 7.2,
      totalReturn: 108000,
      duration: 30,
      vipRequired: 1,
      color: "#94A3B8",
      icon: "pickaxe"
    },
    {
      id: "golden-rig",
      name: "Golden Rig",
      category: "NORMAL",
      minAmount: 200000,
      maxAmount: 2000000,
      dailyReturn: 10.0,
      totalReturn: 600000,
      duration: 30,
      vipRequired: 2,
      color: "#FBBF24",
      icon: "gem"
    },
    {
      id: "vip-diamond",
      name: "VIP Diamond",
      category: "NORMAL",
      minAmount: 1000000,
      maxAmount: 10000000,
      dailyReturn: 15.0,
      totalReturn: 4500000,
      duration: 30,
      vipRequired: 4,
      color: "#2DD4BF",
      icon: "crown"
    },

    // --- BANK INVESTMENT PLANS (Menu Bancaire - 30 Jours) ---
    {
      id: "plan-epargne-starter",
      name: "Plan Épargne Starter",
      category: "BANK",
      minAmount: 5000,
      maxAmount: 5000,
      dailyReturn: 10.0, // 500 FCFA / jour
      totalReturn: 15000, // Total sur 30 jours (500 * 30)
      duration: 30,
      vipRequired: 0,
      color: "#10B981",
      icon: "wallet"
    },
    {
      id: "plan-bronze-croissance",
      name: "Plan Bronze Croissance",
      category: "BANK",
      minAmount: 10000,
      maxAmount: 10000,
      dailyReturn: 10.0, // 1 000 FCFA / jour
      totalReturn: 30000, // Total sur 30 jours (1000 * 30)
      duration: 30,
      vipRequired: 0,
      color: "#3B82F6",
      icon: "credit-card"
    },
    {
      id: "plan-silver-rendement",
      name: "Plan Silver Rendement",
      category: "BANK",
      minAmount: 25000,
      maxAmount: 25000,
      dailyReturn: 10.0, // 2 500 FCFA / jour
      totalReturn: 75000, // Total sur 30 jours (2500 * 30)
      duration: 30,
      vipRequired: 1,
      color: "#6366F1",
      icon: "landmark"
    },
    {
      id: "plan-gold-serenite",
      name: "Plan Gold Sérénité",
      category: "BANK",
      minAmount: 50000,
      maxAmount: 50000,
      dailyReturn: 11.0, // 5 500 FCFA / jour
      totalReturn: 165000, // Total sur 30 jours (5500 * 30)
      duration: 30,
      vipRequired: 2,
      color: "#F59E0B",
      icon: "shield-check"
    },
    {
      id: "plan-platinum-vip",
      name: "Plan Platinum VIP",
      category: "BANK",
      minAmount: 100000,
      maxAmount: 100000,
      dailyReturn: 12.0, // 12 000 FCFA / jour
      totalReturn: 360000, // Total sur 30 jours (12000 * 30)
      duration: 30,
      vipRequired: 3,
      color: "#EC4899",
      icon: "crown"
    },
    {
      id: "plan-diamond-supreme",
      name: "Plan Diamond Suprême",
      category: "BANK",
      minAmount: 250000,
      maxAmount: 250000,
      dailyReturn: 14.0, // 35 000 FCFA / jour
      totalReturn: 1050000, // Total sur 30 jours (35000 * 30)
      duration: 30,
      vipRequired: 4,
      color: "#06B6D4",
      icon: "gem"
    }
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan
    })
  }

  console.log(`✅ Successfully seeded ${plans.length} investment plans!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
