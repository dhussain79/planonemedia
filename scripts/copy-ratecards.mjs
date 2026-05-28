#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { resolve, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const LEGACY_FILES = resolve("C:/Users/macro/OneDrive/Click/Opencode/foldedup/deploy/sites/default/files");
const OUTPUT_DIR = resolve(PROJECT_ROOT, "public", "ratecards");
const MEDIA_JSON = resolve(PROJECT_ROOT, "scripts", "output", "media.json");

function DrupalUriToLocalPath(uri) {
  if (!uri || !uri.startsWith("public://")) return null;
  return uri.replace("public://", "");
}

async function main() {
  console.log("Copying ratecard files from legacy source...\n");

  const media = JSON.parse(readFileSync(MEDIA_JSON, "utf-8"));
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const allRatecards = media.flatMap((m) =>
    (m.ratecardFiles || []).map((rc) => ({
      mediaTitle: m.title,
      mediaSlug: m.slug,
      ...rc,
    }))
  );

  const uniqueByFid = new Map();
  for (const rc of allRatecards) {
    if (rc.fid && !uniqueByFid.has(rc.fid)) uniqueByFid.set(rc.fid, rc);
  }

  console.log(`  Total ratecard references: ${allRatecards.length}`);
  console.log(`  Unique files (by fid): ${uniqueByFid.size}`);

  let copied = 0;
  let skipped = 0;
  let missing = 0;
  const pathMap = new Map();

  for (const [fid, rc] of uniqueByFid) {
    const localRelative = DrupalUriToLocalPath(rc.url);
    if (!localRelative) { missing++; continue; }

    const srcPath = resolve(LEGACY_FILES, localRelative);
    const safeName = localRelative.replace(/[^a-zA-Z0-9._-]/g, "_");
    const destPath = resolve(OUTPUT_DIR, safeName);

    if (existsSync(destPath)) { skipped++; pathMap.set(rc.url, `ratecards/${safeName}`); continue; }

    if (existsSync(srcPath)) {
      mkdirSync(dirname(destPath), { recursive: true });
      copyFileSync(srcPath, destPath);
      copied++;
      pathMap.set(rc.url, `ratecards/${safeName}`);
    } else {
      missing++;
    }
  }

  console.log(`\n  ✓ Copied: ${copied}`);
  console.log(`  ○ Skipped (already exists): ${skipped}`);
  console.log(`  ✗ Missing source file: ${missing}`);

  for (let i = 0; i < media.length; i++) {
    const m = media[i];
    if (!m.ratecardFiles || m.ratecardFiles.length === 0) continue;
    m.ratecardFiles = m.ratecardFiles.map((rc) => ({
      ...rc,
      url: pathMap.get(rc.url) || rc.url,
    }));
  }

  writeFileSync(MEDIA_JSON, JSON.stringify(media, null, 2), "utf-8");
  console.log(`\n  ✓ Updated ${MEDIA_JSON}`);
  console.log("\nDone.");
}

main().catch((e) => { console.error(e); process.exit(1); });
