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
    
    // En-tête principal avec fond de couleur
    doc.setFillColor(14, 165, 233); // Couleur primaire
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(`Rapport de Campagne`, 14, 20);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`${campaignName} - Période: ${period.period}`, 14, 30);

    // Reset text color pour le corps du document
    doc.setTextColor(50, 50, 50);

    // Section Résumé Financier
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Résumé Financier", 14, 55);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 58, 196, 58);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    let periodTotalSurplus = 0;
    const tableRows: any[] = [];
    period.membersDetails.forEach((member) => {
      periodTotalSurplus += member.surplus;
      tableRows.push([
        member.name,
        member.target.toLocaleString("fr-FR"),
        member.paid.toLocaleString("fr-FR"),
        member.surplus > 0 ? `+${member.surplus.toLocaleString("fr-FR")}` : "0"
      ]);
    });

    // Boîtes de résumé textuel
    doc.text(`Objectif de la période: ${period.targetAmount.toLocaleString("fr-FR")} CFA`, 14, 68);
    doc.text(`Total versé: ${period.paidAmount.toLocaleString("fr-FR")} CFA`, 110, 68);
    
    doc.text(`Reste à recouvrer: ${period.remainingAmount.toLocaleString("fr-FR")} CFA`, 14, 76);
    doc.text(`Surplus généré: ${periodTotalSurplus.toLocaleString("fr-FR")} CFA`, 110, 76);

    // Titre de la table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Détails par Adhérent", 14, 95);
    doc.line(14, 98, 196, 98);

    // Tableau structuré
    autoTable(doc, {
      head: [["Adhérent", "Attendu (CFA)", "Versé (CFA)", "Surplus (CFA)"]],
      body: tableRows,
      startY: 105,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 250] },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'right', textColor: [22, 163, 74] }, // Vert pour le versé
        3: { halign: 'right', textColor: [14, 165, 233] }, // Bleu pour le surplus
      }
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
