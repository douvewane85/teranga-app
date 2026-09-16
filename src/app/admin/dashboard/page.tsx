import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.defaultCampaignId) {
    redirect(`/admin/finances/campaigns/${user.defaultCampaignId}`);
  }

  // Fallback : s'il n'y a qu'une seule campagne dans tout le système, elle devient la campagne par défaut
  const totalCampaigns = await prisma.campaign.count();
  if (totalCampaigns === 1) {
    const onlyCampaign = await prisma.campaign.findFirst();
    if (onlyCampaign) {
      redirect(`/admin/finances/campaigns/${onlyCampaign.id}`);
    }
  }

  // S'il y a plusieurs campagnes et aucun choix, on redirige vers la liste globale des campagnes
  redirect("/admin/finances/campaigns");
}
