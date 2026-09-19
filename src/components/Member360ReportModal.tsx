"use client";

import React from "react";
import { generatePeriods } from "@/lib/periods";

type MemberData = {
  id: string;
  user: { name?: string | null; email: string };
  targetAmount: number;
  amountPaid: number;
  totalRetard: number;
  nbreMoisVerses: number;
  nbreMoisRetard: number;
  paidPeriods: string[];
  totalSurplus?: number;
  surplusDetails?: { period: string; amount: number; date: Date }[];
};

export default function Member360ReportModal({
  isOpen,
  onClose,
  member,
  campaignName,
  campaignStartDate,
  campaignFrequency,
  campaignDueRule,
}: {
  isOpen: boolean;
  onClose: () => void;
  member: MemberData;
  campaignName: string;
  campaignStartDate: string;
  campaignFrequency: string;
  campaignDueRule: string;
}) {
  const [showSurplusDetails, setShowSurplusDetails] = React.useState(false);
  if (!isOpen) return null;

  const periods = generatePeriods(campaignStartDate, campaignFrequency);
  const today = new Date();

  // Helper to get status of a period
  const getPeriodStatus = (periodDate: Date, periodName: string) => {
    if (member.paidPeriods.includes(periodName)) {
      return "PAID";
    }
    const isPast =
      periodDate < new Date(today.getFullYear(), today.getMonth(), 1) ||
      (periodDate.getMonth() === today.getMonth() &&
        periodDate.getFullYear() === today.getFullYear() &&
        today.getDate() > parseInt(campaignDueRule || "0", 10));

    return isPast ? "LATE" : "PENDING";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Vue 360° - {member.user.name || member.user.email}
            </h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {campaignName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors border border-gray-200 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cible Mensuelle</p>
                <p className="text-xl font-bold text-gray-900">{member.targetAmount.toLocaleString('fr-FR')} CFA</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Versé</p>
                <p className="text-xl font-bold text-success">{member.amountPaid.toLocaleString('fr-FR')} CFA</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Retard</p>
                <p className="text-xl font-bold text-danger">{member.totalRetard > 0 ? member.totalRetard.toLocaleString('fr-FR') : "0"} CFA</p>
              </div>
            </div>

            <div 
              className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center cursor-pointer transition-colors ${showSurplusDetails ? 'ring-2 ring-primary' : 'hover:bg-gray-50'}`}
              onClick={() => setShowSurplusDetails(!showSurplusDetails)}
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Excédent</p>
                <p className="text-xl font-bold text-primary">{(member.totalSurplus || 0).toLocaleString('fr-FR')} CFA</p>
                <p className="text-[10px] text-gray-400 mt-1">Cliquer pour détails</p>
              </div>
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
                {!member.surplusDetails || member.surplusDetails.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">Aucun excédent enregistré pour ce membre.</p>
                ) : (
                  <ul className="space-y-3">
                    {member.surplusDetails.map((detail, idx) => (
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

          {/* Timeline / List of Periods */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-semibold text-gray-800">Historique des Échéances</h3>
            </div>
            <div className="p-0">
              <ul className="divide-y divide-gray-100">
                {periods.map((period) => {
                  const status = getPeriodStatus(period.date, period.name);
                  
                  return (
                    <li key={period.name} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        {status === "PAID" && (
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                        {status === "LATE" && (
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-4">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </div>
                        )}
                        {status === "PENDING" && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mr-4">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900">{period.name}</p>
                          <p className="text-xs text-gray-500">Montant attendu : {member.targetAmount.toLocaleString('fr-FR')} CFA</p>
                        </div>
                      </div>
                      
                      <div>
                        {status === "PAID" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Payé
                          </span>
                        )}
                        {status === "LATE" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            En Retard
                          </span>
                        )}
                        {status === "PENDING" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            À venir
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
