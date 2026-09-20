"use server";

import { PrismaClient, CommunicationChannel } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function getCommunications() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const communications = await prisma.communication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { name: true } },
      _count: { select: { targets: true } }
    }
  });

  return communications;
}

export async function sendCommunication(data: {
  subject?: string;
  content: string;
  channel: CommunicationChannel;
  targetGroup: "ALL" | "LATE" | "UP_TO_DATE" | "SPECIFIC";
  specificUserIds?: string[];
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  let userIds: string[] = [];

  if (data.targetGroup === "ALL") {
    const users = await prisma.user.findMany({ select: { id: true } });
    userIds = users.map((u: any) => u.id);
  } else if (data.targetGroup === "SPECIFIC" && data.specificUserIds) {
    userIds = data.specificUserIds;
  } else {
    // For LATE and UP_TO_DATE, we must check obligations
    const usersWithObligations = await prisma.user.findMany({
      include: {
        obligations: {
          select: { status: true }
        }
      }
    });

    userIds = usersWithObligations.filter((user: any) => {
      const hasLate = user.obligations.some((ob: any) => ob.status === "OVERDUE");
      if (data.targetGroup === "LATE") return hasLate;
      if (data.targetGroup === "UP_TO_DATE") return !hasLate;
      return false;
    }).map((u: any) => u.id);
  }

  if (userIds.length === 0) {
    throw new Error("Aucun destinataire trouvé pour ce groupe.");
  }

  // Création de la communication
  const communication = await prisma.communication.create({
    data: {
      subject: data.subject,
      content: data.content,
      channel: data.channel,
      senderId: session.user.id,
      targets: {
        create: userIds.map(userId => ({
          userId: userId,
          status: data.channel === "IN_APP" ? "PENDING" : "SENT" // Simulation: Emails/SMS sont considérés envoyés, IN_APP attendent d'être lus
        }))
      }
    }
  });

  // TODO: Add actual Email (Resend) or WhatsApp (Twilio) API calls here based on data.channel
  console.log(`[COMMUNICATION SENT] ${data.channel} to ${userIds.length} users. Subject: ${data.subject}`);

  return communication;
}
