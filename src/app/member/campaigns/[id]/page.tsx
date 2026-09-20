import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMemberCampaignDetails } from "@/app/actions/member";
import { getCampaignReport } from "@/app/actions/reports";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import MemberDashboardClient from "./MemberDashboardClient";
import CampaignCharts from "@/components/CampaignCharts";
import MemberCampaignTabs from "@/components/MemberCampaignTabs";
import CampaignPeriodsTable from "@/components/CampaignPeriodsTable";
import MemberSurplusCard from "@/components/MemberSurplusCard";

export default async function MemberCampaignDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  const params = await props.params;
  
  try {
    const details = await getMemberCampaignDetails(params.id, session.user.id);
    const report = await getCampaignReport(params.id); 
    const { campaign, statistics, obligation } = details;
    const { statistics: adminStats, finances, allMembersData, payments } = report;

    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* En-tête de la campagne */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/member/campaigns" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {campaign.name}
              </h1>
            </div>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">{campaign.description}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Badge variant="info">{campaign.frequency}</Badge>
          </div>
        </div>

        <div className="space-y-8 mt-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">👤</span> Mon statut personnel
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <span className="text-sm font-medium text-gray-500 mb-1">Statut des Membres</span>
                <div className="mt-1 text-xl font-semibold tracking-tight text-gray-900 flex flex-col space-y-1">
                  <span className="text-green-600 text-sm">{allMembersData.filter(m => m.nbreMoisRetard === 0).length} à jour</span>
                  <span className="text-red-600 text-sm">{allMembersData.filter(m => m.nbreMoisRetard > 0).length} en retard</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <span className="text-sm font-medium text-gray-500 mb-1">Mon Objectif Total</span>
                <span className="text-3xl font-bold text-gray-900">{statistics.totalTargetAmount.toLocaleString('fr-FR')} CFA</span>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <span className="text-sm font-medium text-gray-500 mb-1">Déjà versé</span>
                <span className="text-3xl font-bold text-success">{statistics.totalPaidAmount.toLocaleString('fr-FR')} CFA</span>
                <span className="text-xs text-gray-500 mt-2">{statistics.nbreMoisVerses} période(s) payée(s)</span>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <span className="text-sm font-medium text-gray-500 mb-1">En attente de validation</span>
                <span className="text-3xl font-bold text-warning">{statistics.pendingAmount.toLocaleString('fr-FR')} CFA</span>
              </div>

              <div className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col ${statistics.totalRetard > 0 ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                <span className="text-sm font-medium text-gray-500 mb-1">Retard actuel</span>
                <span className={`text-3xl font-bold ${statistics.totalRetard > 0 ? 'text-danger' : 'text-gray-900'}`}>
                  {statistics.totalRetard.toLocaleString('fr-FR')} CFA
                </span>
                {statistics.totalRetard > 0 && (
                  <span className="text-xs text-danger mt-2">{statistics.nbreMoisRetard} période(s) en retard</span>
                )}
              </div>

              {/* Nouveau composant pour le surplus */}
              <MemberSurplusCard 
                totalSurplus={statistics.totalSurplus} 
                surplusDetails={statistics.surplusDetails} 
              />
            </div>
          </div>

          {/* Composant Client pour les retards */}
          <MemberDashboardClient 
            obligation={obligation}
            campaign={campaign}
            statistics={statistics}
            view="personal"
          />

          <MemberCampaignTabs 
            history={
              <MemberDashboardClient 
                obligation={obligation}
                campaign={campaign}
                statistics={statistics}
                view="history"
              />
            }
            globalPeriods={
              <CampaignPeriodsTable periodsStats={report.periodsStats} campaignName={campaign.name} />
            }
          />
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
        <h2 className="text-lg font-bold mb-2">Accès refusé</h2>
        <p>{error.message || "Impossible de charger les détails de cette campagne."}</p>
        <Link href="/member/campaigns" className="text-primary hover:underline mt-4 inline-block">
          Retour à mes cotisations
        </Link>
      </div>
    );
  }
}
