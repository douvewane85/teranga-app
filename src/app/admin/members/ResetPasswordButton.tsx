"use client";

import { useFormStatus } from "react-dom";

export default function ResetPasswordButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center ml-2 px-3 py-1.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 bg-white hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm disabled:opacity-50"
      title="Réinitialiser le mot de passe (password123)"
      onClick={(e) => {
        if (!confirm("Voulez-vous vraiment réinitialiser le mot de passe de ce membre à 'password123' ? Il devra le changer à la prochaine connexion.")) {
          e.preventDefault();
        }
      }}
    >
      <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
      {pending ? "Reset en cours..." : "Reset MDP"}
    </button>
  );
}
