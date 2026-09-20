import { getAllUsersWithRoles } from "@/app/actions/settings";
import NewCommunicationClient from "./NewCommunicationClient";
import Link from "next/link";

export default async function NewCommunicationPage() {
  const users = await getAllUsersWithRoles();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/communications" className="text-gray-500 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle Communication</h1>
          <p className="mt-1 text-sm text-gray-500">Envoyer un message aux membres</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <NewCommunicationClient users={users} />
      </div>
    </div>
  );
}
