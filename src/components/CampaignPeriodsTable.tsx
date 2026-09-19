"use client";

import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type MemberDetail = {
  name: string;
  target: number;
  paid: number;
  remaining: number;
  surplus: number;
};

type PeriodStat = {
  period: string;
  date: Date;
  isPastOrCurrent: boolean;
  targetAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paidCount: number;
  lateCount: number;
  membersDetails: MemberDetail[];
};

export default function CampaignPeriodsTable({
  periodsStats,
  campaignName,
}: {
  periodsStats: PeriodStat[];
  campaignName: string;
}) {
  
  const generatePDF = (period: PeriodStat) => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(18);
    doc.text(`Rapport de Campagne - ${campaignName}`, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Période : ${period.period}`, 14, 30);
    
    // Résumé
    doc.setFontSize(10);
    doc.text(`Montant attendu : ${period.targetAmount.toLocaleString("fr-FR")} CFA`, 14, 40);
    doc.text(`Montant versé : ${period.paidAmount.toLocaleString("fr-FR")} CFA`, 14, 46);
    doc.text(`Restant : ${period.remainingAmount.toLocaleString("fr-FR")} CFA`, 14, 52);
    
    // Tableau des adhérents
    const tableColumn = ["Adhérent", "Attendu (CFA)", "Versé (CFA)", "Surplus (CFA)"];
    const tableRows: any[] = [];
    
    let periodTotalSurplus = 0;

    period.membersDetails.forEach((member) => {
      periodTotalSurplus += member.surplus;
      const rowData = [
        member.name,
        member.target.toLocaleString("fr-FR"),
        member.paid.toLocaleString("fr-FR"),
        member.surplus.toLocaleString("fr-FR")
      ];
      tableRows.push(rowData);
    });

    // Ajouter le Total Surplus au résumé
    doc.text(`Total Surplus : ${periodTotalSurplus.toLocaleString("fr-FR")} CFA`, 14, 58);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [14, 165, 233] }, // primary color (sky-500)
    });

    doc.save(`Rapport_${campaignName}_${period.period}.pdf`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Liste des Versements Mensuels</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mois / Période</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Attendu</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Versé</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Restant</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Membres à jour</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Membres en retard</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {periodsStats.filter((p) => p.isPastOrCurrent).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Aucune période disponible.
                </td>
              </tr>
            ) : (
              periodsStats.filter((p) => p.isPastOrCurrent).map((stat, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                      {stat.period}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {stat.targetAmount.toLocaleString("fr-FR")} CFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success text-right">
                    {stat.paidAmount.toLocaleString("fr-FR")} CFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {stat.remainingAmount > 0 ? (
                      <span className="text-warning">{stat.remainingAmount.toLocaleString("fr-FR")} CFA</span>
                    ) : (
                      <span className="text-gray-400">0 CFA</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="font-medium text-success">{stat.paidCount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {stat.lateCount > 0 ? (
                      <span className="font-medium text-danger">{stat.lateCount}</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => generatePDF(stat)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                      title="Télécharger le rapport PDF"
                    >
                      <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
