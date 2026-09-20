"use client";

import { useState } from "react";
import { updateSettings, updateUserRole } from "@/app/actions/settings";
import { Role } from "@prisma/client";

export default function SettingsClient({ initialSettings, users: initialUsers }: { initialSettings: any, users: any[] }) {
  const [activeTab, setActiveTab] = useState<"profile" | "finances" | "roles">("profile");
  
  const [settings, setSettings] = useState(initialSettings);
  const [users, setUsers] = useState(initialUsers);
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });
    try {
      await updateSettings(settings);
      setMessage({ text: "Paramètres mis à jour avec succès.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Erreur lors de la mise à jour.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err.message || "Erreur lors du changement de rôle.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: "profile", name: "Profil de l'Association", icon: "🏢" },
            { id: "finances", name: "Finances & Devises", icon: "💰" },
            { id: "roles", name: "Rôles & Permissions", icon: "🛡️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
              `}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        {(activeTab === "profile" || activeTab === "finances") && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
            {activeTab === "profile" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom de l'association</label>
                  <input
                    type="text"
                    required
                    value={settings.associationName}
                    onChange={e => setSettings({...settings, associationName: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email de contact</label>
                  <input
                    type="email"
                    value={settings.contactEmail || ""}
                    onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone de contact</label>
                  <input
                    type="text"
                    value={settings.contactPhone || ""}
                    onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  />
                </div>
              </>
            )}

            {activeTab === "finances" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Devise par défaut</label>
                <select
                  value={settings.currency}
                  onChange={e => setSettings({...settings, currency: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                >
                  <option value="CFA">CFA (Franc CFA)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">Cette devise sera affichée partout dans l'application.</p>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover shadow-sm disabled:opacity-50"
              >
                {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "roles" && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle actuel</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || "Inconnu"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                        className="text-sm border-gray-300 rounded-md py-1 pl-2 pr-8 border focus:ring-primary focus:border-primary"
                      >
                        <option value="MEMBER">Membre</option>
                        <option value="ADMIN">Administrateur</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
