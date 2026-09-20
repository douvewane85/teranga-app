"use client";

import { useState } from "react";
import MemberSurplusCard from "./MemberSurplusCard";

export default function MemberPersonalStatus({ 
  allMembersData, 
  statistics 
}: { 
  allMembersData: any[]; 
  statistics: any; 
}) {
  const [showSurplus, setShowSurplus] = useState(false);

  return (
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

        {/* Carte pour le surplus avec gestion de l'ouverture */}
        <MemberSurplusCard 
          totalSurplus={statistics.totalSurplus} 
          onClick={() => setShowSurplus(!showSurplus)}
          isOpen={showSurplus}
          hasDetails={statistics.surplusDetails && statistics.surplusDetails.length > 0}
        />
      </div>

      {/* Section détaillée des surplus si existant et ouverte */}
      {showSurplus && statistics.surplusDetails && statistics.surplusDetails.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-green-100 p-6 animate-in slide-in-from-top-2 fade-in">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📈</span> Détails de mes surplus
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mois / Période</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Attendu</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Versé</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Surplus (CFA)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {statistics.surplusDetails.map((detail: any, idx: number) => (
                  <tr key={idx} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {detail.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {detail.expected.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {detail.paid.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-success text-right">
                      +{detail.surplus.toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
