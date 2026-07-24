const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fix() {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    const cleanedMobile = user.mobile ? user.mobile.trim() : user.mobile;
    const cleanedName = user.name ? user.name.trim() : user.name;
    const cleanedPassword = user.password ? user.password.trim() : user.password;

    if (cleanedMobile !== user.mobile || cleanedName !== user.name || cleanedPassword !== user.password) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          mobile: cleanedMobile,
          name: cleanedName,
          password: cleanedPassword,
          activeStatus: true
        }
      });
      console.log(`Cleaned user: ${user.id} -> mobile: '${cleanedMobile}', pass: '${cleanedPassword}'`);
    }
  }

  console.log("Database mobile cleanup complete!");
}

fix().catch(console.error).finally(() => prisma.$disconnect());
