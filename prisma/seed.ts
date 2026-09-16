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
  console.log({ member })
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
