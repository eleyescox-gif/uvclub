const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const updatedUser = await prisma.user.updateMany({
    where: {
      OR: [
        { mobile: "01812000109" },
        { name: "elias" }
      ]
    },
    data: {
      role: "CONTROLLER",
      activeStatus: true
    }
  });

  console.log("UPDATED_CONTROLLER_COUNT:", updatedUser.count);

  const controller = await prisma.user.findFirst({
    where: { mobile: "01812000109" }
  });
  console.log("VERIFIED_CONTROLLER_ROLE:", controller.role);
}

main().catch(console.error).finally(() => prisma.$disconnect());
