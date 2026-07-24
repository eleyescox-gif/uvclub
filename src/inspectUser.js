const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { mobile: "01616962173" }
  });
  console.log("USER_DATA:", JSON.stringify(user, null, 2));

  // Also check all users where name equals mobile
  const usersWithNameAsMobile = await prisma.user.findMany({
    where: {
      activeStatus: true,
      isDeleted: false
    },
    select: { id: true, name: true, nameBn: true, nameEn: true, mobile: true }
  });
  console.log("ALL_MEMBERS:", JSON.stringify(usersWithNameAsMobile, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
