import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Création de l'Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@teranga.com' },
    update: {},
    create: {
      email: 'admin@teranga.com',
      name: 'Admin Teranga',
      password: hashedPassword,
      role: 'ADMIN',
      mustChangePassword: false,
    },
  })
  console.log({ admin })

  // Création d'un Membre
  const member = await prisma.user.upsert({
    where: { email: 'membre@teranga.com' },
    update: {},
    create: {
      email: 'membre@teranga.com',
      name: 'Membre Test',
      password: hashedPassword,
      role: 'MEMBER',
    },
  })
  // Catégories de dépenses initiales
  const defaultCategories = [
    { name: "Logistique & Transport", color: "#3B82F6", description: "Frais de déplacement, transport de matériel, carburant" },
    { name: "Restauration & Traiteur", color: "#F59E0B", description: "Repas, collations, boissons lors des réunions ou événements" },
    { name: "Location de salle & Matériel", color: "#8B5CF6", description: "Location d'espaces, sono, chaises, vidéo-projecteurs" },
    { name: "Aide sociale & Solidarité", color: "#EC4899", description: "Secours aux membres, naissances, décès, mariages" },
    { name: "Communication & Événementiel", color: "#10B981", description: "Affiches, banderoles, réseaux sociaux, flyers" },
    { name: "Frais bancaires & Commissions", color: "#64748B", description: "Frais de virement, frais de tenue de compte, commissions" },
    { name: "Fournitures & Administratif", color: "#6366F1", description: "Papeterie, impressions, fournitures de bureau" },
    { name: "Autre", color: "#9CA3AF", description: "Dépenses diverses non classées ailleurs" },
  ];

  for (const cat of defaultCategories) {
    await prisma.expenseCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
