"use client";

import React, { useState, useRef, useEffect } from "react";
import { recordManualPayment } from "@/app/actions/payments";
import { useRouter } from "next/navigation";

type RecordPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string; // Obligation ID
    name: string;
    targetAmount: number;
    paidPeriods: string[];
  };
  campaignName: string;
  campaignStartDate: string;
  campaignFrequency: string;
  campaignDueRule: string;
  isMemberView?: boolean;
  initialSelectedPeriod?: string;
};

import { generatePeriods } from "@/lib/periods";

export default function RecordPaymentModal({ 
  isOpen, 
  onClose, 
  member, 
  campaignName,
  campaignStartDate,
  campaignFrequency,
  campaignDueRule,
  isMemberView = false,
  initialSelectedPeriod
}: RecordPaymentModalProps) {
  const router = useRouter();
  // Si c'est un membre, l'option par défaut est WAVE (Cash interdit)
  const [method, setMethod] = useState(isMemberView ? "WAVE" : "CASH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Maintient l'état local des périodes payées pour permettre des enregistrements multiples
  const [localPaidPeriods, setLocalPaidPeriods] = useState<string[]>(member.paidPeriods);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setLocalPaidPeriods(member.paidPeriods);
  }, [member.paidPeriods]);

  const periods = React.useMemo(() => generatePeriods(campaignStartDate, campaignFrequency), [campaignStartDate, campaignFrequency]);

  useEffect(() => {
    if (isOpen) {
      if (initialSelectedPeriod && !localPaidPeriods.includes(initialSelectedPeriod)) {
        setSelectedPeriod(initialSelectedPeriod);
      } else {
        const firstUnpaid = periods.find(p => !localPaidPeriods.includes(p.name));
        setSelectedPeriod(firstUnpaid ? firstUnpaid.name : null);
      }
    } else {
      // Reset selected period when modal closes so it recalculates on next open
      setSelectedPeriod(null);
    }
  }, [isOpen, initialSelectedPeriod, localPaidPeriods, periods]);

  if (!isOpen) return null;

  const today = new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current || !selectedPeriod) return;
    
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData(formRef.current);
    // On ajoute manuellement la période sélectionnée car elle n'est pas dans un <select> classique
    formData.append("period", selectedPeriod);
    
    // Si c'est une vue membre, on utilise une autre action pour garder le statut PENDING
    // Comme declarePayment n'est pas importé ici, on importe dynamiquement ou on l'importe en haut
    // Pour éviter les imports dynamiques, je vais modifier les imports en haut
    let result;
    if (isMemberView) {
      const { declarePayment } = await import("@/app/actions/member");
      result = await declarePayment(formData);
    } else {
      result = await recordManualPayment(formData);
    }
    
    setLoading(false);
    
    if (result.success) {
      setSuccessMsg(isMemberView ? `Paiement de ${selectedPeriod} déclaré avec succès, en attente de validation !` : `Paiement de ${selectedPeriod} enregistré avec succès !`);
      setLocalPaidPeriods([...localPaidPeriods, selectedPeriod]);
      formRef.current.reset();
      
      // Auto-sélectionner le prochain mois non payé
      const nextUnpaid = periods.find(p => !localPaidPeriods.includes(p.name) && p.name !== selectedPeriod);
      if (nextUnpaid) {
        setSelectedPeriod(nextUnpaid.name);
      } else {
        setSelectedPeriod(null);
      }
      
      // Rafraîchir les données en arrière-plan
      router.refresh();
      
      // On efface le message de succès après 3s
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(result.error || "Une erreur est survenue");
    }
  };

  const isDigital = method === "WAVE" || method === "ORANGE_MONEY";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <h2 className="text-lg font-medium text-gray-900">Enregistrer une Cotisation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
            <span className="sr-only">Fermer</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-grow p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm font-medium flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {successMsg}
              </div>
            )}
            
            <input type="hidden" name="obligationId" value={member.id} />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Campagne</label>
                <input type="text" readOnly value={campaignName} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Membre</label>
                <input type="text" readOnly value={member.name} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 shadow-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionnez la période à payer *</label>
              <div className="grid grid-cols-3 gap-3">
                {(() => {
                  let foundFirstUnpaid = false;

                  return periods.map((p) => {
                    const isPaid = localPaidPeriods.includes(p.name);
                    const isLate = !isPaid && (
                      p.date < new Date(today.getFullYear(), today.getMonth(), 1) ||
                      (p.date.getMonth() === today.getMonth() && p.date.getFullYear() === today.getFullYear() && today.getDate() > parseInt(campaignDueRule || "0", 10))
                    );
                    const isSelected = selectedPeriod === p.name;
                    
                    // Si on a déjà trouvé un impayé, tous les suivants (non-payés) sont grisés
                    let isSkipped = false;
                    if (!isPaid) {
                      if (foundFirstUnpaid) {
                        isSkipped = true;
                      } else {
                        foundFirstUnpaid = true;
                      }
                    }
                    
                    let stateClasses = "border-gray-200 text-gray-700 bg-white hover:bg-gray-50";
                    if (isSkipped) {
                      stateClasses = "border-gray-200 bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed";
                    } else if (isSelected) {
                      stateClasses = "border-primary bg-primary/10 text-primary ring-2 ring-primary ring-opacity-50";
                    } else if (isPaid) {
                      stateClasses = "border-green-200 bg-green-50 text-green-700 hover:bg-green-100";
                    } else if (isLate) {
                      stateClasses = "border-red-200 bg-white text-red-700 hover:bg-red-50";
                    }

                    return (
                      <button
                        key={p.name}
                        type="button"
                        disabled={isSkipped}
                        onClick={() => setSelectedPeriod(p.name)}
                        className={`relative flex items-center justify-center p-3 text-sm font-medium border rounded-lg shadow-sm focus:outline-none transition-colors ${stateClasses}`}
                        title={isSkipped ? "Vous devez payer les mois précédents d'abord" : (isPaid ? "Ajouter un excédent/don pour cette période" : "")}
                      >
                        {p.name}
                        {isPaid && (
                          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500"></span>
                        )}
                        {isLate && !isPaid && !isSkipped && (
                          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700">Montant payé (CFA) *</label>
                <input 
                  type="number" 
                  name="amount" 
                  defaultValue={member.targetAmount}
                  min={1}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                />
                <p className="mt-1 text-xs text-gray-500">Montant attendu : {member.targetAmount.toLocaleString('fr-FR')} CFA</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mode de paiement *</label>
                <select 
                  name="method" 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {!isMemberView && <option value="CASH">Espèces</option>}
                  <option value="WAVE">Wave</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                </select>
              </div>
            </div>

            {isDigital && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Référence du paiement *</label>
                  <input 
                    type="text" 
                    name="reference" 
                    required={isDigital}
                    placeholder="ID de transaction Wave/OM"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preuve (Capture) *</label>
                  <input 
                    type="file" 
                    name="proof" 
                    required={isDigital}
                    accept="image/png, image/jpeg, application/pdf"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover" 
                  />
                </div>
              </div>
            )}

            <div className="pt-6 flex justify-end space-x-3 border-t border-gray-200">
              <button 
                type="button" 
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Fermer
              </button>
              <button 
                type="submit" 
                disabled={loading || !selectedPeriod}
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? "Enregistrement..." : "Valider le paiement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
