"use client";
import { useState } from "react";

export default function MemberSurplusCard({ 
  totalSurplus 
}: { 
  totalSurplus: number
}) {
  return (
    <div 
      className={`bg-white p-6 rounded-xl shadow-sm border ${totalSurplus > 0 ? 'border-green-200 bg-green-50/30' : 'border-gray-100'} flex flex-col`}
    >
      <span className="text-sm font-medium text-gray-500 mb-1">
        Total Surplus
      </span>
      <span className="text-3xl font-bold text-success">+{totalSurplus.toLocaleString('fr-FR')} CFA</span>
    </div>
  );
}
