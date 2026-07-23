const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.update({
    where: { mobile: '01812000109' },
    data: { role: 'CONTROLLER', activeStatus: true }
  });
  console.log('Successfully updated 01812000109:', updated.name, 'Role:', updated.role, 'Mobile:', updated.mobile, 'Password:', updated.password);
}

main().finally(() => prisma.$disconnect());
