"use client";
import { useState } from "react";

export default function MemberSurplusCard({ 
  totalSurplus,
  onClick,
  isOpen,
  hasDetails
}: { 
  totalSurplus: number;
  onClick?: () => void;
  isOpen?: boolean;
  hasDetails?: boolean;
}) {
  return (
    <div 
      onClick={hasDetails ? onClick : undefined}
      className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col transition-colors ${totalSurplus > 0 ? 'border-green-200 bg-green-50/30' : 'border-gray-100'} ${hasDetails ? 'cursor-pointer hover:bg-green-50' : ''}`}
    >
      <span className="text-sm font-medium text-gray-500 mb-1 flex items-center justify-between">
        Total Surplus
        {hasDetails && (
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
  );
}
