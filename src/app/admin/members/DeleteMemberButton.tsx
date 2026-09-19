"use client";

import { useFormStatus } from "react-dom";

export default function DeleteMemberButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible et supprimera également toutes ses obligations et paiements.")) {
          e.preventDefault();
        }
      }}
      className="inline-flex items-center px-3 py-1.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50"
      title="Supprimer ce membre"
    >
      <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      {pending ? "..." : "Supprimer"}
    </button>
  );
}
