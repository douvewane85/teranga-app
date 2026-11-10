"use server";

import { PrismaClient, PaymentMethod } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// Récupérer la liste des catégories de dépenses (avec auto-initialisation si vide)
export async function getExpenseCategories() {
  let categories = await prisma.expenseCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { expenses: true },
      },
    },
  });

  if (categories.length === 0) {
    const defaultCategories = [
      { name: "Logistique & Transport", color: "#3B82F6", description: "Frais de déplacement, transport de matériel, carburant" },
      { name: "Restauration & Traiteur", color: "#F59E0B", description: "Repas, collations, boissons lors des réunions ou événements" },
      { name: "Location de salle & Matériel", color: "#8B5CF6", description: "Location d'espaces, sonorisation, chaises, vidéo-projecteurs" },
      { name: "Aide sociale & Solidarité", color: "#EC4899", description: "Secours aux membres, naissances, décès, mariages" },
      { name: "Communication & Événementiel", color: "#10B981", description: "Affiches, banderoles, réseaux sociaux, flyers" },
      { name: "Frais bancaires & Commissions", color: "#64748B", description: "Frais de virement, frais de tenue de compte, commissions" },
      { name: "Fournitures & Administratif", color: "#6366F1", description: "Papeterie, impressions, fournitures de bureau" },
      { name: "Autre", color: "#9CA3AF", description: "Dépenses diverses non classées ailleurs" },
    ];

    for (const cat of defaultCategories) {
      await prisma.expenseCategory.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      });
    }

    categories = await prisma.expenseCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });
  }

  return categories;
}

// Créer une nouvelle catégorie personnalisée
export async function createExpenseCategory(name: string, description?: string, color?: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return { success: false, error: "Action non autorisée. Réservée aux administrateurs." };
  }

  const trimmedName = name?.trim();
  if (!trimmedName) {
    return { success: false, error: "Le nom de la catégorie est obligatoire." };
  }

  try {
    const existing = await prisma.expenseCategory.findUnique({
      where: { name: trimmedName },
    });
    if (existing) {
      return { success: false, error: "Une catégorie avec ce nom existe déjà." };
    }

    const category = await prisma.expenseCategory.create({
      data: {
        name: trimmedName,
        description: description?.trim() || null,
        color: color || "#2563EB",
      },
    });

    return { success: true, category };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de la création de la catégorie." };
  }
}

// Supprimer une catégorie (seulement si aucune dépense n'y est rattachée)
export async function deleteExpenseCategory(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return { success: false, error: "Action non autorisée. Réservée aux administrateurs." };
  }

  try {
    const count = await prisma.expense.count({
      where: { categoryId: id },
    });

    if (count > 0) {
      return {
        success: false,
        error: `Impossible de supprimer cette catégorie car ${count} dépense(s) y sont actuellement associées.`,
      };
    }

    await prisma.expenseCategory.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de la suppression de la catégorie." };
  }
}

// Récupérer toutes les dépenses d'une campagne
export async function getCampaignExpenses(campaignId: string) {
  return await prisma.expense.findMany({
    where: { campaignId },
    include: {
      category: true,
      recordedBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { date: "desc" },
  });
}

// Enregistrer une nouvelle dépense
export async function createExpense(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return { success: false, error: "Action non autorisée. Réservée aux administrateurs." };
  }

  try {
    const campaignId = formData.get("campaignId") as string;
    const categoryId = formData.get("categoryId") as string;
    const title = formData.get("title") as string;
    const amountStr = formData.get("amount") as string;
    const dateStr = formData.get("date") as string | null;
    const beneficiary = formData.get("beneficiary") as string | null;
    const paymentModeStr = (formData.get("paymentMode") as string) || "CASH";
    const description = formData.get("description") as string | null;
    const file = formData.get("receipt") as File | null;

    if (!campaignId || !categoryId || !title || !amountStr) {
      return { success: false, error: "Veuillez remplir tous les champs obligatoires (Campagne, Titre, Catégorie, Montant)." };
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Le montant doit être un nombre supérieur à 0." };
    }

    let receiptUrl: string | null = null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `expense-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      receiptUrl = `/uploads/${fileName}`;
    }

    const expenseDate = dateStr ? new Date(dateStr) : new Date();

    const expense = await prisma.expense.create({
      data: {
        campaignId,
        categoryId,
        title: title.trim(),
        amount,
        date: expenseDate,
        beneficiary: beneficiary?.trim() || null,
        paymentMode: paymentModeStr as PaymentMethod,
        description: description?.trim() || null,
        receiptUrl,
        recordedById: session.user.id,
      },
    });

    revalidatePath(`/admin/finances/campaigns/${campaignId}`);
    revalidatePath(`/member/campaigns/${campaignId}`);
    revalidatePath("/admin/finances/campaigns");

    return { success: true, expense };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de l'enregistrement de la dépense." };
  }
}

// Mettre à jour une dépense existante
export async function updateExpense(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return { success: false, error: "Action non autorisée. Réservée aux administrateurs." };
  }

  try {
    const id = formData.get("id") as string;
    const campaignId = formData.get("campaignId") as string;
    const categoryId = formData.get("categoryId") as string;
    const title = formData.get("title") as string;
    const amountStr = formData.get("amount") as string;
    const dateStr = formData.get("date") as string | null;
    const beneficiary = formData.get("beneficiary") as string | null;
    const paymentModeStr = (formData.get("paymentMode") as string) || "CASH";
    const description = formData.get("description") as string | null;
    const file = formData.get("receipt") as File | null;

    if (!id || !campaignId || !categoryId || !title || !amountStr) {
      return { success: false, error: "Veuillez remplir tous les champs obligatoires." };
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Le montant doit être un nombre supérieur à 0." };
    }

    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      return { success: false, error: "Dépense introuvable." };
    }

    let receiptUrl = existingExpense.receiptUrl;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `expense-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      receiptUrl = `/uploads/${fileName}`;
    }

    const expenseDate = dateStr ? new Date(dateStr) : existingExpense.date;

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        categoryId,
        title: title.trim(),
        amount,
        date: expenseDate,
        beneficiary: beneficiary?.trim() || null,
        paymentMode: paymentModeStr as PaymentMethod,
        description: description?.trim() || null,
        receiptUrl,
      },
    });

    revalidatePath(`/admin/finances/campaigns/${campaignId}`);
    revalidatePath(`/member/campaigns/${campaignId}`);
    revalidatePath("/admin/finances/campaigns");

    return { success: true, expense };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de la modification de la dépense." };
  }
}

// Supprimer une dépense
export async function deleteExpense(id: string, campaignId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return { success: false, error: "Action non autorisée. Réservée aux administrateurs." };
  }

  try {
    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath(`/admin/finances/campaigns/${campaignId}`);
    revalidatePath(`/member/campaigns/${campaignId}`);
    revalidatePath("/admin/finances/campaigns");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de la suppression de la dépense." };
  }
}
