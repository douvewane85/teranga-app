import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMemberCampaigns } from "@/app/actions/member";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { setUserDefaultCampaign } from "@/app/actions/preferences";

export default async function MemberCampaignsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  const obligations = await getMemberCampaigns(session.user.id);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mes Cotisations</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            Suivez l'état de vos cotisations et déclarez vos paiements pour les campagnes auxquelles vous participez.
          </p>
        </div>
      </div>

      {/* Grille de cartes */}
      {obligations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {obligations.map((obl) => {
            const campaign = obl.campaign;
            const isOverdue = new Date(campaign.endDate) < new Date();
            const isActive = new Date(campaign.startDate) <= new Date() && !isOverdue;
            
            const totalPaid = obl.payments
              .filter(p => p.status === "COMPLETED")
              .reduce((sum, p) => sum + p.amount, 0);
              
            const pendingAmount = obl.payments
              .filter(p => p.status === "PENDING")
              .reduce((sum, p) => sum + p.amount, 0);
            
            return (
              <div 
                key={campaign.id} 
                className="group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden"
              >
                <div className={`h-2 w-full ${isActive ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-yellow-400'}`} />
                
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                      {campaign.name}
                    </h3>
                    <div className="ml-3 flex-shrink-0">
                      {isOverdue ? (
                        <Badge variant="danger">Expirée</Badge>
                      ) : isActive ? (
                        <Badge variant="success">En cours</Badge>
                      ) : (
                        <Badge variant="warning">À venir</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 flex-grow">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Du {new Date(campaign.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} <br />au {new Date(campaign.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>

                    {/* Résumé personnel */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-500 mb-2">Mon statut</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Montant versé :</span>
                        <span className="font-semibold text-gray-900">{totalPaid.toLocaleString('fr-FR')} CFA</span>
                      </div>
                      {pendingAmount > 0 && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-600">En attente :</span>
                          <span className="font-semibold text-warning">{pendingAmount.toLocaleString('fr-FR')} CFA</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-auto border-t border-gray-100 flex gap-2 items-center">
                    <Link 
                      href={`/member/campaigns/${campaign.id}`} 
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                    >
                      <svg className="mr-2 -ml-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Voir mon tableau de bord
                    </Link>
                    <form action={async () => { "use server"; await setUserDefaultCampaign(campaign.id); }}>
                      <button 
                        type="submit" 
                        title="Épingler comme campagne par défaut" 
                        className="p-2 text-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg shadow-sm hover:text-gray-900 transition-colors"
                      >
                        📌
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="mx-auto h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">📭</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune cotisation active</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Vous n'êtes actuellement inscrit à aucune campagne de cotisation.
          </p>
        </div>
      )}
    </div>
  );
}
