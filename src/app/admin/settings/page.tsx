import { getSettings, getAllUsersWithRoles } from "@/app/actions/settings";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const settings = await getSettings();
  const users = await getAllUsersWithRoles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gérez les informations de l'association, la configuration financière et les rôles administrateurs.
        </p>
      </div>
      
      <SettingsClient initialSettings={settings} users={users} />
    </div>
  );
}
