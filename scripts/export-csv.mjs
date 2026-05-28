import "dotenv/config";
import { PrismaClient } from "prisma-planone/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "tmp-csv-output");

const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

function esc(v) {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function csv(rows, cols) {
  return cols.map(esc).join(",") + "\n" + rows.map(r => cols.map(c => esc(r[c])).join(",")).join("\n");
}

function strip(s) {
  if (!s) return "";
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, " ")
    .replace(/(?<![a-zA-Z])rn(?![a-zA-Z])/g, " ")
    .replace(/\s{3,}/g, "  ")
    .trim();
}

async function main() {
  const [categories, suppliers, media] = await Promise.all([
    p.category.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] }),
    p.supplier.findMany({ orderBy: { companyName: "asc" } }),
    p.media.findMany({
      orderBy: { title: "asc" },
      include: { supplier: true, categories: { include: { category: true } } },
    }),
  ]);

  writeFileSync(resolve(OUT_DIR, "categories.csv"), csv(categories, ["id", "name", "type", "parentId"]), "utf-8");
  console.log("categories.csv done");

  writeFileSync(
    resolve(OUT_DIR, "suppliers.csv"),
    csv(suppliers, ["id", "companyName", "tradingName", "crn", "vatNumber", "email", "phone", "fax", "billingAddress", "website", "logo", "status", "primaryContactId", "createdAt", "updatedAt"]),
    "utf-8"
  );
  console.log("suppliers.csv done");

  const mediaRows = media.map(m => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    mediaType: m.mediaType,
    description: strip(m.description),
    summary: strip(m.summary),
    region: m.region,
    category: m.category,
    profile: m.profile,
    ratecardFiles: m.ratecardFiles ? JSON.stringify(m.ratecardFiles) : "",
    logoUrl: m.logoUrl,
    starRating: m.starRating,
    status: m.status,
    supplierName: m.supplier?.companyName ?? "",
    categories: m.categories.map(c => `${c.category.name}(${c.category.type})`).join("; "),
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }));

  writeFileSync(
    resolve(OUT_DIR, "media.csv"),
    csv(mediaRows, ["id", "title", "slug", "mediaType", "description", "summary", "region", "category", "profile", "ratecardFiles", "logoUrl", "starRating", "status", "supplierName", "categories", "createdAt", "updatedAt"]),
    "utf-8"
  );
  console.log("media.csv done");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => p.$disconnect());
