import { PrismaClient } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { obligations: true }
      },
      tiers: true,
    }
  });

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campagnes de Cotisations</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            Gérez les appels à cotisations, suivez l'avancement du recouvrement et administrez les adhésions de vos membres.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/finances/campaigns/new"
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-primary-hover hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle Campagne
          </Link>
        </div>
      </div>

      {/* Grille de cartes */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const isOverdue = new Date(campaign.endDate) < new Date();
            const isActive = new Date(campaign.startDate) <= new Date() && !isOverdue;
            
            return (
              <div 
                key={campaign.id} 
                className="group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden"
              >
                {/* Bandeau de couleur selon le statut */}
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
                    {/* Dates */}
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Du {new Date(campaign.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} <br />au {new Date(campaign.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>

                    {/* Membres inscrits */}
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="font-medium text-gray-900 mr-1">{campaign._count.obligations}</span> membres inscrits
                    </div>

                    {/* Tiers de cotisation */}
                    {campaign.tiers.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Offres proposées</p>
                        <div className="flex flex-wrap gap-2">
                          {campaign.tiers.map(tier => (
                            <span key={tier.id} className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200">
                              {tier.name} <span className="mx-1 text-gray-300">•</span> {tier.amount.toLocaleString('fr-FR')} CFA
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between gap-3">
                    <Link
                      href={`/admin/finances/campaigns/${campaign.id}/enroll`}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      <svg className="mr-2 -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Adhérer
                    </Link>
                    <Link 
                      href={`/admin/finances/campaigns/${campaign.id}`} 
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                    >
                      <svg className="mr-2 -ml-1 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Rapport
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="mx-auto h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">💰</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune campagne disponible</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Vous n'avez pas encore créé de campagne de cotisation. Créez-en une pour commencer à récolter des fonds.
          </p>
          <Link 
            href="/admin/finances/campaigns/new" 
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white shadow-md hover:bg-primary-hover transition-all"
          >
            Créer ma première campagne
          </Link>
        </div>
      )}
    </div>
  );
}
