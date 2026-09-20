"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendCommunication } from "@/app/actions/communications";
import { CommunicationChannel } from "@prisma/client";

export default function NewCommunicationClient({ users }: { users: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    channel: "IN_APP" as CommunicationChannel,
    targetGroup: "ALL" as "ALL" | "LATE" | "UP_TO_DATE" | "SPECIFIC",
    specificUserIds: [] as string[],
    subject: "",
    content: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await sendCommunication(formData);
      router.push("/admin/communications");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de l'envoi.");
      setIsSubmitting(false);
    }
  };

  const handleUserSelection = (userId: string) => {
    setFormData(prev => {
      const selected = prev.specificUserIds.includes(userId)
        ? prev.specificUserIds.filter(id => id !== userId)
        : [...prev.specificUserIds, userId];
      return { ...prev, specificUserIds: selected };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* CANAL */}
      <div>
        <label className="text-base font-medium text-gray-900 block mb-3">1. Canal de communication</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: "IN_APP", label: "In-App", icon: "🔔" },
            { id: "EMAIL", label: "Email", icon: "✉️" },
            { id: "WHATSAPP", label: "WhatsApp", icon: "💬" },
            { id: "SMS", label: "SMS", icon: "📱" },
          ].map(c => (
            <div 
              key={c.id}
              onClick={() => setFormData({...formData, channel: c.id as CommunicationChannel})}
              className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors ${
                formData.channel === c.id ? "bg-primary/5 border-primary ring-1 ring-primary" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="text-2xl">{c.icon}</span>
              <span className={`text-sm font-medium ${formData.channel === c.id ? "text-primary" : "text-gray-700"}`}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DESTINATAIRES */}
      <div>
        <label className="text-base font-medium text-gray-900 block mb-3">2. Destinataires</label>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" checked={formData.targetGroup === "ALL"} onChange={() => setFormData({...formData, targetGroup: "ALL"})} className="text-primary focus:ring-primary h-4 w-4" />
              <span>Tous les membres</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={formData.targetGroup === "LATE"} onChange={() => setFormData({...formData, targetGroup: "LATE"})} className="text-primary focus:ring-primary h-4 w-4" />
              <span>Membres en retard</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={formData.targetGroup === "UP_TO_DATE"} onChange={() => setFormData({...formData, targetGroup: "UP_TO_DATE"})} className="text-primary focus:ring-primary h-4 w-4" />
              <span>Membres à jour</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={formData.targetGroup === "SPECIFIC"} onChange={() => setFormData({...formData, targetGroup: "SPECIFIC"})} className="text-primary focus:ring-primary h-4 w-4" />
              <span>Membres spécifiques</span>
            </label>
          </div>

          {formData.targetGroup === "SPECIFIC" && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg max-h-60 overflow-y-auto bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-2">
              {users.map(user => (
                <label key={user.id} className="flex items-center p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-gray-200">
                  <input 
                    type="checkbox" 
                    checked={formData.specificUserIds.includes(user.id)}
                    onChange={() => handleUserSelection(user.id)}
                    className="h-4 w-4 text-primary rounded focus:ring-primary border-gray-300 mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name || "Inconnu"}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MESSAGE */}
      <div>
        <label className="text-base font-medium text-gray-900 block mb-3">3. Message</label>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Sujet (Optionnel, utile pour les Emails)</label>
            <input 
              type="text"
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              placeholder="Ex: Rappel de cotisation annuelle"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Contenu <span className="text-red-500">*</span></label>
            <textarea 
              required
              rows={6}
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              placeholder="Saisissez votre message ici..."
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting || (formData.targetGroup === "SPECIFIC" && formData.specificUserIds.length === 0)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? "Envoi en cours..." : "Envoyer la communication"}
        </button>
      </div>
    </form>
  );
}
