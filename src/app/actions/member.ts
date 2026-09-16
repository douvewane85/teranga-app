"use server";

import { PrismaClient, PaymentMethod, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// Récupérer la liste des campagnes auxquelles le membre est inscrit
export async function getMemberCampaigns(userId: string) {
  const obligations = await prisma.obligation.findMany({
    where: { userId },
    include: {
      campaign: true,
      payments: true,
    },
    orderBy: { campaign: { startDate: "desc" } }
  });

  return obligations;
}

// Récupérer les détails d'une campagne spécifique pour un membre
export async function getMemberCampaignDetails(campaignId: string, userId: string) {
  const obligation = await prisma.obligation.findFirst({
    where: { campaignId, userId },
    include: {
      campaign: true,
      payments: {
        orderBy: { createdAt: "desc" }
      },
      user: true,
    }
  });

  if (!obligation) {
    throw new Error("Vous n'êtes pas inscrit à cette campagne.");
  }

  const campaign = obligation.campaign;
  
  // Calculs similaires à ceux de l'admin
  const today = new Date();
  const start = new Date(campaign.startDate);
  const end = new Date(campaign.endDate);
  const frequency = campaign.frequency || "MONTHLY";
  
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
  if (periods.length === 0) periods.push({ name: "Unique", date: start });

  const totalPeriodsCount = periods.length;
  let elapsedPeriodsCount = 0;
  for (let i = 0; i < periods.length; i++) {
    if (periods[i].date <= today) {
      elapsedPeriodsCount = i + 1;
    } else {
      break;
    }
  }
  if (elapsedPeriodsCount === 0) elapsedPeriodsCount = 1;

  const target = obligation.targetAmount || campaign.goalAmount || 0;
  const actualPaid = obligation.payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = obligation.payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);

  const nbreMoisVerses = target > 0 ? Math.floor(actualPaid / target) : 0;
  let expectedTotal = target * elapsedPeriodsCount;
  let totalRetard = expectedTotal - actualPaid;
  if (totalRetard < 0) totalRetard = 0;
  
  const nbreMoisRetard = target > 0 ? Math.ceil(totalRetard / target) : 0;

  const paidPeriods = obligation.payments
    .filter((p) => p.status === "COMPLETED" && p.period)
    .map((p) => p.period as string);

  // --- STATISTIQUES GLOBALES DE LA CAMPAGNE ---
  const allObligations = await prisma.obligation.findMany({
    where: { campaignId },
    include: { payments: true }
  });

  let globalTarget = 0;
  let globalPaid = 0;
  
  allObligations.forEach(obl => {
    const oblTarget = obl.targetAmount || campaign.goalAmount || 0;
    const oblPaid = obl.payments
      .filter(p => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0);
    
    globalTarget += (oblTarget * totalPeriodsCount);
    globalPaid += oblPaid;
  });

  const globalStats = {
    totalMembers: allObligations.length,
    globalTargetAmount: globalTarget,
    globalPaidAmount: globalPaid,
    progressPercentage: globalTarget > 0 ? (globalPaid / globalTarget) * 100 : 0
  };

  return {
    obligation,
    campaign,
    statistics: {
      totalTargetAmount: target * totalPeriodsCount,
      totalPaidAmount: actualPaid,
      pendingAmount,
      totalRetard,
      nbreMoisVerses,
      nbreMoisRetard,
      paidPeriods,
    },
    globalStats
  };
}

// Action de déclaration d'un paiement par un membre
export async function declarePayment(formData: FormData) {
  try {
    const obligationId = formData.get("obligationId") as string;
    const amountStr = formData.get("amount") as string;
    const methodStr = formData.get("method") as string;
    const reference = formData.get("reference") as string | null;
    const period = formData.get("period") as string | null;
    const file = formData.get("proof") as File | null;
    
    // Le membre ne peut pas payer en cash
    if (methodStr === "CASH") {
      return { success: false, error: "Le paiement en espèces n'est pas autorisé pour les membres." };
    }

    if (!obligationId || !amountStr || !methodStr || !reference) {
      return { success: false, error: "Tous les champs obligatoires (incluant la référence) doivent être remplis." };
    }

    const amount = parseFloat(amountStr);
    if (amount <= 0) {
      return { success: false, error: "Le montant doit être supérieur à 0." };
    }

    const method = methodStr as PaymentMethod;
    
    // 2. Vérification de l'obligation
    const obligation = await prisma.obligation.findUnique({
      where: { id: obligationId },
      include: { payments: true }
    });

    if (!obligation) {
      return { success: false, error: "Obligation introuvable." };
    }

    // Upload
    let proofUrl = null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, fileName);
      
      await fs.writeFile(filePath, buffer);
      proofUrl = `/uploads/${fileName}`;
    } else {
       return { success: false, error: "La preuve de paiement (capture) est obligatoire." };
    }

    // Création du paiement en statut PENDING
    // On ne modifie PAS amountPaid de l'obligation ici
    await prisma.payment.create({
      data: {
        obligationId,
        amount,
        method,
        reference,
        period,
        status: PaymentStatus.PENDING, 
        proofUrl,
      }
    });

    revalidatePath("/member/campaigns/[id]", "page");
    return { success: true };
    
  } catch (error: any) {
    console.error("Erreur declarePayment:", error);
    return { success: false, error: error.message || "Une erreur interne est survenue." };
  }
}
