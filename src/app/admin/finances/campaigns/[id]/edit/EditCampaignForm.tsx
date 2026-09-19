"use client";

import React, { useState } from "react";
import { updateCampaign } from "@/app/actions/campaigns";
import Link from "next/link";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none disabled:opacity-50"
    >
      {pending ? "Enregistrement..." : "Enregistrer les modifications"}
    </button>
  );
}

export default function EditCampaignForm({ campaign, initialTiers }: { campaign: any, initialTiers: any[] }) {
  const [error, setError] = useState<string | null>(null);
  
  // Initialize tiers with existing ones
  const [tiers, setTiers] = useState(initialTiers.length > 0 ? initialTiers : [{ id: "", name: "Tarif Unique", amount: "" }]);
  const [tierCounter, setTierCounter] = useState(initialTiers.length > 0 ? Math.max(...initialTiers.map(t => parseInt(t.id) || 0)) + 1 : 2);
  const [frequency, setFrequency] = useState(campaign.frequency || "MONTHLY");

  const addTier = () => {
    setTiers([...tiers, { id: `new-${tierCounter}`, name: "", amount: "" }]);
    setTierCounter(tierCounter + 1);
  };

  const removeTier = (id: string) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((tier) => tier.id !== id));
    }
  };

  const updateTier = (id: string, field: "name" | "amount", value: string) => {
    setTiers(
      tiers.map((tier) => {
        if (tier.id === id) {
          return { ...tier, [field]: value };
        }
        return tier;
      })
    );
  };

  const updateAction = updateCampaign.bind(null, campaign.id);

  async function clientAction(formData: FormData) {
    try {
      setError(null);
      await updateAction(formData);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
      <form action={clientAction} className="space-y-8 p-6">
        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {/* Informations Générales */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Informations Générales</h3>
          <div className="grid grid-cols-1 gap-6">
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom de la campagne
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  defaultValue={campaign.name}
                  placeholder="Ex: Cotisation Annuelle 2026"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Petite description
              </label>
              <div className="mt-1">
                <textarea
                  name="description"
                  id="description"
                  rows={2}
                  defaultValue={campaign.description || ""}
                  placeholder="Ex: Collecte pour financer les activités de l'année..."
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700">
                Objectif financier à atteindre (CFA) - Optionnel
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="goalAmount"
                  id="goalAmount"
                  min="0"
                  defaultValue={campaign.goalAmount || ""}
                  placeholder="Ex: 500000"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Date de début (Lancement)
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    required
                    defaultValue={formatDate(campaign.startDate)}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  Date de fin (Clôture)
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    required
                    defaultValue={formatDate(campaign.endDate)}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Règle d'échéance */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Fréquence & Échéance de paiement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                  Fréquence de paiement
                </label>
                <div className="mt-1">
                  <select
                    name="frequency"
                    id="frequency"
                    required
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  >
                    <option value="MONTHLY">Par Mois</option>
                    <option value="QUARTERLY">Par Trimestre</option>
                    <option value="SEMI_ANNUALLY">Par Semestre</option>
                    <option value="ANNUALLY">Par Année</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="dueRule" className="block text-sm font-medium text-gray-700">
                  Précisez la date de l'échéance
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="dueRule"
                    id="dueRule"
                    required
                    defaultValue={campaign.dueRule}
                    placeholder={
                      frequency === "MONTHLY" ? "Ex: Le 5 du mois" :
                      frequency === "QUARTERLY" ? "Ex: La fin de chaque trimestre" :
                      frequency === "SEMI_ANNUALLY" ? "Ex: Avant le 30 Juin et le 31 Décembre" :
                      "Ex: Le 31 Décembre de l'année en cours"
                    }
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
          </div>
        </div>

        {/* Paliers (Montants) */}
        <div>
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="text-lg font-medium text-gray-900">Paliers de Cotisation</h3>
            <button
              type="button"
              onClick={addTier}
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              + Ajouter un palier
            </button>
          </div>
          
          <div className="space-y-4">
            {tiers.map((tier) => (
              <div key={tier.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {/* Hidden input for tierId to know if it's existing or new */}
                <input type="hidden" name="tierId[]" value={tier.id.toString().startsWith("new-") ? "" : tier.id} />
                
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom du palier</label>
                  <input
                    type="text"
                    name="tierName[]"
                    required
                    value={tier.name}
                    onChange={(e) => updateTier(tier.id, "name", e.target.value)}
                    className="block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Montant (CFA)</label>
                  <input
                    type="number"
                    name="tierAmount[]"
                    required
                    min="1"
                    step="1"
                    value={tier.amount}
                    onChange={(e) => updateTier(tier.id, "amount", e.target.value)}
                    className="block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => removeTier(tier.id)}
                    disabled={tiers.length === 1}
                    className="text-danger hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed p-2"
                    title="Supprimer ce palier"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-start gap-3">
          <input 
            type="checkbox" 
            id="forceSync" 
            name="forceSync" 
            value="true" 
            className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="forceSync" className="text-sm text-orange-800">
            <strong>Forcer la mise à jour de tous les membres</strong>
            <p className="mt-1 text-xs text-orange-700">
              Cochez cette case si vous souhaitez que tous les membres de cette campagne soient mis à jour avec le nouveau montant (très utile si le montant des membres est désynchronisé).
            </p>
          </label>
        </div>

        <div className="flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
          <Link
            href={`/admin/finances/campaigns/${campaign.id}`}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Annuler
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
