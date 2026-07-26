const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { mobile: "01812000109" }
  });
  console.log("CONTROLLER_USER_01812000109:", JSON.stringify(user, null, 2));

  try {
    const settings = await prisma.clubSettings.findUnique({ where: { id: "singleton" } });
    console.log("CLUB_SETTINGS:", JSON.stringify(settings, null, 2));
  } catch (e) {
    console.log("ClubSettings error:", e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
