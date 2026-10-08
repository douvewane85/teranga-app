"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { updatePaymentAmount, deletePayment } from "@/app/actions/payments";

export default function TransactionsClientTable({ payments, campaignPeriods }: { payments: any[], campaignPeriods: string[] }) {
  const [filterMonth, setFilterMonth] = useState("");
  const [filterMember, setFilterMember] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchMonth = filterMonth ? p.period === filterMonth : true;
      const memberName = p.obligation?.user?.name || p.obligation?.user?.email || "";
      const matchMember = filterMember ? memberName.toLowerCase().includes(filterMember.toLowerCase()) : true;
      const pType = p.paymentType || "Cotisation";
      const matchType = filterType ? pType === filterType : true;
      
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

      return matchMonth && matchMember && matchType && matchDate;
    });
  }, [payments, filterMonth, filterMember, filterType, filterStartDate, filterEndDate]);

  const handleEditAmount = async (paymentId: string, currentAmount: number) => {
    const newAmountStr = window.prompt("Entrez le nouveau montant en CFA :", currentAmount.toString());
    if (newAmountStr) {
      const newAmount = parseFloat(newAmountStr);
      if (!isNaN(newAmount) && newAmount > 0) {
        if (window.confirm(`Êtes-vous sûr de vouloir modifier le montant à ${newAmount} CFA ? Le surplus sera recalculé automatiquement.`)) {
          await updatePaymentAmount(paymentId, newAmount);
          window.location.reload();
        }
      } else {
        alert("Montant invalide.");
      }
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce paiement ?")) {
      await deletePayment(paymentId);
      window.location.reload();
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-100 mt-6">
      <div className="px-6 py-5 border-b border-gray-200 flex flex-col space-y-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Historique détaillé des paiements</h3>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full">
          {/* Mois de cotisant */}
          <select 
            value={filterMonth} 
            onChange={e => setFilterMonth(e.target.value)}
            className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
          >
            <option value="">Mois de cotisant (Tous)</option>
            {campaignPeriods.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          
          {/* Membre */}
          <input 
            type="text" 
            placeholder="Rechercher un membre..." 
            value={filterMember}
            onChange={e => setFilterMember(e.target.value)}
            className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
          />

          {/* Type */}
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
          >
            <option value="">Type (Tous)</option>
            <option value="Cotisation">Cotisation</option>
            <option value="Surplus">Surplus</option>
            <option value="Cotisation + Surplus">Cotisation + Surplus</option>
          </select>

          {/* Période Début */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <label className="text-sm text-gray-500">Du :</label>
            <input 
              type="date" 
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
              title="Date de début"
              className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border text-gray-500"
            />
          </div>

          {/* Période Fin */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <label className="text-sm text-gray-500">Au :</label>
            <input 
              type="date" 
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
              title="Date de fin"
              className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border text-gray-500"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.obligation?.user?.name || payment.obligation?.user?.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.period || "Unique"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Badge variant={payment.paymentType === "Surplus" ? "success" : payment.paymentType === "Cotisation + Surplus" ? "warning" : "default"}>
                    {payment.paymentType || "Cotisation"}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.amount.toLocaleString('fr-FR')} CFA
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant={payment.status === "COMPLETED" ? "success" : payment.status === "REJECTED" ? "danger" : "warning"}>
                    {payment.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEditAmount(payment.id, payment.amount)} className="text-primary hover:text-primary-hover mr-3">
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(payment.id)} className="text-red-600 hover:text-red-900">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">Aucun paiement trouvé avec ces filtres.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
