"use client";

import React, { useState, useEffect, useMemo } from "react";
import { updatePaymentAmount, convertSurplusToContribution } from "@/app/actions/payments";
import { useRouter } from "next/navigation";

type EditPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  payment: any | null;
  campaignPeriods: string[];
  allPayments: any[];
};

export default function EditPaymentModal({
  isOpen,
  onClose,
  payment,
  campaignPeriods,
  allPayments
}: EditPaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States
  const [amount, setAmount] = useState<number>(0);
  const [isConverting, setIsConverting] = useState(false);
  const [targetPeriod, setTargetPeriod] = useState<string>("");

  useEffect(() => {
    if (payment) {
      setAmount(payment.amount);
      setIsConverting(false);
      setTargetPeriod("");
      setError(null);
    }
  }, [payment]);

  const targetAmount = payment?.obligation?.targetAmount || 0;
  const surplus = amount > targetAmount ? amount - targetAmount : 0;
  const hasSurplus = surplus > 0;

  // Calcul des périodes éligibles
  const eligiblePeriods = useMemo(() => {
    if (!payment) return [];
    
    // 1. Périodes déjà payées par ce membre
    const memberPaidPeriods = allPayments
      .filter(p => p.obligationId === payment.obligationId && p.status === "COMPLETED" && p.period)
      .map(p => p.period);

    const now = new Date();
    
    // 2. Filtrer les périodes
    return campaignPeriods.filter(periodName => {
      // Ne pas inclure les périodes déjà payées
      if (memberPaidPeriods.includes(periodName)) return false;
      
      // Ne pas dépasser le mois actuel
      // periodName est au format "Mois-Année", ex: "Août-2026"
      const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
      const [mName, yName] = periodName.split("-");
      const monthIdx = months.findIndex(m => m.toLowerCase() === mName.toLowerCase());
      const year = parseInt(yName);
      
      if (monthIdx !== -1 && !isNaN(year)) {
        if (year > now.getFullYear()) return false;
        if (year === now.getFullYear() && monthIdx > now.getMonth()) return false;
      }
      
      return true;
    });
  }, [payment, allPayments, campaignPeriods]);

  if (!isOpen || !payment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isConverting && surplus >= targetAmount) {
        if (!targetPeriod) {
          setError("Veuillez sélectionner une période de destination.");
          setLoading(false);
          return;
        }
        
        const res = await convertSurplusToContribution(payment.id, targetPeriod, targetAmount);
        if (!res.success) {
          throw new Error(res.error);
        }
      } else {
        // Juste modifier le montant
        const res = await updatePaymentAmount(payment.id, amount);
        if (!res.success) {
          throw new Error(res.error);
        }
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Modifier le paiement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Période du paiement</label>
            <input type="text" readOnly value={payment.period || "Unique"} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Montant total du paiement (CFA)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" 
            />
          </div>

          {hasSurplus && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium mb-3">
                Un surplus de {surplus.toLocaleString('fr-FR')} CFA a été détecté (Objectif: {targetAmount.toLocaleString('fr-FR')} CFA).
              </p>
              
              {surplus >= targetAmount && eligiblePeriods.length > 0 && (
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={isConverting}
                      onChange={(e) => setIsConverting(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Convertir ce surplus en une nouvelle cotisation
                    </span>
                  </label>

                  {isConverting && (
                    <div className="pl-6">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Période de destination</label>
                      <select 
                        value={targetPeriod}
                        onChange={(e) => setTargetPeriod(e.target.value)}
                        required={isConverting}
                        className="block w-full rounded-md border-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary py-2 px-3 border"
                      >
                        <option value="">Sélectionnez un mois...</option>
                        {eligiblePeriods.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Seuls les mois impayés et jusqu'au mois en cours sont affichés.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {surplus >= targetAmount && eligiblePeriods.length === 0 && (
                <p className="text-xs text-green-700">Aucune période impayée disponible pour convertir ce surplus.</p>
              )}
              
              {surplus < targetAmount && (
                <p className="text-xs text-green-700">Le surplus est inférieur au montant attendu ({targetAmount.toLocaleString('fr-FR')} CFA), il ne peut pas être converti en cotisation complète.</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
