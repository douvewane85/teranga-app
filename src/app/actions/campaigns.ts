"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function createCampaign(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const frequency = formData.get("frequency") as any;
  const dueRule = formData.get("dueRule") as string;
  const goalAmountStr = formData.get("goalAmount") as string;

  // Récupération des montants dynamiques
  const tierNames = formData.getAll("tierName[]") as string[];
  const tierAmounts = formData.getAll("tierAmount[]") as string[];

  if (!name || !startDateStr || !endDateStr || !frequency || !dueRule) {
    throw new Error("Veuillez remplir tous les champs obligatoires (nom, dates, échéance)");
  }

  if (tierNames.length === 0 || tierAmounts.length === 0 || tierNames.length !== tierAmounts.length) {
    throw new Error("Vous devez ajouter au moins un montant de cotisation");
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const goalAmount = goalAmountStr ? parseFloat(goalAmountStr) : null;

  if (startDate >= endDate) {
    throw new Error("La date de début doit être avant la date de fin");
  }

  const tiersData = tierNames.map((tName, i) => {
    const amount = parseFloat(tierAmounts[i]);
    if (isNaN(amount) || amount <= 0) {
      throw new Error(`Le montant pour "${tName}" doit être positif`);
    }
    return {
      name: tName,
      amount,
    };
  });

  // Création de la campagne et des obligations dans une transaction
  await prisma.$transaction(async (tx) => {
    // 1. Créer la campagne avec ses paliers
    await tx.campaign.create({
      data: {
        name,
        description,
        startDate,
        endDate,
        frequency,
        dueRule,
        goalAmount,
        tiers: {
          create: tiersData,
        },
      },
    });

    // L'ajout automatique des obligations a été retiré (US-ADH-01)
  });

  revalidatePath("/admin/finances/campaigns");
  redirect("/admin/finances/campaigns");
}

export async function enrollMembersToCampaign(formData: FormData) {
  const campaignId = formData.get("campaignId") as string;
  const targetAmountStr = formData.get("targetAmount") as string;
  const userIds = formData.getAll("userIds[]") as string[];

  // Valeurs optionnelles
  const customFrequency = formData.get("customFrequency") as string | null;
  const customDueRule = formData.get("customDueRule") as string | null;

  if (!campaignId || userIds.length === 0 || !targetAmountStr) {
    throw new Error("Veuillez remplir les informations obligatoires (campagne, membres, montant).");
  }

  const targetAmount = parseFloat(targetAmountStr);
  if (isNaN(targetAmount) || targetAmount <= 0) {
    throw new Error("Le montant doit être positif.");
  }

  // Vérification de doublon (CA-07)
  const existingObligation = await prisma.obligation.findUnique({
    where: {
      userId_campaignId: {
        userId: userIds[0],
        campaignId,
      },
    },
  });

  if (existingObligation) {
    throw new Error("Ce membre est déjà inscrit à cette campagne. Pour modifier son adhésion, utilisez l'action de modification.");
  }

  // Création de l'obligation
  await prisma.obligation.create({
    data: {
      userId: userIds[0],
      campaignId,
      status: "PENDING",
      targetAmount,
      customFrequency: customFrequency ? (customFrequency as any) : null,
      customDueRule: customDueRule || null,
    },
  });

  revalidatePath(`/admin/finances/campaigns/${campaignId}`);
}
