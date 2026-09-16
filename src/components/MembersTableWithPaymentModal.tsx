"use client";

import React, { useState } from "react";
import RecordPaymentModal from "./RecordPaymentModal";
import Member360ReportModal from "./Member360ReportModal";

type MemberData = {
  id: string; // Obligation id
  user: { name?: string | null; email: string };
  targetAmount: number;
  amountPaid: number;
  totalRetard: number;
  nbreMoisVerses: number;
  nbreMoisRetard: number;
  paidPeriods: string[];
};

import { generatePeriods } from "@/lib/periods";

export default function MembersTableWithPaymentModal({ 
  members, 
  campaignName,
  campaignStartDate,
  campaignFrequency,
  campaignDueRule,
  currentPeriodStats,
}: { 
  members: MemberData[];
  campaignName: string;
  campaignStartDate: string;
  campaignFrequency: string;
  campaignDueRule: string;
  currentPeriodStats: {
    name: string;
    targetAmount: number;
    paidAmount: number;
    recoveryRate: number;
  };
}) {
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [initialSelectedPeriod, setInitialSelectedPeriod] = useState<string | undefined>(undefined);
  const [selected360Member, setSelected360Member] = useState<MemberData | null>(null);

  const periods = generatePeriods(campaignStartDate, campaignFrequency);
  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Statistiques de la Période en Cours */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/20 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Période en cours</h4>
          <span className="text-2xl font-bold text-primary">{currentPeriodStats.name}</span>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-6 md:gap-12">
          <div>
            <p className="text-sm text-gray-500 mb-1">Montant attendu</p>
            <p className="text-lg font-semibold text-gray-900">{currentPeriodStats.targetAmount.toLocaleString('fr-FR')} CFA</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Montant perçu</p>
            <p className="text-lg font-semibold text-success">{currentPeriodStats.paidAmount.toLocaleString('fr-FR')} CFA</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Recouvrement</p>
            <p className="text-lg font-semibold text-primary">{currentPeriodStats.recoveryRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Membres de la campagne ({members.length})</h3>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Versé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Retard</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Nbre de Mois Versés</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Nbre de Mois En Retard</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => {
                const isPaid = (pName: string) => member.paidPeriods.includes(pName);
                const memberLatePeriods = periods.filter(p => {
                  const paid = isPaid(p.name);
                  return !paid && (
                    p.date < new Date(today.getFullYear(), today.getMonth(), 1) ||
                    (p.date.getMonth() === today.getMonth() && p.date.getFullYear() === today.getFullYear() && today.getDate() > parseInt(campaignDueRule || "0", 10))
                  );
                });

                return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.user.name || member.user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.targetAmount.toLocaleString('fr-FR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.amountPaid.toLocaleString('fr-FR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-danger">{member.totalRetard > 0 ? member.totalRetard.toLocaleString('fr-FR') : "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">{member.nbreMoisVerses}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-center">
                    <div className="flex flex-wrap gap-1 justify-center max-w-[200px] mx-auto">
                      {memberLatePeriods.length > 0 ? (
                        memberLatePeriods.map(lp => (
                          <span key={lp.name} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            {lp.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">Aucun</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelected360Member(member)}
                        className="text-xs px-2 py-1 rounded border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Vue 360°
                      </button>
                      <button 
                        onClick={() => {
                          setInitialSelectedPeriod(memberLatePeriods[0]?.name);
                          setSelectedMember(member);
                        }}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${memberLatePeriods.length > 0 ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'}`}
                      >
                        {memberLatePeriods.length > 0 ? "Régulariser Retard" : "Cotiser"}
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {members.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Aucun membre dans cette campagne.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMember && (
        <RecordPaymentModal 
          isOpen={true} 
          onClose={() => {
            setSelectedMember(null);
            setInitialSelectedPeriod(undefined);
          }}
          initialSelectedPeriod={initialSelectedPeriod}
          member={{
            id: selectedMember.id,
            name: selectedMember.user.name || selectedMember.user.email,
            targetAmount: selectedMember.targetAmount,
            paidPeriods: selectedMember.paidPeriods,
          }}
          campaignName={campaignName}
          campaignStartDate={campaignStartDate}
          campaignFrequency={campaignFrequency}
          campaignDueRule={campaignDueRule}
        />
      )}

      {selected360Member && (
        <Member360ReportModal
          isOpen={true}
          onClose={() => setSelected360Member(null)}
          member={selected360Member}
          campaignName={campaignName}
          campaignStartDate={campaignStartDate}
          campaignFrequency={campaignFrequency}
          campaignDueRule={campaignDueRule}
        />
      )}
    </div>
  );
}

