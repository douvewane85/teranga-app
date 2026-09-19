"use client";

import React, { useState } from "react";

type SurplusDetail = {
  period: string;
  amount: number;
  date: Date;
};

type MemberWithSurplus = {
  id: string;
  user: { name?: string | null; email: string };
  totalSurplus: number;
  surplusDetails: SurplusDetail[];
};

export default function CampaignSurplusCard({
  globalTotalSurplus,
  members,
}: {
  globalTotalSurplus: number;
  members: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter only members who have a surplus
  const membersWithSurplus = members.filter((m) => m.totalSurplus > 0) as MemberWithSurplus[];

  return (
    <>
      <div 
        className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 px-4 py-5 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors group relative"
        onClick={() => setIsOpen(true)}
      >
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <dt className="truncate text-sm font-medium text-gray-500">Total excédents (Surplus)</dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-primary">
          {globalTotalSurplus.toLocaleString('fr-FR')} CFA
        </dd>
        <p className="mt-2 text-sm text-gray-500 group-hover:text-primary transition-colors">
          Voir les détails
        </p>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                Détails des Excédents (Surplus)
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors border border-gray-200 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-0 overflow-y-auto flex-1 bg-white">
              {membersWithSurplus.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun excédent</h3>
                  <p className="text-gray-500">Aucun membre n'a enregistré de surplus (don) pour cette campagne.</p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {membersWithSurplus.map((member) => (
                    <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">{member.user.name || member.user.email}</h3>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          Total: {member.totalSurplus.toLocaleString('fr-FR')} CFA
                        </span>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-3">
                          {member.surplusDetails.map((detail, index) => (
                            <li key={`${member.id}-${index}`} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg">
                              <div>
                                <span className="font-medium text-gray-900">{detail.period}</span>
                                <span className="text-gray-500 ml-2">le {new Date(detail.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <span className="font-bold text-success">+{detail.amount.toLocaleString('fr-FR')} CFA</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">
                Total Global : <span className="text-lg font-bold text-success ml-2">{globalTotalSurplus.toLocaleString('fr-FR')} CFA</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
