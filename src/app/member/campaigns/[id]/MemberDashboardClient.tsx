"use client";

import { useState, useMemo } from "react";
import RecordPaymentModal from "@/components/RecordPaymentModal";
import ProofImageModal from "@/components/ProofImageModal";
import { Badge } from "@/components/ui/Badge";

import { generatePeriods } from "@/lib/periods";

export default function MemberDashboardClient({ 
  obligation, 
  campaign, 
  statistics,
  view = "all"
}: { 
  obligation: any, 
  campaign: any, 
  statistics: any,
  view?: "all" | "personal" | "history"
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialSelectedPeriod, setInitialSelectedPeriod] = useState<string | undefined>(undefined);
  
  const [filterMonth, setFilterMonth] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const periods = generatePeriods(campaign.startDate, campaign.frequency);
  const today = new Date();
  
  // Filtrer les périodes en retard
  const latePeriods = periods.filter(p => {
    const isPaid = statistics.paidPeriods.includes(p.name);
    // Considéré en retard si le mois est passé (1er du mois courant) ou si la date limite du mois courant est dépassée
    const isLate = !isPaid && (
      p.date < new Date(today.getFullYear(), today.getMonth(), 1) ||
      (p.date.getMonth() === today.getMonth() && p.date.getFullYear() === today.getFullYear() && today.getDate() > parseInt(campaign.dueRule || "0", 10))
    );
    return isLate;
  });

  const handlePayPeriod = (periodName: string) => {
    setInitialSelectedPeriod(periodName);
    setIsModalOpen(true);
  };

  const enrichedPayments = useMemo(() => {
    // Reverse to process chronologically
    const ascPayments = [...(obligation.payments || [])].reverse();
    const sumByPeriod: Record<string, number> = {};
    const target = obligation.targetAmount || campaign.goalAmount || 0;
    
    return ascPayments.map(p => {
      const pName = p.period || 'Unique';
      const prevSum = sumByPeriod[pName] || 0;
      
      let paymentType = "Cotisation";
      if (prevSum >= target) {
        paymentType = "Surplus";
      } else if (prevSum + p.amount > target) {
        paymentType = "Cotisation + Surplus";
      }

      if (p.status === "COMPLETED") {
        sumByPeriod[pName] = prevSum + p.amount;
      }

      return {
        ...p,
        paymentType
      };
    }).reverse(); // Revert back to most recent first
  }, [obligation.payments, obligation.targetAmount, campaign.goalAmount]);

  const filteredPayments = useMemo(() => {
    return enrichedPayments.filter((p) => {
      const matchMonth = filterMonth ? p.period === filterMonth : true;
      const matchType = filterType ? p.paymentType === filterType : true;
      
      let matchDate = true;
      const pDate = new Date(p.createdAt);
      if (filterStartDate) {
        matchDate = matchDate && pDate >= new Date(filterStartDate);
      }
      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setDate(end.getDate() + 1);
        matchDate = matchDate && pDate < end;
      }

      return matchMonth && matchType && matchDate;
    });
  }, [enrichedPayments, filterMonth, filterType, filterStartDate, filterEndDate]);

  return (
    <>
      {(view === "all" || view === "personal") && latePeriods.length > 0 && (
        <div className="bg-red-50 shadow-sm rounded-2xl border border-red-200 mt-8">
          <div className="px-6 py-4 border-b border-red-200">
            <h3 className="text-lg font-medium leading-6 text-red-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Mois en retard
            </h3>
            <p className="mt-1 text-sm text-red-600">
              Vous avez {latePeriods.length} période(s) non réglée(s). Veuillez les régulariser au plus vite.
            </p>
          </div>
          <div className="px-6 py-4">
            <ul className="space-y-3">
              {latePeriods.map(period => (
                <li key={period.name} className="flex items-center justify-between bg-white p-3 rounded border border-red-100 shadow-sm">
                  <div>
                    <span className="font-medium text-gray-900">{period.name}</span>
                    <span className="ml-3 text-sm text-gray-500">{(obligation.targetAmount || campaign.goalAmount || 0).toLocaleString('fr-FR')} CFA</span>
                  </div>
                  <button
                    onClick={() => handlePayPeriod(period.name)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Régulariser
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {(view === "all" || view === "history") && (
        <div className="bg-white shadow-sm rounded-2xl border border-gray-100 mt-8">
          <div className="px-6 py-5 border-b border-gray-200 flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Historique de mes versements</h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 md:mt-0 inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover"
              >
                Déclarer un paiement
              </button>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3 w-full">
              <select 
                value={filterMonth} 
                onChange={e => setFilterMonth(e.target.value)}
                className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              >
                <option value="">Tous les mois</option>
                {periods.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>

              <select 
                value={filterType} 
                onChange={e => setFilterType(e.target.value)}
                className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              >
                <option value="">Tous les types</option>
                <option value="Cotisation">Cotisation</option>
                <option value="Surplus">Surplus</option>
                <option value="Cotisation + Surplus">Cotisation + Surplus</option>
              </select>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <label className="text-sm text-gray-500">Du:</label>
                <input 
                  type="date" 
                  value={filterStartDate}
                  onChange={e => setFilterStartDate(e.target.value)}
                  className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border text-gray-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <label className="text-sm text-gray-500">Au:</label>
                <input 
                  type="date" 
                  value={filterEndDate}
                  onChange={e => setFilterEndDate(e.target.value)}
                  className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border text-gray-500"
                />
              </div>
            </div>
          </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.period || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge variant={payment.paymentType === "Surplus" ? "success" : payment.paymentType === "Cotisation + Surplus" ? "warning" : "default"}>
                        {payment.paymentType || "Cotisation"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.amount.toLocaleString('fr-FR')} CFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.method === "WAVE" && "Wave"}
                      {payment.method === "ORANGE_MONEY" && "Orange Money"}
                      {payment.method === "CASH" && "Espèces"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.status === "COMPLETED" && <Badge variant="success">Validé</Badge>}
                      {payment.status === "PENDING" && <Badge variant="warning">En attente</Badge>}
                      {payment.status === "REJECTED" && <Badge variant="danger">Rejeté</Badge>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.reference || '-'}
                      {payment.proofUrl && (
                        <ProofImageModal url={payment.proofUrl} />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    Aucun paiement trouvé avec ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <RecordPaymentModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInitialSelectedPeriod(undefined);
        }}
        initialSelectedPeriod={initialSelectedPeriod}
        member={{
          id: obligation.id,
          name: obligation.user.name || obligation.user.email,
          paidPeriods: statistics.paidPeriods,
          targetAmount: obligation.targetAmount || campaign.goalAmount || 0,
        }}
        campaignName={campaign.name}
        campaignStartDate={campaign.startDate.toISOString()}
        campaignFrequency={campaign.frequency}
        campaignDueRule={campaign.dueRule}
        isMemberView={true}
      />
    </>
  );
}
