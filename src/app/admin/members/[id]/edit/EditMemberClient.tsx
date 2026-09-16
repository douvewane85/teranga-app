"use client";

import React, { useState } from "react";
import { editMember } from "@/app/actions/members";
import Link from "next/link";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none disabled:opacity-50"
    >
      {pending ? "Enregistrement..." : "Enregistrer les modifications"}
    </button>
  );
}

export default function EditMemberClient({ member }: { member: any }) {
  const [error, setError] = useState<string | null>(null);

  const clientAction = async (formData: FormData) => {
    try {
      setError(null);
      await editMember(member.id, formData);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la modification.");
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
      <form action={clientAction} className="space-y-6 p-6">
        {error && (
          <div className="bg-red-50 border border-red-500 text-red-500 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nom complet
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              defaultValue={member.name}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Adresse e-mail
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              required
              defaultValue={member.email}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Numéro de téléphone
          </label>
          <div className="mt-1">
            <input
              type="tel"
              name="phone"
              id="phone"
              defaultValue={member.phone}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
            Date de naissance
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="birthDate"
              id="birthDate"
              defaultValue={member.birthDate}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
            Profession
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="profession"
              id="profession"
              defaultValue={member.profession}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="idCardNumber" className="block text-sm font-medium text-gray-700">
            Numéro de Carte d'Identité (NIN)
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="idCardNumber"
              id="idCardNumber"
              defaultValue={member.idCardNumber}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Statut du membre
          </label>
          <div className="mt-1">
            <select
              name="status"
              id="status"
              defaultValue={member.status}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            >
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
          <Link
            href="/admin/members"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Annuler
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
