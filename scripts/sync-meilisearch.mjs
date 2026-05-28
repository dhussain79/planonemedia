#!/usr/bin/env node

import "dotenv/config";
import { PrismaClient } from "prisma-planone/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { MeiliSearch } from "meilisearch";

const host = process.env.MEILISEARCH_HOST;
const apiKey = process.env.MEILISEARCH_API_KEY;

if (!host) {
  console.error("MEILISEARCH_HOST not set. Skipping sync.");
  process.exit(0);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const ms = new MeiliSearch({ host, apiKey: apiKey || undefined });

async function main() {
  console.log("Syncing media to Meilisearch...\n");

  const index = ms.index("media");

  await index.updateSettings({
    searchableAttributes: ["title", "description", "supplierName", "categoryNames", "region"],
    filterableAttributes: ["mediaType", "region", "status", "categoryNames"],
  });
  console.log("  ✓ Index settings updated");

  const media = await prisma.media.findMany({
    where: { status: "published" },
    include: {
      supplier: { select: { companyName: true } },
      categories: { include: { category: { select: { name: true } } } },
    },
  });

  const documents = media.map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    mediaType: m.mediaType,
    region: m.region,
    description: m.description,
    summary: m.summary,
    starRating: m.starRating,
    supplierName: m.supplier?.companyName ?? null,
    categoryNames: m.categories.map((mc) => mc.category.name),
    status: m.status,
  }));

  const task = await index.addDocuments(documents, { primaryKey: "id" });
  console.log(`  ✓ ${documents.length} documents queued (task ${task.taskUid})`);

  const result = await ms.waitForTask(task.taskUid, { timeOutMs: 30000 });
  console.log(`  ✓ Sync complete (${result.status})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
