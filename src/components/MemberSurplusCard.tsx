"use client";
import { useState } from "react";

export default function MemberSurplusCard({ 
  totalSurplus, 
  surplusDetails 
}: { 
  totalSurplus: number, 
  surplusDetails: { period: string, expected: number, paid: number, surplus: number }[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className={`bg-white p-6 rounded-xl shadow-sm border ${totalSurplus > 0 ? 'border-green-200 bg-green-50/30' : 'border-gray-100'} flex flex-col transition-all duration-300`}
    >
      <div 
        className="flex flex-col cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium text-gray-500 mb-1 flex items-center justify-between">
          Total Surplus 
          {surplusDetails.length > 0 && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1 transition-transform">
              Détails 
              <svg className={`w-3 h-3 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          )}
        </span>
        <span className="text-3xl font-bold text-success">+{totalSurplus.toLocaleString('fr-FR')} CFA</span>
      </div>

      {isOpen && surplusDetails.length > 0 && (
        <div className="mt-4 pt-4 border-t border-green-100/50">
          <ul className="space-y-3">
            {surplusDetails.map((detail, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-gray-800">{detail.period}</p>
                  <p className="text-xs text-gray-500">
                    Attendu: {detail.expected.toLocaleString('fr-FR')} | Versé: {detail.paid.toLocaleString('fr-FR')}
                  </p>
                </div>
                <span className="font-semibold text-success">+{detail.surplus.toLocaleString('fr-FR')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
