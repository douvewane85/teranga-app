"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function createMember(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const status = formData.get("status") as string;

  const phone = formData.get("phone") as string | null;
  const birthDateStr = formData.get("birthDate") as string | null;
  const profession = formData.get("profession") as string | null;
  const idCardNumber = formData.get("idCardNumber") as string | null;

  let birthDate: Date | undefined;
  if (birthDateStr) {
    birthDate = new Date(birthDateStr);
  }

  if (!name || !email) {
    throw new Error("Le nom et l'email sont obligatoires.");
  }

  // Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Un membre avec cette adresse email existe déjà.");
  }

  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Création du membre avec un mot de passe par défaut
  await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      birthDate: birthDate || null,
      profession: profession || null,
      idCardNumber: idCardNumber || null,
      status,
      password: hashedPassword,
      mustChangePassword: true,
      role: "MEMBER",
    },
  });

  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export async function editMember(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const status = formData.get("status") as string;

  const phone = formData.get("phone") as string | null;
  const birthDateStr = formData.get("birthDate") as string | null;
  const profession = formData.get("profession") as string | null;
  const idCardNumber = formData.get("idCardNumber") as string | null;

  let birthDate: Date | undefined;
  if (birthDateStr) {
    birthDate = new Date(birthDateStr);
  }

  if (!name || !email) {
    throw new Error("Le nom et l'email sont obligatoires.");
  }

  const existingUser = await prisma.user.findFirst({
    where: { 
      email,
      id: { not: id } 
    },
  });

  if (existingUser) {
    throw new Error("Un autre membre avec cette adresse email existe déjà.");
  }

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      phone: phone || null,
      birthDate: birthDate || null,
      profession: profession || null,
      idCardNumber: idCardNumber || null,
      status,
    },
  });

  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export async function resetMemberPassword(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) throw new Error("ID du membre manquant.");

  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      mustChangePassword: true,
    },
  });

  revalidatePath("/admin/members");
}

export async function deleteMember(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) throw new Error("ID du membre manquant.");

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/admin/members");
}
