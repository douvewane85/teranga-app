"use client";

import React, { useEffect, useState, use } from "react";
import { enrollMembersToCampaign } from "@/app/actions/campaigns";
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
      {pending ? "Enregistrement..." : "Adhérer les membres"}
    </button>
  );
}

export default function EnrollMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const campaignId = unwrappedParams.id;
  
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [customizeDates, setCustomizeDates] = useState(false);
  const [customFrequency, setCustomFrequency] = useState("MONTHLY");
  const [customDueRule, setCustomDueRule] = useState("");

  useEffect(() => {
    // Dans un cas réel, nous utiliserions un Server Component ou des Server Actions pour fetcher ça.
    // Pour simplifier l'UI client side, on va faire un fetch sur l'API ou utiliser une action existante.
    // Ici on simule ou on peut créer un call API. Mais Next.js App Router permet de faire le fetch 
    // côté serveur dans le layout/page parent. Vu qu'on est en "use client", on va juste requêter une route API (à faire)
    // ou on peut faire une Server Action pour fetcher. Faisons simple.
    
    // FETCH via API calls
    Promise.all([
      fetch(`/api/members?excludeCampaignId=${campaignId}`).then(res => res.json()),
      fetch(`/api/campaigns/${campaignId}`).then(res => res.json())
    ]).then(([membersData, campaignData]) => {
      setMembers(membersData.filter((m: any) => m.status === 'ACTIVE' || m.status === 'PENDING'));
      setCampaign(campaignData);
    }).catch(err => {
      console.error(err);
    });
  }, [campaignId]);

  async function clientAction(formData: FormData) {
    try {
      setError(null);
      if (selectedUserIds.length === 0) {
        throw new Error("Veuillez sélectionner au moins un membre.");
      }
      formData.append("campaignId", campaignId);
      selectedUserIds.forEach(id => formData.append("userIds[]", id));
      
      if (!customizeDates) {
        formData.delete("customFrequency");
        formData.delete("customDueRule");
      }

      await enrollMembersToCampaign(formData);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    }
  }

  if (!campaign) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Adhérer des membres</h1>
        <p className="mt-1 text-sm text-gray-500">
          Campagne : <strong>{campaign.name}</strong>
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
        <form action={clientAction} className="p-6 space-y-8">
          {error && (
            <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          {/* 1. Sélection du membre */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">1. Sélection du membre</h3>
            <div>
              {members.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun membre disponible.</p>
              ) : (
                <select
                  name="userIds[]"
                  required
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  value={selectedUserIds[0] || ""}
                  onChange={(e) => setSelectedUserIds([e.target.value])}
                >
                  <option value="" disabled>-- Sélectionnez un membre --</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name || member.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 2. Montant */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">2. Montant de cotisation</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
                  Montant dû (CFA)
                </label>
                <p className="text-xs text-gray-500 mb-2">Saisissez un montant libre, ou choisissez parmi les paliers de la campagne :</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {campaign.tiers?.map((tier: any) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setTargetAmount(tier.amount.toString())}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      {tier.name} ({tier.amount} CFA)
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  name="targetAmount"
                  id="targetAmount"
                  required
                  min="1"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="Ex: 10000"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            </div>
          </div>

          {/* 3. Échéances */}
          <div>
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h3 className="text-lg font-medium text-gray-900">3. Échéances personnalisées (Optionnel)</h3>
              <div className="flex items-center">
                <input
                  id="customizeDates"
                  type="checkbox"
                  checked={customizeDates}
                  onChange={(e) => setCustomizeDates(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="customizeDates" className="ml-2 block text-sm text-gray-900">
                  Surcharger les règles de la campagne
                </label>
              </div>
            </div>
            
            {!customizeDates ? (
              <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
                Les membres utiliseront la règle par défaut de la campagne :<br/>
                <strong>Fréquence :</strong> {campaign.frequency} <br/>
                <strong>Règle :</strong> {campaign.dueRule}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <div>
                  <label htmlFor="customFrequency" className="block text-sm font-medium text-gray-700">
                    Fréquence personnalisée
                  </label>
                  <div className="mt-1">
                    <select
                      name="customFrequency"
                      id="customFrequency"
                      value={customFrequency}
                      onChange={(e) => setCustomFrequency(e.target.value)}
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
                  <label htmlFor="customDueRule" className="block text-sm font-medium text-gray-700">
                    Règle personnalisée
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="customDueRule"
                      id="customDueRule"
                      value={customDueRule}
                      onChange={(e) => setCustomDueRule(e.target.value)}
                      placeholder="Ex: Le 10 du mois"
                      className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    />
                  </div>
                </div>
              </div>
            )}
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
