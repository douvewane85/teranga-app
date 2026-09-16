"use client";

import React, { useState } from "react";

export default function ProofImageModal({ url }: { url: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-primary hover:text-primary-hover hover:underline ml-2 text-sm font-medium focus:outline-none"
      >
        Voir preuve
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/75 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-900">Preuve de paiement</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-gray-500 focus:outline-none bg-white rounded-md p-1"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-auto p-4 flex justify-center bg-gray-100 flex-grow">
              <img 
                src={url} 
                alt="Preuve de paiement" 
                className="max-w-full h-auto object-contain shadow-sm border border-gray-200 bg-white" 
              />
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
               <button 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
