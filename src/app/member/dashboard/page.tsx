import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMemberCampaigns, getMemberCampaignDetails } from "@/app/actions/member";
import { getGlobalMembersStatus } from "@/app/actions/reports";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function MemberDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userDetails = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { defaultCampaignId: true },
  });

  if (userDetails?.defaultCampaignId) {
    redirect(`/member/campaigns/${userDetails.defaultCampaignId}`);
  }

  const obligations = await getMemberCampaigns(session.user.id);
  const globalMembersStatus = await getGlobalMembersStatus();
  
  // Si aucune campagne, on affiche un message vide
  if (obligations.length === 0) {
    return (
      <div className="max-w-7xl mx-auto pb-12">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Vue d'ensemble</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="mx-auto h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">📭</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune cotisation active</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Vous n'êtes actuellement inscrit à aucune campagne de cotisation.
          </p>
          <Link href="/member/campaigns" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Voir les campagnes
          </Link>
        </div>
      </div>
    );
  }

  // Calculer les statistiques globales
  let totalExpected = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let totalLate = 0;

  // On va utiliser getMemberCampaignDetails pour chaque campagne pour avoir les retards précis
  for (const obl of obligations) {
    try {
      const details = await getMemberCampaignDetails(obl.campaignId, session.user.id);
      totalExpected += details.statistics.totalTargetAmount;
      totalPaid += details.statistics.totalPaidAmount;
      totalPending += details.statistics.pendingAmount;
      totalLate += details.statistics.totalRetard;
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vue d'ensemble</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            Résumé global de l'état de vos cotisations sur toutes les campagnes actives.
          </p>
        </div>
      </div>

      {/* Résumé financier global */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">Montant attendu (Global)</span>
          <span className="text-3xl font-bold text-gray-900">{totalExpected.toLocaleString('fr-FR')} CFA</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">Total versé</span>
          <span className="text-3xl font-bold text-success">{totalPaid.toLocaleString('fr-FR')} CFA</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">En attente de validation</span>
          <span className="text-3xl font-bold text-warning">{totalPending.toLocaleString('fr-FR')} CFA</span>
        </div>

        <div className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col ${totalLate > 0 ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
          <span className="text-sm font-medium text-gray-500 mb-1">Retard global</span>
          <span className={`text-3xl font-bold ${totalLate > 0 ? 'text-danger' : 'text-gray-900'}`}>
            {totalLate.toLocaleString('fr-FR')} CFA
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">Statut des Membres (Global)</span>
          <span className="text-lg font-semibold text-gray-900 flex space-x-3 mt-1">
            <span className="text-green-600">{globalMembersStatus.aJour} à jour</span>
            <span className="text-red-600">{globalMembersStatus.enRetard} en retard</span>
          </span>
          <span className="text-xs text-gray-500 mt-2">Sur {globalMembersStatus.total} membres actifs de l'association</span>
        </div>
      </div>

      {/* Raccourci vers les campagnes */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📂</span> Mes campagnes actives
          </h2>
          <Link href="/member/campaigns" className="text-sm font-medium text-primary hover:text-primary-hover">
            Voir toutes mes cotisations →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {obligations.map((obl) => {
            const isOverdue = new Date(obl.campaign.endDate) < new Date();
            const isActive = new Date(obl.campaign.startDate) <= new Date() && !isOverdue;
            
            return (
              <Link key={obl.campaign.id} href={`/member/campaigns/${obl.campaign.id}`} className="block border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{obl.campaign.name}</h3>
                  {isActive && <Badge variant="success">En cours</Badge>}
                  {isOverdue && <Badge variant="danger">Expirée</Badge>}
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Versé:</span>
                  <span className="font-medium text-success">
                    {obl.payments.filter(p => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0).toLocaleString('fr-FR')} CFA
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}
