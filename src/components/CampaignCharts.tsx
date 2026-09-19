"use client";

import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';

type Payment = {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
};

type MemberData = {
  id: string;
  createdAt: Date;
  nbreMoisRetard: number;
};

interface CampaignChartsProps {
  payments: Payment[];
  members: MemberData[];
}

export default function CampaignCharts({ payments, members }: CampaignChartsProps) {
  // 1. Bar Chart Data: Évolution des encaissements par mois
  const barChartData = useMemo(() => {
    const dataByMonth: Record<string, number> = {};
    const completedPayments = payments.filter(p => p.status === "COMPLETED");
    
    completedPayments.forEach(payment => {
      const date = new Date(payment.createdAt);
      const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      if (!dataByMonth[monthYear]) {
        dataByMonth[monthYear] = 0;
      }
      dataByMonth[monthYear] += payment.amount;
    });

    const sortedData = Object.keys(dataByMonth).map(key => {
      const firstPayment = completedPayments.find(p => {
        const d = new Date(p.createdAt);
        return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }) === key;
      });
      return {
        name: key,
        total: dataByMonth[key],
        date: firstPayment ? new Date(firstPayment.createdAt).getTime() : 0,
      };
    }).sort((a, b) => a.date - b.date);

    return sortedData;
  }, [payments]);

  // 2. Donut Chart Data: Répartition des membres (À jour vs En retard)
  const donutChartData = useMemo(() => {
    let aJour = 0;
    let enRetard = 0;

    members.forEach(member => {
      if (member.nbreMoisRetard > 0) {
        enRetard++;
      } else {
        aJour++;
      }
    });

    return [
      { name: 'À jour', value: aJour, color: '#10B981' }, // green-500
      { name: 'En retard', value: enRetard, color: '#F43F5E' }, // rose-500
    ];
  }, [members]);

  // 3. (Supprimé) Line Chart Data: Évolution du nombre d'adhésions n'est plus calculé.

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-8">
      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Évolution des Encaissements</h3>
        <div className="flex-1 min-h-0">
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="total" fill="#0EA5E9" radius={[4, 4, 0, 0]} name="Encaissements (CFA)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Répartition des Membres</h3>
        <div className="flex-1 min-h-0">
          {members.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutChartData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {donutChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* Liste des Versements Mensuels */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Liste des Versements Mensuels</h3>
        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
          {barChartData.length > 0 ? (
            <ul className="space-y-3">
              {[...barChartData].reverse().map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="font-medium text-gray-900 capitalize">{item.name}</span>
                  <span className="font-bold text-success">+{item.total.toLocaleString('fr-FR')} CFA</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">Aucun versement enregistré</div>
          )}
        </div>
      </div>
    </div>
  );
}
