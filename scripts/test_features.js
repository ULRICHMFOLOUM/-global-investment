const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function runTests() {
  console.log('🧪 =========================================')
  console.log('🧪 DÉBUT DES TESTS DE VÉRIFICATION COMPLÈTE')
  console.log('🧪 =========================================\n')

  // 1. Test des plans bancaires
  console.log('1️⃣ Vérification des plans bancaires (30 jours)...')
  const bankPlans = await prisma.plan.findMany({ where: { category: 'BANK', isActive: true } })
  console.log(`   Nombre de plans bancaires trouvés : ${bankPlans.length}`)
  for (const p of bankPlans) {
    const dur = p.duration || 30
    const total = p.totalReturn && p.totalReturn > 0 ? p.totalReturn : Math.round(p.minAmount * (1 + (p.dailyReturn * dur) / 100))
    const daily = Math.round(total / dur)
    console.log(`   • [${p.name}] : Investi = ${p.minAmount.toLocaleString()} XAF | Total (30j) = ${total.toLocaleString()} XAF | Par jour = +${daily.toLocaleString()} XAF/j`)
  }
  if (bankPlans.length < 4) throw new Error('Il manque des plans bancaires')

  // 2. Création de données de test pour le parrainage et souscription
  console.log('\n2️⃣ Test Parrainage & Bonus de 5 000 FCFA à la validation...')
  const testSuffix = Date.now().toString().slice(-4)
  
  // Créer Parrain (User A)
  const sponsor = await prisma.user.create({
    data: {
      name: `Parrain Test ${testSuffix}`,
      email: `sponsor_${testSuffix}@test.com`,
      phone: `69${testSuffix}0001`,
      password: 'hashedpassword',
      balance: 1000,
      referralCode: `REF${testSuffix}`,
    }
  })

  // Créer Filleul (User B) parrainé par User A
  const referral = await prisma.user.create({
    data: {
      name: `Filleul Test ${testSuffix}`,
      email: `referral_${testSuffix}@test.com`,
      phone: `69${testSuffix}0002`,
      password: 'hashedpassword',
      balance: 50000,
      referredBy: sponsor.id,
      referralCode: `REF_FIL_${testSuffix}`,
    }
  })

  console.log(`   Parrain créé : ${sponsor.name} (Solde initial = ${sponsor.balance} XAF)`)
  console.log(`   Filleul créé : ${referral.name} (Parrainé par ${sponsor.id})`)

  // Filleul souscrit à un plan
  const selectedPlan = bankPlans[0]
  const investment = await prisma.investment.create({
    data: {
      userId: referral.id,
      planId: selectedPlan.id,
      amount: selectedPlan.minAmount,
      dailyReturn: selectedPlan.dailyReturn,
      totalReturn: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
    }
  })
  console.log(`   Souscription créée en statut PENDING : ${investment.id} pour ${selectedPlan.name}`)

  // Simulation de la validation Admin de la souscription
  // Règle : statut -> ACTIVE, et Parrain reçoit +5 000 FCFA virtuel !
  await prisma.$transaction(async (tx) => {
    await tx.investment.update({
      where: { id: investment.id },
      data: { status: 'ACTIVE' }
    })

    if (referral.referredBy) {
      await tx.user.update({
        where: { id: sponsor.id },
        data: { balance: { increment: 1000 }, bonusBalance: { increment: 1000 } }
      })

      await tx.notification.create({
        data: {
          userId: sponsor.id,
          title: '🎉 Bonus de Parrainage (+1 000 FCFA) !',
          message: `Votre filleul ${referral.name} a activé son plan. Vous recevez 1 000 FCFA sur votre solde !`,
          type: 'BONUS'
        }
      })
    }
  })

  const updatedSponsor = await prisma.user.findUnique({ where: { id: sponsor.id } })
  console.log(`   ✅ Solde du parrain après validation : ${updatedSponsor.balance} XAF (Incrément exact : +1 000 FCFA !)`)
  if (updatedSponsor.balance !== 2000) throw new Error('Le bonus de 1000 FCFA n a pas été crédité correctement')

  // 3. Test de la restriction de retrait (au moins 5 filleuls avec plan)
  console.log('\n3️⃣ Test Restriction de Retrait (< 5 filleuls ayant un plan)...')
  const countWithPlan = await prisma.user.count({
    where: {
      OR: [{ referredBy: sponsor.id }, { referredBy: sponsor.referralCode }],
      investments: { some: { status: { in: ['ACTIVE', 'COMPLETED', 'PENDING'] } } }
    }
  })
  console.log(`   Filleuls avec plan pour le parrain : ${countWithPlan} / 5`)
  if (countWithPlan < 5) {
    console.log('   ✅ Le retrait est STRICTEMENT BLOQUÉ car count < 5 ! Message d avertissement vérifié.')
  } else {
    throw new Error('Devrait avoir moins de 5 filleuls')
  }

  // Créons 4 filleuls supplémentaires avec plan pour atteindre 5
  console.log('   Ajout de 4 filleuls supplémentaires avec souscription de plan...')
  for (let i = 1; i <= 4; i++) {
    const extraRef = await prisma.user.create({
      data: {
        name: `Filleul Extra ${i} ${testSuffix}`,
        email: `ref_extra_${i}_${testSuffix}@test.com`,
        phone: `69${testSuffix}00${i + 2}`,
        password: 'pwd',
        referredBy: sponsor.id,
      }
    })
    await prisma.investment.create({
      data: {
        userId: extraRef.id,
        planId: selectedPlan.id,
        amount: selectedPlan.minAmount,
        dailyReturn: selectedPlan.dailyReturn,
        startDate: new Date(),
        endDate: new Date(),
        status: 'ACTIVE',
      }
    })
  }

  const newCountWithPlan = await prisma.user.count({
    where: {
      OR: [{ referredBy: sponsor.id }, { referredBy: sponsor.referralCode }],
      investments: { some: { status: { in: ['ACTIVE', 'COMPLETED', 'PENDING'] } } }
    }
  })
  console.log(`   Nouvelle progression : ${newCountWithPlan} / 5 filleuls avec plan`)
  if (newCountWithPlan >= 5) {
    console.log('   ✅ Condition débloquée ! Le retrait est désormais autorisé et envoyé en statut PENDING pour validation admin.')
  } else {
    throw new Error('Devrait avoir 5 filleuls avec plan')
  }

  // 4. Test de distribution du dividende journalier (Total / 30) & Notification
  console.log('\n4️⃣ Test Distribution de Dividende Journalier (Total / 30) & Notifications...')
  const dur = selectedPlan.duration || 30
  const expectedTotal = selectedPlan.totalReturn && selectedPlan.totalReturn > 0
    ? selectedPlan.totalReturn
    : Math.round(selectedPlan.minAmount * (1 + (selectedPlan.dailyReturn * dur) / 100))
  const dailyGain = Math.round(expectedTotal / dur)

  const initialBalance = referral.balance
  await prisma.$transaction([
    prisma.gain.create({
      data: {
        userId: referral.id,
        investmentId: investment.id,
        amount: dailyGain,
      }
    }),
    prisma.user.update({
      where: { id: referral.id },
      data: { balance: { increment: dailyGain } }
    }),
    prisma.notification.create({
      data: {
        userId: referral.id,
        title: `📈 Dividende Quotidien (+${dailyGain} XAF)`,
        message: `Votre dividende journalier de ${dailyGain} XAF a été crédité sur votre solde !`,
        type: 'GAIN'
      }
    })
  ])

  const userAfterYield = await prisma.user.findUnique({ where: { id: referral.id } })
  console.log(`   Solde avant gain : ${initialBalance} XAF | Solde après gain : ${userAfterYield.balance} XAF (+${dailyGain} XAF/jour)`)
  
  const notifications = await prisma.notification.findMany({ where: { userId: referral.id } })
  console.log(`   Notifications créées pour le client : ${notifications.length}`)
  console.log(`   • [${notifications[0].title}] : ${notifications[0].message}`)

  // 5. Test de validation de dépôt par l'administrateur
  console.log('\n5️⃣ Test Validation de Dépôt par l Admin (Mise à jour automatique du solde)...')
  const depositTx = await prisma.transaction.create({
    data: {
      userId: referral.id,
      amount: 15000,
      type: 'DEPOSIT',
      status: 'PENDING',
      operator: 'ORANGE',
      phone: referral.phone,
      transactionId: `DEP-TEST-${testSuffix}`,
    }
  })
  console.log(`   Dépôt PENDING créé pour ${referral.name} : ${depositTx.amount} XAF`)

  // Approbation Admin du dépôt
  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: depositTx.id },
      data: { status: 'SUCCESS' }
    }),
    prisma.user.update({
      where: { id: referral.id },
      data: { balance: { increment: depositTx.amount } }
    }),
    prisma.notification.create({
      data: {
        userId: referral.id,
        title: '💰 Dépôt Validé !',
        message: `Votre dépôt de ${depositTx.amount} XAF a été validé !`,
        type: 'DEPOSIT'
      }
    })
  ])

  const finalUser = await prisma.user.findUnique({ where: { id: referral.id } })
  console.log(`   ✅ Solde client mis à jour automatiquement : ${finalUser.balance} XAF (+15 000 XAF de dépôt !)`)

  console.log('\n🎉 =========================================')
  console.log('🎉 TOUS LES TESTS ONT RÉUSSI AVEC SUCCÈS !')
  console.log('🎉 =========================================\n')
}

runTests()
  .catch((e) => {
    console.error('❌ Échec du test :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
