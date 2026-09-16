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

        <MemberCampaignTabs 
          overview={
            <div className="space-y-8">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="mr-2">🌍</span> Vue d'ensemble globale de la campagne
              </h2>
              
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 px-4 py-5 sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">Membres Actifs Total</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                    {adminStats.totalActiveMembers}
                  </dd>
                  <p className="mt-2 text-sm text-gray-500">
                    {adminStats.enrolledCount} inscrits à cette campagne
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 px-4 py-5 sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">Statut des Membres</dt>
                  <dd className="mt-1 text-xl font-semibold tracking-tight text-gray-900 flex space-x-4">
                    <span className="text-green-600">{allMembersData.filter(m => m.nbreMoisRetard === 0).length} à jour</span>
                    <span className="text-red-600">{allMembersData.filter(m => m.nbreMoisRetard > 0).length} en retard</span>
                  </dd>
                  <p className="mt-2 text-sm text-gray-500">Sur {allMembersData.length} adhésions</p>
                </div>

                <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 px-4 py-5 sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">Cotisations Attendues</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                    {finances.totalTargetAmount.toLocaleString('fr-FR')} CFA
                  </dd>
                  <p className="mt-2 text-sm text-gray-500">Objectif global de la campagne</p>
                </div>

                <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 px-4 py-5 sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">Montant Encaissé</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-success">
                    {finances.totalPaidAmount.toLocaleString('fr-FR')} CFA
                  </dd>
                  <p className="mt-2 text-sm text-gray-500">Paiements validés uniquement</p>
                </div>

                <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 px-4 py-5 sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">Reste à recouvrer</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-warning">
                    {finances.remainingAmount.toLocaleString('fr-FR')} CFA
                  </dd>
                  <p className="mt-2 text-sm text-gray-500">Montant total des impayés</p>
                </div>

                <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 px-4 py-5 sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">Taux de recouvrement</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-primary">
                    {finances.recoveryRate.toFixed(1)}%
                  </dd>
                  <p className="mt-2 text-sm text-gray-500">Sur l'objectif attendu</p>
                </div>
              </div>

              <CampaignCharts payments={payments.all} members={allMembersData} />
              
              <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Répartition des paiements (Globale)</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {Object.entries(payments.distribution).map(([method, data]: [string, any]) => (
                      <li key={method} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 text-sm">{method}</span>
                          <span className="ml-2 text-xs text-gray-500">({data.count} tx)</span>
                        </div>
                        <span className="font-semibold text-gray-700">{data.total.toLocaleString('fr-FR')} CFA</span>
                      </li>
                    ))}
                    {Object.keys(payments.distribution).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">Aucun paiement validé.</p>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          }
          personal={
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">👤</span> Mon statut personnel
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Montant attendu (Global)</span>
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
                </div>
              </div>

              {/* Composant Client pour les retards et le modal de paiement */}
              <MemberDashboardClient 
                obligation={obligation}
                campaign={campaign}
                statistics={statistics}
              />
            </div>
          }
        />
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
