import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const obligations = await prisma.obligation.findMany({
    include: { campaign: { include: { tiers: true } }, user: true }
  });
  
  for (const obs of obligations) {
    console.log(`Obligation ID: ${obs.id}, User: ${obs.user.name}, targetAmount: ${obs.targetAmount}`);
    if (obs.campaign) {
      console.log(`  Campaign goalAmount: ${obs.campaign.goalAmount}`);
      console.log(`  Campaign Tiers: ${obs.campaign.tiers.map(t => t.amount).join(', ')}`);
    }
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
