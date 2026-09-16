import React from "react";
import { Badge } from "@/components/ui/Badge";

export default function MemberDashboardPage() {
  const isUpToDate = false; // Pour tester l'alerte

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mon Espace</h1>
      
      {/* Banner */}
      {isUpToDate ? (
        <div className="bg-success/10 border border-success/20 p-4 rounded-xl mb-8 flex items-center">
          <span className="text-2xl mr-4">🎉</span>
          <div>
            <h3 className="text-success-800 font-medium">Vous êtes à jour, merci !</h3>
            <p className="text-success-700 text-sm mt-1">Aucune cotisation n'est en attente de paiement.</p>
          </div>
        </div>
      ) : (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <span className="text-2xl mr-4">⚠️</span>
            <div>
              <h3 className="text-danger font-medium">Attention, cotisation en retard</h3>
              <p className="text-danger/80 text-sm mt-1">Vous avez 50 000 CFA en attente de paiement pour la Campagne Annuelle 2026.</p>
            </div>
          </div>
          <button className="bg-danger hover:bg-red-600 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-colors text-sm whitespace-nowrap">
            Régulariser ma situation
          </button>
        </div>
      )}

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mon Adhésion</span>
            <Badge variant="success">Actif</Badge>
          </div>
          <span className="text-3xl font-bold text-gray-900 mb-1">Membre</span>
          <p className="text-sm text-gray-500 mt-2">Depuis le 26 Août 2026</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
           <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Prochain Événement</span>
            <Badge variant="info">Dans 12 jours</Badge>
          </div>
          <span className="text-xl font-bold text-gray-900 mb-1">Assemblée Générale</span>
          <p className="text-sm text-gray-500 mt-2">Prévu le 10 Septembre 2026</p>
        </div>
      </div>
    </div>
  );
}
