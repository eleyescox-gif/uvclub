const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { mobile: '01812000109' }
  });
  console.log('User 01812000109:', user);

  const allUsers = await prisma.user.findMany({
    select: { mobile: true, name: true, role: true }
  });
  console.log('All Users:', allUsers);
}

main().finally(() => prisma.$disconnect());
