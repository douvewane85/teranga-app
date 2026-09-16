import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const allPayments = await prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      include: {
        obligation: {
          include: {
            user: {
              select: { name: true, email: true }
            },
            campaign: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let csvContent = 'ID,Date,Membre,Email,Campagne,Montant,Methode,Reference\n';

    allPayments.forEach(p => {
      const date = p.createdAt.toLocaleDateString('fr-FR');
      const member = `"${p.obligation.user.name || ''}"`;
      const email = `"${p.obligation.user.email}"`;
      const campaign = `"${p.obligation.campaign.name}"`;
      const amount = p.amount.toString();
      const method = p.method;
      const ref = `"${p.reference || ''}"`;
      
      csvContent += `${p.id},${date},${member},${email},${campaign},${amount},${method},${ref}\n`;
    });

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="export_paiements.csv"'
      }
    });

  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Error generating export", { status: 500 });
  }
}
