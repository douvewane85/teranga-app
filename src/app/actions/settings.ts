"use server";

import { PrismaClient, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function getSettings() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  let settings = await prisma.systemSetting.findUnique({
    where: { id: "global" },
  });

  if (!settings) {
    settings = await prisma.systemSetting.create({
      data: {
        id: "global",
        associationName: "Teranga Alliance",
        currency: "CFA"
      }
    });
  }

  return settings;
}

export async function updateSettings(data: {
  associationName?: string;
  contactEmail?: string;
  contactPhone?: string;
  currency?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const settings = await prisma.systemSetting.upsert({
    where: { id: "global" },
    update: data,
    create: {
      id: "global",
      associationName: data.associationName || "Teranga Alliance",
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      currency: data.currency || "CFA",
    }
  });

  return settings;
}

export async function getAllUsersWithRoles() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
    orderBy: {
      name: "asc"
    }
  });

  return users;
}

export async function updateUserRole(userId: string, newRole: Role) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Prevent an admin from demoting themselves to avoid locking out the only admin
  if (userId === session.user.id && newRole !== "ADMIN") {
    const otherAdmins = await prisma.user.count({
      where: { role: "ADMIN", id: { not: userId } }
    });
    if (otherAdmins === 0) {
      throw new Error("Vous êtes le seul administrateur, vous ne pouvez pas vous rétrograder.");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  return updatedUser;
}
