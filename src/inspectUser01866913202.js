const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { mobile: { contains: "01866913202" } },
        { name: { contains: "01866913202" } }
      ]
    }
  });

  console.log("USER_01866913202:", JSON.stringify(user, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
