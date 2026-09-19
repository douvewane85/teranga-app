import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import EditCampaignForm from "./EditCampaignForm";

const prisma = new PrismaClient();

export default async function EditCampaignPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      tiers: true,
    }
  });

  if (!campaign) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Modifier la campagne</h1>
        <p className="mt-1 text-sm text-gray-500">
          Mettez à jour les informations et les tranches de cotisation de cette campagne.
        </p>
      </div>

      <EditCampaignForm campaign={campaign} initialTiers={campaign.tiers} />
    </div>
  );
}
