const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const res = await prisma.plan.updateMany({
    where: {
      id: {
        startsWith: 'bank-'
      }
    },
    data: {
      category: 'BANK'
    }
  });
  console.log('Updated bank plans count:', res.count);

  const bankPlans = await prisma.plan.findMany({
    where: { category: 'BANK' }
  });
  console.log('Bank plans currently in DB:');
  bankPlans.forEach(p => console.log(` - [${p.id}] ${p.name} (min: ${p.minAmount}, daily: ${p.dailyReturn}%, cat: ${p.category})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
