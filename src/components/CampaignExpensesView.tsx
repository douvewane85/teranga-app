"use client";

import React, { useState } from "react";

interface Expense {
  id: string;
  campaignId: string;
  title: string;
  description?: string | null;
  amount: number;
  date: Date | string;
  beneficiary?: string | null;
  receiptUrl?: string | null;
  paymentMode: string;
  category: { id: string; name: string; color?: string | null };
}

interface CampaignExpensesViewProps {
  campaignName: string;
  finances: {
    totalPaidAmount: number;
    totalExpenses: number;
    netBalance: number;
  };
  expenses: Expense[];
  expensesByCategory?: Record<string, { count: number; total: number; color: string }>;
}

export default function CampaignExpensesView({
  campaignName,
  finances,
  expenses = [],
  expensesByCategory = {},
}: CampaignExpensesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  const totalPaid = finances?.totalPaidAmount || 0;
  const totalExpenses = finances?.totalExpenses || 0;
  const netBalance = finances?.netBalance !== undefined ? finances.netBalance : (totalPaid - totalExpenses);

  const filteredExpenses = expenses.filter((exp) => {
    return (
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.beneficiary && exp.beneficiary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exp.category?.name && exp.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Carte de Transparence Financière */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-xs border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🏛️ Transparence Financière</span>
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Mode Consultation
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Bilan transparent de la cagnotte et des charges imputées à la campagne « {campaignName} ».
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
            <span className="text-xs font-semibold text-gray-500 uppercase">Cotisations Collectées</span>
            <div className="mt-1 text-2xl font-bold text-emerald-600">
              {totalPaid.toLocaleString("fr-FR")} <span className="text-xs font-medium text-gray-400">CFA</span>
            </div>
            <p className="text-2xs text-gray-400 mt-1">Paiements validés des adhérents</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
            <span className="text-xs font-semibold text-gray-500 uppercase">Dépenses Réalisées</span>
            <div className="mt-1 text-2xl font-bold text-rose-600">
              {totalExpenses.toLocaleString("fr-FR")} <span className="text-xs font-medium text-gray-400">CFA</span>
            </div>
            <p className="text-2xs text-gray-400 mt-1">{expenses.length} dépense(s) validée(s)</p>
          </div>

          <div className={`p-4 rounded-xl border shadow-2xs ${
            netBalance >= 0 ? "bg-emerald-50/70 border-emerald-200" : "bg-rose-50/70 border-rose-200"
          }`}>
            <span className="text-xs font-semibold text-gray-700 uppercase">Solde Net Disponible</span>
            <div className={`mt-1 text-2xl font-black ${netBalance >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {netBalance.toLocaleString("fr-FR")} <span className="text-xs font-medium">CFA</span>
            </div>
            <p className="text-2xs text-gray-600 mt-1">
              {netBalance >= 0 ? "Fonds restants disponibles" : "Déficit temporaire"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Répartition par catégorie */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-3">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Répartition par catégorie
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(expensesByCategory).map(([catName, data]) => (
              <div
                key={catName}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs bg-gray-50/50"
                style={{ borderColor: `${data.color}40` }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: data.color }}
                />
                <span className="font-semibold text-gray-800">{catName}</span>
                <span className="text-gray-400">({data.count})</span>
                <span className="font-bold text-gray-900">{data.total.toLocaleString("fr-FR")} CFA</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Liste détaillée des dépenses */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-sm font-bold text-gray-800">
            Détail des dépenses de la campagne ({filteredExpenses.length})
          </h3>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Rechercher une dépense..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            Aucune dépense n'a encore été enregistrée pour cette campagne.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-xs">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2.5 text-left font-semibold">Date</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Dépense</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Catégorie</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Bénéficiaire</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Montant</th>
                  <th className="px-3 py-2.5 text-center font-semibold">Justificatif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-500">
                      {new Date(exp.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-gray-900">{exp.title}</div>
                      {exp.description && (
                        <div className="text-gray-400 text-2xs truncate max-w-xs">{exp.description}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium text-white"
                        style={{ backgroundColor: exp.category?.color || "#2563EB" }}
                      >
                        {exp.category?.name || "Général"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">
                      {exp.beneficiary || "—"}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-right font-bold text-rose-600">
                      {exp.amount.toLocaleString("fr-FR")} CFA
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-center">
                      {exp.receiptUrl ? (
                        <button
                          onClick={() => setPreviewReceiptUrl(exp.receiptUrl!)}
                          className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                        >
                          📎 Justificatif
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Aperçu justificatif */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/75 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900">Justificatif de dépense</h3>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto p-4 flex justify-center bg-gray-100 flex-grow min-h-[300px]">
              {previewReceiptUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={previewReceiptUrl}
                  className="w-full h-[70vh] border-0 rounded-lg"
                  title="Justificatif de dépense (PDF)"
                />
              ) : (
                <img
                  src={previewReceiptUrl}
                  alt="Justificatif de dépense"
                  className="max-w-full h-auto object-contain rounded shadow-sm border border-gray-200 bg-white"
                />
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
