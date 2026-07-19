import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  // Use environment variables if present, fallback to dummy credentials during build time to prevent Next.js static page evaluation from crashing.
  const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
