import React, { use } from "react";
import { getCampaignReport } from "@/app/actions/reports";
import { validatePayment, rejectPayment } from "@/app/actions/payments";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

import CampaignReportTabs from "@/components/CampaignReportTabs";
import MembersTableWithPaymentModal from "@/components/MembersTableWithPaymentModal";
import ProofImageModal from "@/components/ProofImageModal";
import MemberSearch360Tab from "@/components/MemberSearch360Tab";
import CampaignCharts from "@/components/CampaignCharts";
import CampaignSurplusCard from "@/components/CampaignSurplusCard";
import { setUserDefaultCampaign } from "@/app/actions/preferences";

export default async function CampaignReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const report = await getCampaignReport(params.id);
  const { campaign, statistics, finances, currentPeriodStats, payments, allMembersData } = report;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* 1. Informations générales et En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Rapport de campagne : {campaign.name} 
            {campaign.goalAmount && <span className="ml-2 text-primary font-medium">(Objectif : {campaign.goalAmount.toLocaleString('fr-FR')} CFA)</span>}
          </h1>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">{campaign.description}</p>
          <div className="mt-3 flex space-x-4 text-sm text-gray-500">
            <span>Début : {new Date(campaign.startDate).toLocaleDateString('fr-FR')}</span>
            <span>Fin : {new Date(campaign.endDate).toLocaleDateString('fr-FR')}</span>
            {(() => {
              const today = new Date();
              const nextDate = new Date(campaign.startDate);
              while (nextDate <= today && (campaign.frequency as string) !== "ONE_TIME") {
                if (campaign.frequency === "MONTHLY") nextDate.setMonth(nextDate.getMonth() + 1);
                else if (campaign.frequency === "QUARTERLY") nextDate.setMonth(nextDate.getMonth() + 3);
                else if (campaign.frequency === "SEMI_ANNUALLY") nextDate.setMonth(nextDate.getMonth() + 6);
                else if (campaign.frequency === "ANNUALLY") nextDate.setFullYear(nextDate.getFullYear() + 1);
                else break;
              }
              return (
                <span className="font-medium text-primary">
                  Prochaine Échéance : {nextDate.toLocaleDateString('fr-FR')}
                </span>
              );
            })()}
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <form action={async () => { "use server"; await setUserDefaultCampaign(campaign.id); }}>
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              title="Définir cette campagne comme ma campagne par défaut à la connexion"
            >
              📌 Épingler
            </button>
          </form>
          <Link
            href={`/admin/finances/campaigns/${campaign.id}/edit`}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Modifier
          </Link>
          <Link
            href={`/admin/finances/campaigns/${campaign.id}/enroll`}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Adhérer un membre
          </Link>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none"
          >
            Exporter (CSV)
          </button>
        </div>
      </div>

      <CampaignReportTabs 
        pendingValidationsCount={payments.pendingCount}
        overview={
          <div className="space-y-8">
            {/* Indicateurs Clés (KPIs) - Selon UX Strategy */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 px-4 py-5 sm:p-6">
                <dt className="truncate text-sm font-medium text-gray-500">Membres Actifs Total</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                  {statistics.totalActiveMembers}
                </dd>
                <p className="mt-2 text-sm text-gray-500">
                  {statistics.enrolledCount} inscrits à cette campagne
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

              <CampaignSurplusCard 
                globalTotalSurplus={finances.globalTotalSurplus} 
                members={allMembersData} 
              />
            </div>

            {/* Graphiques UX Strategy */}
            <CampaignCharts payments={payments.all} members={allMembersData} />

            {/* Répartition des méthodes de paiement */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Répartition des paiements</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {Object.entries(payments.distribution).map(([method, data]) => (
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
        validations={
          <div className="bg-white shadow-sm rounded-lg border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Paiements en attente de validation</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.all.filter(p => p.status === "PENDING").map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.obligation.user.name || payment.obligation.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.amount.toLocaleString('fr-FR')} CFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                        <form action={async () => { "use server"; await validatePayment(payment.id); }}>
                          <button type="submit" title="Valider ce paiement" className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </form>
                        <form action={async () => { "use server"; await rejectPayment(payment.id); }}>
                          <button type="submit" title="Rejeter ce paiement" className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </form>
                        {payment.proofUrl && (
                          <ProofImageModal url={payment.proofUrl} />
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.all.filter(p => p.status === "PENDING").length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Aucun paiement en attente.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        }
        members={
          <MembersTableWithPaymentModal 
            members={allMembersData} 
            campaignName={campaign.name} 
            campaignStartDate={campaign.startDate.toISOString()}
            campaignFrequency={campaign.frequency}
            campaignDueRule={campaign.dueRule}
            currentPeriodStats={currentPeriodStats}
          />
        }
        transactions={
          <div className="bg-white shadow-sm rounded-lg border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Historique détaillé des paiements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.all.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.obligation.user.name || payment.obligation.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.amount.toLocaleString('fr-FR')} CFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.reference || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant={payment.status === "COMPLETED" ? "success" : payment.status === "REJECTED" ? "danger" : "warning"}>
                          {payment.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {payments.all.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">Aucun paiement enregistré pour le moment.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        }
        memberSearch={
          <MemberSearch360Tab 
            campaign={campaign} 
            members={allMembersData} 
          />
        }
      />
    </div>
  );
}
