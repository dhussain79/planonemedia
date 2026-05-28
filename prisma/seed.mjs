import "dotenv/config";
import { PrismaClient } from "prisma-planone/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const root = resolve(import.meta.dirname, "..");

async function main() {
  console.log("Seeding database...\n");

  const categories = JSON.parse(readFileSync(resolve(root, "scripts", "output", "categories.json"), "utf-8"));
  const suppliers = JSON.parse(readFileSync(resolve(root, "scripts", "output", "suppliers.json"), "utf-8"));
  const media = JSON.parse(readFileSync(resolve(root, "scripts", "output", "media.json"), "utf-8"));

  // 1. Create default PlanOne Media person
  const defaultPerson = await prisma.person.create({
    data: {
      firstName: "PlanOne",
      lastName: "Media",
      jobTitle: "Default Contact",
      isDefault: true,
    },
  });
  console.log(`  ✓ Default person created: "${defaultPerson.firstName} ${defaultPerson.lastName}" (${defaultPerson.id})`);

  // 2. Insert categories
  console.log(`\n  Inserting ${categories.length} categories...`);
  await prisma.category.createMany({ data: categories, skipDuplicates: true });
  const allCats = await prisma.category.findMany({ select: { id: true, name: true, type: true } });
  const categoryMap = new Map(allCats.map(c => [`${c.type}::${c.name}`, c.id]));
  console.log(`  ✓ ${allCats.length} categories loaded`);

  // 3. Insert suppliers
  console.log(`\n  Inserting ${suppliers.length} suppliers...`);
  const supplierMap = new Map();
  for (const s of suppliers) {
    const { _quality, ...supplierData } = s;
    const created = await prisma.supplier.create({
      data: {
        ...supplierData,
        primaryContactId: defaultPerson.id,
      },
    });
    supplierMap.set(s.companyName, created.id);
  }
  console.log(`  ✓ ${suppliers.length} suppliers inserted`);

  // 4. Insert media (without category associations for speed)
  console.log(`\n  Inserting ${media.length} media...`);
  const mediaIds = [];
  for (const m of media) {
    const { _quality, supplierName, categoryNames, ...mediaData } = m;
    const resolvedSupplierId = supplierName != null ? supplierMap.get(supplierName) : null;
    const created = await prisma.media.create({
      data: { ...mediaData, supplierId: resolvedSupplierId },
    });
    mediaIds.push({ id: created.id, categoryNames });
  }
  console.log(`  ✓ ${media.length} media inserted`);

  // 5. Batch insert media–category associations
  const mcData = [];
  for (const { id, categoryNames } of mediaIds) {
    for (const key of categoryNames) {
      const catId = categoryMap.get(key);
      if (catId) mcData.push({ mediaId: id, categoryId: catId });
    }
  }
  if (mcData.length) {
    await prisma.mediaCategory.createMany({ data: mcData, skipDuplicates: true });
  }
  console.log(`  ✓ ${mcData.length} media–category associations created`);

  console.log("\nSeeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
