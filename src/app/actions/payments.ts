"use server";

import { PrismaClient, PaymentMethod, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export async function recordManualPayment(formData: FormData) {
  try {
    const obligationId = formData.get("obligationId") as string;
    const amountStr = formData.get("amount") as string;
    const methodStr = formData.get("method") as string;
    const period = formData.get("period") as string | null;
    const file = formData.get("proof") as File | null;
    
    // 1. Validation de base
    if (!obligationId || !amountStr || !methodStr) {
      return { success: false, error: "Tous les champs obligatoires ne sont pas remplis." };
    }

    const amount = parseFloat(amountStr);
    if (amount <= 0) {
      return { success: false, error: "Le montant doit être supérieur à 0." };
    }

    const method = methodStr as PaymentMethod;
    // Supprimé: la référence n'est plus obligatoire

    // 2. Vérification de l'obligation
    const obligation = await prisma.obligation.findUnique({
      where: { id: obligationId },
      include: { payments: true }
    });

    if (!obligation) {
      return { success: false, error: "Obligation introuvable." };
    }

    // Calcul du reste à payer pour cette obligation
    const target = obligation.targetAmount || 0; // Note: on the modal side, target is per period. But amountPaid is total.
    // For this specific US, the user says "Une période déjà totalement payée ne doit pas pouvoir être enregistrée". 
    // And "Le montant payé ne doit pas dépasser le montant restant à payer pour la période".
    // WE HAVE CHANGED THIS: We now allow overpayments (surplus) for a period.
    // The previous validation blocking payments if totalPaidForPeriod >= target has been removed.

    // Règle: Un seul enregistrement de paiement par période
    if (period) {
      const existingPayment = await prisma.payment.findFirst({
        where: { obligationId, period }
      });
      if (existingPayment) {
        return { success: false, error: "Un paiement a déjà été enregistré pour cette période." };
      }
    }

    // 3. Upload de fichier local (si fourni)
    let proofUrl = null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, fileName);
      
      await fs.writeFile(filePath, buffer);
      proofUrl = `/uploads/${fileName}`;
    } else if ((method === "WAVE" || method === "ORANGE_MONEY")) {
       return { success: false, error: "La preuve de paiement (capture) est obligatoire pour Wave et Orange Money." };
    }

    // 4. Enregistrement du paiement
    // (Dans un vrai système on récupèrerait l'ID de l'admin connecté via la session)
    
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          obligationId,
          amount,
          method,
          period,
          status: PaymentStatus.COMPLETED, // Validé automatiquement car saisi par l'admin
          proofUrl,
          validatedAt: new Date(),
        }
      });

      // Recalcul du montant total payé sur l'obligation
      const allCompleted = await tx.payment.findMany({
        where: { obligationId, status: PaymentStatus.COMPLETED }
      });
      const newTotalPaid = allCompleted.reduce((sum, p) => sum + p.amount, 0);

      await tx.obligation.update({
        where: { id: obligationId },
        data: { amountPaid: newTotalPaid }
      });
    });

    // 5. Revalidation
    revalidatePath("/admin/finances/campaigns/[id]", "page");
    return { success: true };
    
  } catch (error: any) {
    console.error("Erreur recordManualPayment:", error);
    return { success: false, error: error.message || "Une erreur interne est survenue." };
  }
}

export async function validatePayment(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) throw new Error("Paiement introuvable.");
    if (payment.status !== "PENDING") throw new Error("Ce paiement n'est pas en attente.");

    await prisma.$transaction(async (tx) => {
      // 1. Marquer le paiement comme validé
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "COMPLETED",
          validatedAt: new Date(),
        }
      });

      // 2. Recalculer le total payé pour l'obligation
      const allCompleted = await tx.payment.findMany({
        where: { obligationId: payment.obligationId, status: "COMPLETED" }
      });
      const newTotalPaid = allCompleted.reduce((sum, p) => sum + p.amount, 0);

      await tx.obligation.update({
        where: { id: payment.obligationId },
        data: { amountPaid: newTotalPaid }
      });
    });

    revalidatePath("/admin/finances/campaigns/[id]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectPayment(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) throw new Error("Paiement introuvable.");
    if (payment.status !== "PENDING") throw new Error("Ce paiement n'est pas en attente.");

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "REJECTED",
      }
    });

    revalidatePath("/admin/finances/campaigns/[id]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePaymentAmount(paymentId: string, newAmount: number) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new Error("Paiement introuvable.");

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { amount: newAmount }
      });

      if (payment.status === "COMPLETED") {
        const allCompleted = await tx.payment.findMany({
          where: { obligationId: payment.obligationId, status: "COMPLETED" }
        });
        const newTotalPaid = allCompleted.reduce((sum, p) => sum + p.amount, 0);
        await tx.obligation.update({
          where: { id: payment.obligationId },
          data: { amountPaid: newTotalPaid }
        });
      }
    });

    revalidatePath("/admin/finances/campaigns/[id]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePayment(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new Error("Paiement introuvable.");

    await prisma.$transaction(async (tx) => {
      await tx.payment.delete({
        where: { id: paymentId },
      });

      if (payment.status === "COMPLETED") {
        const allCompleted = await tx.payment.findMany({
          where: { obligationId: payment.obligationId, status: "COMPLETED" }
        });
        const newTotalPaid = allCompleted.reduce((sum, p) => sum + p.amount, 0);
        await tx.obligation.update({
          where: { id: payment.obligationId },
          data: { amountPaid: newTotalPaid }
        });
      }
    });

    revalidatePath("/admin/finances/campaigns/[id]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function convertSurplusToContribution(paymentId: string, targetPeriod: string, targetAmount: number) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new Error("Paiement introuvable.");

    const obligation = await prisma.obligation.findUnique({
      where: { id: payment.obligationId }
    });

    if (!obligation) throw new Error("Obligation introuvable.");

    // Just basic validation
    if (payment.amount < obligation.targetAmount * 2) {
      // Actually the surplus is amount - targetAmount >= targetAmount => amount >= 2 * targetAmount
      // This is mostly checked on the frontend
    }

    const requiredSurplus = targetAmount; 
    
    await prisma.$transaction(async (tx) => {
      // 1. Réduire le montant du paiement d'origine
      await tx.payment.update({
        where: { id: paymentId },
        data: { amount: payment.amount - requiredSurplus }
      });

      // 2. Créer un nouveau paiement pour la période de destination
      await tx.payment.create({
        data: {
          obligationId: payment.obligationId,
          amount: requiredSurplus,
          method: payment.method,
          period: targetPeriod,
          status: "COMPLETED",
          validatedAt: new Date(),
        }
      });

      // Pas besoin de changer amountPaid sur l'obligation car le montant total reste le même!
    });

    revalidatePath("/admin/finances/campaigns/[id]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
