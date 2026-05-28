import "dotenv/config";
import { PrismaClient } from "prisma-planone/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

try {
  await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS postgis");
  console.log("PostGIS enabled successfully");
} catch (e) {
  console.error("Failed to enable PostGIS:", e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
