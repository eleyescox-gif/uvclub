const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { mobile: { contains: "01616962173" } },
        { mobile: { contains: "1616962173" } }
      ]
    }
  });

  console.log("USERS_FOUND:", JSON.stringify(users, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
