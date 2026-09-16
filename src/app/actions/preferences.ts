"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function setUserDefaultCampaign(campaignId: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { defaultCampaignId: campaignId },
  });

  // Revalider les chemins pour que le changement soit pris en compte
  revalidatePath("/admin/finances/campaigns/[id]", "page");
  revalidatePath("/member/campaigns");
  revalidatePath("/admin/dashboard");
  revalidatePath("/member/dashboard");
}
