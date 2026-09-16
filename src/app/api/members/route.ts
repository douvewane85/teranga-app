import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeCampaignId = searchParams.get("excludeCampaignId");

    const whereClause: any = {
      role: "MEMBER",
    };

    if (excludeCampaignId) {
      whereClause.obligations = {
        none: {
          campaignId: excludeCampaignId,
        },
      };
    }

    const members = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}
