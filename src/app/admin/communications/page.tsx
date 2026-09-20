import { getCommunications } from "@/app/actions/communications";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function CommunicationsDashboard() {
  const communications = await getCommunications();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Historique des messages envoyés aux membres.
          </p>
        </div>
        <Link 
          href="/admin/communications/new" 
          className="bg-primary text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary-hover flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Message
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sujet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expéditeur</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Destinataires</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {communications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                    Aucune communication envoyée.
                  </td>
                </tr>
              ) : (
                communications.map((comm: any) => (
                  <tr key={comm.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(comm.createdAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${comm.channel === 'IN_APP' ? 'bg-blue-100 text-blue-800' : ''}
                        ${comm.channel === 'EMAIL' ? 'bg-purple-100 text-purple-800' : ''}
                        ${comm.channel === 'WHATSAPP' ? 'bg-green-100 text-green-800' : ''}
                        ${comm.channel === 'SMS' ? 'bg-orange-100 text-orange-800' : ''}
                      `}>
                        {comm.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">
                      {comm.subject || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comm.sender.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-gray-900">
                      {comm._count.targets}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
