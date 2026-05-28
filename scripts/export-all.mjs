import "dotenv/config";
import { PrismaClient } from "prisma-planone/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

try {
  const [categories, suppliers, media, persons] = await Promise.all([
    p.category.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] }),
    p.supplier.findMany({
      orderBy: { companyName: "asc" },
      include: { primaryContact: true, contacts: true },
    }),
    p.media.findMany({
      orderBy: { title: "asc" },
      include: { supplier: true, categories: { include: { category: true } } },
    }),
    p.person.findMany(),
  ]);

  const outPath = resolve(__dirname, "output", "fulldata.json");
  writeFileSync(outPath, JSON.stringify({ categories, suppliers, media, persons }, null, 2), "utf-8");
  console.log("Written to", outPath);
} finally {
  await p.$disconnect();
}
