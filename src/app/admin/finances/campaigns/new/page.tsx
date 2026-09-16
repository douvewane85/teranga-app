"use client";

import React, { useState } from "react";
import { createCampaign } from "@/app/actions/campaigns";
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
      {pending ? "Création en cours..." : "Créer et Affecter"}
    </button>
  );
}

export default function NewCampaignPage() {
  const [error, setError] = useState<string | null>(null);
  const [tiers, setTiers] = useState([{ id: 1, name: "Tarif Unique", amount: "" }]);
  const [tierCounter, setTierCounter] = useState(2);
  const [frequency, setFrequency] = useState("MONTHLY");

  const addTier = () => {
    setTiers([...tiers, { id: tierCounter, name: "", amount: "" }]);
    setTierCounter(tierCounter + 1);
  };

  const removeTier = (id: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((tier) => tier.id !== id));
    }
  };

  const updateTier = (id: number, field: "name" | "amount", value: string) => {
    setTiers(
      tiers.map((tier) => {
        if (tier.id === id) {
          return { ...tier, [field]: value };
        }
        return tier;
      })
    );
  };

  async function clientAction(formData: FormData) {
    try {
      setError(null);
      await createCampaign(formData);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle Campagne de Cotisation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Cette action génèrera automatiquement une dette en attente pour tous les membres actuellement actifs dans l'association.
        </p>
      </div>

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
                      placeholder={
                        frequency === "MONTHLY" ? "Ex: Le 5 du mois" :
                        frequency === "QUARTERLY" ? "Ex: La fin de chaque trimestre" :
                        frequency === "SEMI_ANNUALLY" ? "Ex: Avant le 30 Juin et le 31 Décembre" :
                        "Ex: Le 31 Décembre de l'année en cours"
                      }
                      className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Saisissez ici la règle qui s'appliquera pour chaque échéance.
                  </p>
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
            
            <p className="text-sm text-gray-500 mb-4">
              Définissez les différents montants que les membres pourront choisir de payer.
            </p>

            <div className="space-y-4">
              {tiers.map((tier, index) => (
                <div key={tier.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nom du palier</label>
                    <input
                      type="text"
                      name="tierName[]"
                      required
                      value={tier.name}
                      onChange={(e) => updateTier(tier.id, "name", e.target.value)}
                      placeholder='ex: "Tarif Normal" ou "Donateur"'
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
                      placeholder="10000"
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

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400 text-xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  La campagne sera créée sans aucun membre rattaché. Vous pourrez ensuite <strong>sélectionner les membres</strong> à y adhérer depuis la page de détails de la campagne.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
            <Link
              href="/admin/finances/campaigns"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Annuler
            </Link>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
