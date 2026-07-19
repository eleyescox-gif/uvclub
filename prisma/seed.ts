import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create an Admin user (President)
  const admin = await prisma.user.upsert({
    where: { mobile: "01711111111" },
    update: {},
    create: {
      name: "President Admin",
      mobile: "01711111111",
      password: "password123", // In real app, this should be hashed
      role: "PRESIDENT",
      balance: 5000,
    },
  });

  // Create a Cashier
  const cashier = await prisma.user.upsert({
    where: { mobile: "01722222222" },
    update: {},
    create: {
      name: "Cashier Manager",
      mobile: "01722222222",
      password: "password123",
      role: "CASHIER",
      balance: 1000,
    },
  });

  // Create a General Member
  const member = await prisma.user.upsert({
    where: { mobile: "01733333333" },
    update: {},
    create: {
      name: "General Member",
      mobile: "01733333333",
      password: "password123",
      role: "MEMBER",
      balance: 3000,
    },
  });

  console.log("Database seeded successfully!");
  console.log({ admin, cashier, member });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
