import "dotenv/config";
import { PrismaClient } from "prisma-planone/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

try {
  const [person, cats, supps, medias] = await Promise.all([
    prisma.person.count(),
    prisma.category.count({ where: { type: "CATEGORY" } }),
    prisma.supplier.count(),
    prisma.media.count(),
  ]);
  const byType = await prisma.category.groupBy({ by: ["type"], _count: true });
  console.log({ person, categoryCount: cats, suppliers: supps, media: medias });
  console.log("Categories by type:", Object.fromEntries(byType.map(r => [r.type, r._count])));

  const sample = await prisma.media.findFirst({
    include: { categories: { include: { category: true } }, supplier: true },
  });
  if (sample) {
    console.log("\nSample media:");
    console.log("  Title:", sample.title);
    console.log("  Type:", sample.mediaType);
    console.log("  Supplier:", sample.supplier?.companyName);
    console.log("  Categories:", sample.categories.map(c => c.category.name + "(" + c.category.type + ")"));
  }
} finally {
  await prisma.$disconnect();
}
