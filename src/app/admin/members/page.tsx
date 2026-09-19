import { PrismaClient } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { redirect } from "next/navigation";
import { resetMemberPassword, deleteMember } from "@/app/actions/members";
import ResetPasswordButton from "./ResetPasswordButton";
import DeleteMemberButton from "./DeleteMemberButton";

const prisma = new PrismaClient();

// Next.js 15+ searchParams are Promises
export default async function MembersPage(props: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const statusFilter = searchParams.status || "ALL";
  
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 10;
  
  const whereClause: any = {};
  
  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ];
  }
  
  if (statusFilter !== "ALL") {
    whereClause.status = statusFilter;
  }

  const [members, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: whereClause })
  ]);
  
  const totalPages = Math.ceil(totalCount / pageSize);

  // Helper pour générer des initiales
  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Membres de l'Alliance</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            Gérez la liste de tous les membres de l'association, modifiez leurs informations ou ajoutez-en de nouveaux.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/members/new"
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter un membre
          </Link>
        </div>
      </div>
      
      {/* Filtres */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <form action="/admin/members" method="GET" className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Rechercher par nom ou email..."
              className="block w-full pl-10 rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors border"
            />
          </div>
          <div className="sm:w-48">
            <select
              name="status"
              defaultValue={statusFilter}
              className="block w-full rounded-lg border-gray-300 py-2.5 pl-3 pr-10 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors border bg-white"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            Filtrer
          </button>
        </form>
      </div>

      {/* Grille de Membres (Tableau moderne) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Membre
                </th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Rôle
                </th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Inscription
                </th>
                <th scope="col" className="relative py-4 pl-3 pr-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm shadow-inner border border-blue-200">
                        {getInitials(member.name)}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">{member.name || "N/A"}</div>
                        <div className="text-gray-500 text-sm">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden md:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {member.role === "ADMIN" ? "Admin" : "Membre"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <Badge variant={member.status === "ACTIVE" ? "success" : "warning"}>
                      {member.status === "ACTIVE" ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden lg:table-cell">
                    {new Date(member.createdAt).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                    <Link
                      href={`/admin/members/${member.id}/edit`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:text-primary transition-colors shadow-sm"
                    >
                      <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Éditer
                    </Link>

                    <form action={resetMemberPassword} className="inline ml-2">
                      <input type="hidden" name="id" value={member.id} />
                      <ResetPasswordButton />
                    </form>

                    <form action={deleteMember} className="inline ml-2">
                      <input type="hidden" name="id" value={member.id} />
                      <DeleteMemberButton />
                    </form>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="mx-auto h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl">👥</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun membre trouvé</h3>
                    <p className="text-sm text-gray-500">
                      Essayez de modifier vos filtres de recherche.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <Link
                href={`/admin/members?page=${page - 1}&q=${query}&status=${statusFilter}`}
                className={`relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
              >
                Précédent
              </Link>
              <Link
                href={`/admin/members?page=${page + 1}&q=${query}&status=${statusFilter}`}
                className={`relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
              >
                Suivant
              </Link>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage page <span className="font-semibold text-gray-900">{page}</span> sur <span className="font-semibold text-gray-900">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <Link
                    href={`/admin/members?page=${page - 1}&q=${query}&status=${statusFilter}`}
                    className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 transition-colors ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <span className="sr-only">Précédent</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <Link
                    href={`/admin/members?page=${page + 1}&q=${query}&status=${statusFilter}`}
                    className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 transition-colors ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <span className="sr-only">Suivant</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
