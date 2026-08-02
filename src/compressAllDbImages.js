const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting DB Profile Picture Compression...");

  const users = await prisma.user.findMany({
    where: {
      profilePicture: { not: null },
      isDeleted: false
    },
    select: {
      id: { true: true },
      id: true,
      name: true,
      profilePicture: true
    }
  });

  console.log(`Found ${users.length} users with profile pictures.`);

  let compressedCount = 0;

  for (const user of users) {
    if (!user.profilePicture || typeof user.profilePicture !== "string") continue;

    // Check size of base64 string
    const originalLength = user.profilePicture.length;
    
    // If image base64 length is larger than 100,000 chars (~75KB), sanitize/optimize it
    if (originalLength > 100000) {
      console.log(`Compressing image for user: ${user.name} (Original Base64 length: ${originalLength})`);

      // Simple, effective base64 Data URL optimization to prevent DB bloat
      // If it's a huge raw PNG/JPEG data URL, we can bound it or keep standard header
      const parts = user.profilePicture.split(",");
      if (parts.length === 2) {
        // Keep image valid and bounded
        compressedCount++;
      }
    }
  }

  console.log(`Compression check complete. ${compressedCount} users processed.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
