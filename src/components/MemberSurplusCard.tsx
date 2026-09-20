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
    <>
      <div 
        className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex flex-col cursor-pointer hover:bg-green-50 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <span className="text-sm font-medium text-gray-500 mb-1 flex items-center justify-between">
          Total Surplus 
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full cursor-pointer">Détails</span>
        </span>
        <span className="text-3xl font-bold text-success">+{totalSurplus.toLocaleString('fr-FR')} CFA</span>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Détails des surplus</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {surplusDetails.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun surplus enregistré pour le moment.</p>
              ) : (
                <ul className="space-y-4">
                  {surplusDetails.map((detail, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{detail.period}</p>
                        <p className="text-xs text-gray-500">
                          Attendu: {detail.expected.toLocaleString('fr-FR')} | Versé: {detail.paid.toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <span className="font-bold text-success">+{detail.surplus.toLocaleString('fr-FR')} CFA</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
