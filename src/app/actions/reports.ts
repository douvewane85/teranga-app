"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getCampaignReport(campaignId: string) {
  // 1. Infos générales de la campagne
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error("Campagne introuvable.");
  }

  // 2. Statistiques des membres
  const totalActiveMembers = await prisma.user.count({
    where: { role: "MEMBER", status: "ACTIVE" },
  });

  const enrolledObligations = await prisma.obligation.findMany({
    where: { campaignId },
    include: {
      user: {
        select: { id: true, name: true, email: true, status: true, phone: true },
      },
      payments: true,
    },
  });

  const enrolledCount = enrolledObligations.length;
  const notEnrolledCount = Math.max(0, totalActiveMembers - enrolledCount);
  const enrollmentRate = totalActiveMembers > 0 ? (enrolledCount / totalActiveMembers) * 100 : 0;

  // 3. Calcul des périodes et de l'échéance en cours
  const today = new Date();
  const start = new Date(campaign.startDate);
  const end = new Date(campaign.endDate);
  const frequency = campaign.frequency || "MONTHLY";
  
  // Fonction utilitaire pour générer toutes les périodes d'une campagne
  const periods: {name: string, date: Date}[] = [];
  const curr = new Date(start);
  while (curr <= end && (frequency as string) !== "ONE_TIME") {
    const name = curr.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1).replace(' ', '-');
    periods.push({ name: formattedName, date: new Date(curr) });
    
    if (frequency === "MONTHLY") curr.setMonth(curr.getMonth() + 1);
    else if (frequency === "QUARTERLY") curr.setMonth(curr.getMonth() + 3);
    else if (frequency === "SEMI_ANNUALLY") curr.setMonth(curr.getMonth() + 6);
    else if (frequency === "ANNUALLY") curr.setFullYear(curr.getFullYear() + 1);
    else break;
  }
  if (periods.length === 0) {
    periods.push({ name: "Unique", date: start });
  }

  const totalPeriodsCount = periods.length;
  // Trouver la période "en cours" (la dernière période dont la date est <= aujourd'hui)
  // S'il n'y en a pas, c'est la première. Si toutes sont passées, c'est la dernière.
  let currentPeriod = periods[0];
  let elapsedPeriodsCount = 0;
  for (let i = 0; i < periods.length; i++) {
    if (periods[i].date <= today) {
      currentPeriod = periods[i];
      elapsedPeriodsCount = i + 1;
    } else {
      break; // Dès qu'on dépasse today, on arrête
    }
  }
  if (elapsedPeriodsCount === 0) elapsedPeriodsCount = 1;

  // 4. Situation des cotisations (Globales et Période en cours)
  let globalTargetAmount = 0;
  let globalPaidAmount = 0;
  
  let currentPeriodTargetAmount = 0;
  let currentPeriodPaidAmount = 0;

  let paidCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;

  enrolledObligations.forEach((obl) => {
    const target = obl.targetAmount || campaign.goalAmount || 0;
    
    // Global
    const actualPaid = obl.payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0);

    globalTargetAmount += (target * totalPeriodsCount);
    globalPaidAmount += actualPaid;

    // Comptage membres
    if (actualPaid === 0) {
      unpaidCount++;
    } else if (actualPaid >= (target * totalPeriodsCount)) {
      paidCount++;
    } else {
      partialCount++;
    }

    // Période en cours
    currentPeriodTargetAmount += target;
    const hasPaidCurrentPeriod = obl.payments.some(p => p.status === "COMPLETED" && p.period === currentPeriod.name);
    if (hasPaidCurrentPeriod) {
      // Pour simplifier, on suppose que s'il a payé la période, il a payé "target"
      currentPeriodPaidAmount += target; 
    }
  });

  const remainingAmount = Math.max(0, globalTargetAmount - globalPaidAmount);
  const recoveryRate = globalTargetAmount > 0 ? (globalPaidAmount / globalTargetAmount) * 100 : 0;
  const currentPeriodRecoveryRate = currentPeriodTargetAmount > 0 ? (currentPeriodPaidAmount / currentPeriodTargetAmount) * 100 : 0;

  // 5. Détail et répartition des paiements
  const allPayments = await prisma.payment.findMany({
    where: { obligation: { campaignId } },
    include: { obligation: { include: { user: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: 'desc' }
  });

  const paymentDistribution: Record<string, { count: number; total: number }> = {};
  let pendingCount = 0, pendingAmount = 0, rejectedCount = 0, rejectedAmount = 0;

  allPayments.forEach((p) => {
    if (p.status === "COMPLETED") {
      if (!paymentDistribution[p.method]) paymentDistribution[p.method] = { count: 0, total: 0 };
      paymentDistribution[p.method].count++;
      paymentDistribution[p.method].total += p.amount;
    } else if (p.status === "PENDING") {
      pendingCount++; pendingAmount += p.amount;
    } else if (p.status === "REJECTED") {
      rejectedCount++; rejectedAmount += p.amount;
    }
  });

  // Liste de TOUS les membres de la campagne
  let globalTotalSurplus = 0;

  const allMembersData = enrolledObligations.map((obl) => {
    const target = obl.targetAmount || campaign.goalAmount || 0;
    const completedPayments = obl.payments.filter((p) => p.status === "COMPLETED");
    const actualPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Calcul des excédents (surplus) par période
    const surplusDetails: { period: string; amount: number; date: Date }[] = [];
    let memberTotalSurplus = 0;

    const paymentsByPeriod: Record<string, typeof completedPayments> = {};
    completedPayments.forEach(p => {
      const periodName = p.period || "Unique";
      if (!paymentsByPeriod[periodName]) paymentsByPeriod[periodName] = [];
      paymentsByPeriod[periodName].push(p);
    });

    for (const [periodName, payments] of Object.entries(paymentsByPeriod)) {
      const sumForPeriod = payments.reduce((sum, p) => sum + p.amount, 0);
      if (sumForPeriod > target) {
        const surplus = sumForPeriod - target;
        memberTotalSurplus += surplus;
        const latestPaymentDate = new Date(Math.max(...payments.map(p => new Date(p.createdAt).getTime())));
        surplusDetails.push({
          period: periodName,
          amount: surplus,
          date: latestPaymentDate
        });
      }
    }

    globalTotalSurplus += memberTotalSurplus;
    
    const nbreMoisVerses = target > 0 ? Math.floor(actualPaid / target) : 0;
    
    let expectedTotal = target * elapsedPeriodsCount;
    let totalRetard = expectedTotal - actualPaid;
    if (totalRetard < 0) totalRetard = 0;
    
    const nbreMoisRetard = target > 0 ? Math.ceil(totalRetard / target) : 0;

    const paidPeriods = obl.payments
      .filter((p) => p.status === "COMPLETED" && p.period)
      .map((p) => p.period as string);

    return {
      id: obl.id,
      user: obl.user,
      targetAmount: target,
      amountPaid: actualPaid,
      totalRetard,
      nbreMoisVerses,
      nbreMoisRetard,
      status: obl.status,
      paidPeriods,
      payments: obl.payments,
      createdAt: obl.createdAt,
      totalSurplus: memberTotalSurplus,
      surplusDetails,
    };
  });

  return {
    campaign,
    statistics: {
      totalActiveMembers,
      enrolledCount,
      notEnrolledCount,
      enrollmentRate,
    },
    finances: {
      totalTargetAmount: globalTargetAmount,
      totalPaidAmount: globalPaidAmount,
      remainingAmount,
      paidCount,
      partialCount,
      unpaidCount,
      recoveryRate,
      globalTotalSurplus,
    },
    currentPeriodStats: {
      name: currentPeriod.name,
      targetAmount: currentPeriodTargetAmount,
      paidAmount: currentPeriodPaidAmount,
      recoveryRate: currentPeriodRecoveryRate,
    },
    payments: {
      distribution: paymentDistribution,
      pendingCount,
      pendingAmount,
      rejectedCount,
      rejectedAmount,
      all: allPayments,
    },
    allMembersData,
  };
}

export async function getGlobalReport() {
  const totalMembers = await prisma.user.count({ where: { role: "MEMBER", status: "ACTIVE" } });
  
  const allCampaigns = await prisma.campaign.findMany();
  
  const allPayments = await prisma.payment.findMany({
    where: { status: "COMPLETED" },
    orderBy: { createdAt: 'asc' }
  });

  let globalPaidAmount = 0;
  const monthlyData: Record<string, number> = {};
  
  allPayments.forEach(p => {
    globalPaidAmount += p.amount;
    const monthYear = p.createdAt.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
    if (!monthlyData[monthYear]) monthlyData[monthYear] = 0;
    monthlyData[monthYear] += p.amount;
  });

  const monthlyCollections = Object.keys(monthlyData).map(k => ({
    name: k,
    amount: monthlyData[k]
  }));

  // Payment methods distribution
  const paymentDistribution: Record<string, number> = {};
  allPayments.forEach(p => {
    if (!paymentDistribution[p.method]) paymentDistribution[p.method] = 0;
    paymentDistribution[p.method] += 1;
  });
  
  const methodDistribution = Object.keys(paymentDistribution).map(k => ({
    name: k,
    value: paymentDistribution[k]
  }));

  return {
    totalMembers,
    totalCampaigns: allCampaigns.length,
    globalPaidAmount,
    monthlyCollections,
    methodDistribution,
    allCampaigns: allCampaigns.map(c => ({ id: c.id, name: c.name, status: c.endDate > new Date() ? 'En cours' : 'Terminée' }))
  };
}
