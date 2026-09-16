import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import EditMemberClient from "./EditMemberClient";

const prisma = new PrismaClient();

export default async function EditMemberPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const member = await prisma.user.findUnique({
    where: { id }
  });

  if (!member) {
    redirect("/admin/members");
  }

  // Formatting date for the date input if it exists
  let birthDateStr = "";
  if (member.birthDate) {
    birthDateStr = member.birthDate.toISOString().split("T")[0];
  }

  const serializedMember = {
    id: member.id,
    name: member.name || "",
    email: member.email,
    phone: member.phone || "",
    birthDate: birthDateStr,
    profession: member.profession || "",
    idCardNumber: member.idCardNumber || "",
    status: member.status,
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Éditer le membre</h1>
        <p className="mt-1 text-sm text-gray-500">
          Modifiez les informations personnelles ou le statut de ce membre.
        </p>
      </div>
      <EditMemberClient member={serializedMember} />
    </div>
  );
}
