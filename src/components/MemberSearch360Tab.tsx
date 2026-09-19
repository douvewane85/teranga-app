"use client";

import React, { useState } from "react";
import MemberDashboardClient from "@/app/member/campaigns/[id]/MemberDashboardClient";

type MemberData = {
  id: string;
  user: { id: string; name?: string | null; email: string; phone?: string | null };
  targetAmount: number;
  amountPaid: number;
  totalRetard: number;
  nbreMoisVerses: number;
  nbreMoisRetard: number;
  status: string;
  paidPeriods: string[];
  payments: any[];
  totalSurplus?: number;
  surplusDetails?: { period: string; amount: number; date: Date }[];
};

export default function MemberSearch360Tab({
  campaign,
  members,
}: {
  campaign: any;
  members: MemberData[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [showSurplusDetails, setShowSurplusDetails] = useState(false);

  // Filtrer les membres selon la recherche
  const filteredMembers = members.filter((member) => {
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    const phone = member.user.phone?.toLowerCase() || "";
    const email = member.user.email?.toLowerCase() || "";
    const name = member.user.name?.toLowerCase() || "";
    return phone.includes(q) || email.includes(q) || name.includes(q);
  });

  const handleSelectMember = (member: MemberData) => {
    setSelectedMember(member);
    setSearchQuery("");
    setShowSurplusDetails(false);
  };

  // Construire l'objet statistics et obligation attendu par MemberDashboardClient
  const renderMemberDashboard = () => {
    if (!selectedMember) return null;

    const pendingAmount = selectedMember.payments
      .filter((p: any) => p.status === "PENDING")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    // Simplification : On recrée les stats basées sur le membre
    const statistics = {
      totalTargetAmount: selectedMember.targetAmount * (selectedMember.nbreMoisVerses + selectedMember.nbreMoisRetard), // Approximatif ou on peut juste afficher le global
      totalPaidAmount: selectedMember.amountPaid,
      nbreMoisVerses: selectedMember.nbreMoisVerses,
      pendingAmount: pendingAmount,
      totalRetard: selectedMember.totalRetard,
      nbreMoisRetard: selectedMember.nbreMoisRetard,
      paidPeriods: selectedMember.paidPeriods,
    };

    const obligation = {
      id: selectedMember.id,
      user: selectedMember.user,
      targetAmount: selectedMember.targetAmount,
      payments: selectedMember.payments,
    };

    return (
      <div className="mt-8 border-t border-gray-200 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Dossier de : {selectedMember.user.name || selectedMember.user.email}
          </h2>
          <button
            onClick={() => setSelectedMember(null)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Fermer ce dossier
          </button>
        </div>

        {/* Mon statut personnel version admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-sm font-medium text-gray-500 mb-1">Déjà versé</span>
            <span className="text-3xl font-bold text-success">{statistics.totalPaidAmount.toLocaleString('fr-FR')} CFA</span>
            <span className="text-xs text-gray-500 mt-2">{statistics.nbreMoisVerses} période(s) payée(s)</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-sm font-medium text-gray-500 mb-1">En attente de validation</span>
            <span className="text-3xl font-bold text-warning">{statistics.pendingAmount.toLocaleString('fr-FR')} CFA</span>
          </div>

          <div className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col ${statistics.totalRetard > 0 ? 'border-red-200' : 'border-gray-100'}`}>
            <span className="text-sm font-medium text-gray-500 mb-1">Retard actuel</span>
            <span className={`text-3xl font-bold ${statistics.totalRetard > 0 ? 'text-danger' : 'text-gray-900'}`}>
              {statistics.totalRetard.toLocaleString('fr-FR')} CFA
            </span>
            {statistics.totalRetard > 0 && (
              <span className="text-xs text-danger mt-2">{statistics.nbreMoisRetard} période(s) en retard</span>
            )}
          </div>

          <div 
            className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col cursor-pointer transition-colors ${showSurplusDetails ? 'border-primary ring-1 ring-primary' : 'border-gray-100 hover:bg-gray-50'}`}
            onClick={() => setShowSurplusDetails(!showSurplusDetails)}
          >
            <span className="text-sm font-medium text-gray-500 mb-1">Total Excédent (Surplus)</span>
            <span className="text-3xl font-bold text-primary">{(selectedMember.totalSurplus || 0).toLocaleString('fr-FR')} CFA</span>
            <span className="text-xs text-gray-400 mt-2">Cliquer pour voir les détails</span>
          </div>
        </div>

        {showSurplusDetails && (
          <div className="bg-white rounded-xl shadow-sm border border-primary/20 overflow-hidden mb-8 animate-in fade-in slide-in-from-top-2">
            <div className="px-5 py-3 border-b border-gray-100 bg-primary/5 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-primary">Détails des excédents (Surplus)</h3>
              <button onClick={() => setShowSurplusDetails(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4">
              {!selectedMember.surplusDetails || selectedMember.surplusDetails.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">Aucun excédent enregistré pour ce membre.</p>
              ) : (
                <ul className="space-y-3">
                  {selectedMember.surplusDetails.map((detail: any, idx: number) => (
                    <li key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{detail.period}</span>
                        <span className="text-gray-500 ml-2">le {new Date(detail.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <span className="font-bold text-success">+{detail.amount.toLocaleString('fr-FR')} CFA</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <MemberDashboardClient
          obligation={obligation}
          campaign={campaign}
          statistics={statistics}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {!selectedMember && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-100 p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Rechercher un membre pour voir son historique détaillé
          </h3>
          <div className="max-w-xl relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Rechercher par numéro de téléphone, nom, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Résultats de recherche */}
            {searchQuery.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <li
                        key={member.id}
                        className="cursor-pointer select-none relative py-3 pl-3 pr-9 hover:bg-gray-50"
                        onClick={() => handleSelectMember(member)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 block truncate">
                            {member.user.name || member.user.email}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {member.user.phone || "Pas de téléphone"}
                          </span>
                        </div>
                        <span className="text-gray-500 block text-xs mt-1">
                          {member.user.email}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 cursor-default select-none relative py-3 pl-3 pr-9">
                      Aucun membre trouvé
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {renderMemberDashboard()}
    </div>
  );
}
