#!/usr/bin/env node

import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SQL_FILE = path.resolve('C:/Users/macro/OneDrive/Click/Opencode/foldedup/backup/planonem_foldedup.sql');
const OUTPUT_DIR = path.resolve(PROJECT_ROOT, 'scripts', 'output');

const TARGET_TABLES = new Set([
  'drup_node',
  'drup_field_data_body',
  'drup_field_data_field_supplier',
  'drup_field_data_field_email',
  'drup_field_data_field_phone',
  'drup_field_data_field_fax',
  'drup_field_data_field_specs',
  'drup_field_data_field_ratecard',
  'drup_field_data_field_cover_or_logo',
  'drup_field_data_field_star',
  'drup_field_data_taxonomy_vocabulary_1',
  'drup_field_data_taxonomy_vocabulary_3',
  'drup_field_data_taxonomy_vocabulary_4',
  'drup_field_data_taxonomy_vocabulary_5',
  'drup_taxonomy_term_data',
  'drup_file_managed',
]);

const VOCAB_TO_CATEGORY_TYPE = {
  1: 'PROFILE',
  3: 'REGION',
  4: 'MEDIA_TYPE',
  5: 'CATEGORY',
};

const REQUIRED_MEDIA_FIELDS = ['title', 'supplierName'];
const REQUIRED_SUPPLIER_FIELDS = ['companyName'];
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_LABEL_RE = /(?:Tel(?:ephone)?|Phone|Mob(?:ile)?)\s*[:.]?\s*([\d\s+\-().]{6,25})/i;
const FAX_LABEL_RE = /(?:Fax|Facsimile)\s*[:.]?\s*([\d\s+\-().]{6,25})/i;
const URL_RE = /(?:https?:\/\/|www\.)[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s"<]*)?/;

function normalizePhone(val) {
  if (!val) return val;
  val = val.replace(/^[Ff]\s*/, '+').trim();
  val = val.replace(/\s{2,}/g, ' ');
  return val || null;
}

const MEDIA_TYPE_ENUM_MAP = {
  'newspaper': 'NEWSPAPER',
  'magazine': 'MAGAZINE',
  'tv': 'TV',
  'radio': 'RADIO',
  'outdoor': 'OUTDOOR',
  'online': 'ONLINE',
  'cinema': 'CINEMA',
};

function mediaTypeToEnum(name) {
  if (!name) return null;
  return MEDIA_TYPE_ENUM_MAP[name.toLowerCase().trim()] ?? 'OTHER';
}

function cleanText(s) {
  if (!s) return s;
  let r = s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\t/g, ' ');
  // Orphan "rn" from \r\n that lost the backslash — catch when it's clearly an artifact
  r = r.replace(/(?:^|(?<=[\s,;.!?(-]))rn|rn(?=[\s,;.!?)-]|$|[A-Z])/g, ' ')
       .replace(/(?<=[^\w])rn(?=[^\w]|$)/g, ' ');
  r = r.replace(/\s{3,}/g, '  ').trim();
  return r;
}

function slugify(s) {
  if (!s) return null;
  return s
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200) || null;
}

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const extractAll = args.includes('--all');

let sampleLimit = null;
if (!extractAll) {
  const sampleIdx = args.indexOf('--sample');
  if (sampleIdx !== -1 && args[sampleIdx + 1]) {
    sampleLimit = parseInt(args[sampleIdx + 1], 10);
  }
}

run();

async function run() {
  console.log(`\n\x1b[36m═══════════════════════════════════════════════\x1b[0m`);
  console.log(`\x1b[36m  PlanOneMedia — Legacy Drupal 7 Data Extractor\x1b[0m`);
  console.log(`\x1b[36m═══════════════════════════════════════════════\x1b[0m\n`);
  console.log(`  Input:  ${SQL_FILE}`);
  console.log(`  Output: ${OUTPUT_DIR}`);
  console.log(`  Mode:   ${isDryRun ? '\x1b[33mDRY RUN (no files written)\x1b[0m' : '\x1b[32mNORMAL\x1b[0m'}`);
  if (sampleLimit) console.log(`  Sample: ${sampleLimit} records max`);
  console.log();

  const data = {
    nodes: new Map(),
    bodies: new Map(),
    fieldSuppliers: new Map(),
    fieldEmails: new Map(),
    fieldPhones: new Map(),
    fieldFaxes: new Map(),
    fieldRatecards: new Map(),
    fieldLogos: new Map(),
    fieldStars: new Map(),
    taxVoc1: new Map(),
    taxVoc3: new Map(),
    taxVoc4: new Map(),
    taxVoc5: new Map(),
    taxonomyTerms: new Map(),
    files: new Map(),
  };

  console.log(`  \x1b[90mParsing SQL dump...\x1b[0m`);
  await parseSqlDump(data);

  const mediaNodes = [];
  const supplierNodes = [];
  for (const [nid, node] of data.nodes) {
    if (node.type === 'medium') mediaNodes.push(node);
    else if (node.type === 'supplier') supplierNodes.push(node);
  }
  mediaNodes.sort((a, b) => a.nid - b.nid);
  supplierNodes.sort((a, b) => a.nid - b.nid);

  console.log(`  \x1b[90mParsed ${data.taxonomyTerms.size} taxonomy terms, ${data.files.size} files\x1b[0m`);
  console.log(`  \x1b[90mFound ${mediaNodes.length} medium nodes, ${supplierNodes.length} supplier nodes\x1b[0m\n`);

  const sampleCap = extractAll ? Infinity : 10;
  const limit = sampleLimit || Infinity;
  const sampleMedia = mediaNodes.slice(0, Math.min(limit, sampleCap));
  const sampleSuppliers = supplierNodes.slice(0, Math.min(limit, sampleCap));

  const supplierLegacyIds = new Set(sampleSuppliers.map(s => s.nid));

  const categories = buildCategories(data);
  const suppliers = sampleSuppliers.map(n => normalizeSupplier(n, data));

  // Deduplicate company names so the seed can look up by name
  const nameCount = new Map();
  for (const s of suppliers) {
    nameCount.set(s.companyName, (nameCount.get(s.companyName) || 0) + 1);
  }
  const nameRemap = new Map();  // original → deduplicated
  const nameCounter = new Map();
  for (const s of suppliers) {
    if (nameCount.get(s.companyName) > 1) {
      const c = (nameCounter.get(s.companyName) || 0) + 1;
      nameCounter.set(s.companyName, c);
      if (c === 1) nameRemap.set(s.companyName, s.companyName);
      else {
        nameRemap.set(s.companyName, `${s.companyName} (${c})`);
        s.companyName = `${s.companyName} (${c})`;
      }
    }
  }

  const media = sampleMedia.map(n => normalizeMedia(n, data, supplierLegacyIds));
  // Fix media supplierName to match deduplicated supplier names
  for (const m of media) {
    if (m.supplierName && nameRemap.has(m.supplierName)) {
      m.supplierName = nameRemap.get(m.supplierName);
    }
  }
  // Deduplicate slugs
  const slugCount = new Map();
  for (const m of media) {
    if (!m.slug) continue;
    const count = slugCount.get(m.slug) ?? 0;
    slugCount.set(m.slug, count + 1);
    if (count > 0) m.slug = `${m.slug}-${count}`;
  }

  // Quality reports
  const mediaReport = generateQualityReport(media, REQUIRED_MEDIA_FIELDS, 'media');
  const supplierReport = generateQualityReport(suppliers, REQUIRED_SUPPLIER_FIELDS, 'supplier');

  console.log(`\x1b[36m  ─── QUALITY REPORT — MEDIA ───\x1b[0m`);
  printReport(mediaReport);
  console.log(`\x1b[36m  ─── QUALITY REPORT — SUPPLIERS ───\x1b[0m`);
  printReport(supplierReport);

  console.log(`\n\x1b[36m  ─── PREVIEW ───\x1b[0m\n`);
  console.log(`  \x1b[33mCategories:\x1b[0m ${categories.length} total`);
  const byType = {};
  for (const c of categories) {
    byType[c.type] = (byType[c.type] || 0) + 1;
  }
  for (const [t, n] of Object.entries(byType)) {
    console.log(`    ${t}: ${n}`);
  }

  console.log(`\n  \x1b[33mSuppliers (first 3):\x1b[0m`);
  for (const s of suppliers.slice(0, 3)) {
    console.log(`    ${s.companyName}`);
    console.log(`        status: ${s.status}`);
  }

  console.log(`\n  \x1b[33mMedia (first 3):\x1b[0m`);
  for (const m of media.slice(0, 3)) {
    console.log(`    ${m.title}`);
    console.log(`        type: ${m.mediaType ?? '\x1b[90m—\x1b[0m'}, region: ${m.region ?? '\x1b[90m—\x1b[0m'}`);
    console.log(`        supplier: ${m.supplierName}, categories: ${m.categoryNames.length}`);
  }

  if (!isDryRun) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'categories.json'), JSON.stringify(categories, null, 2), 'utf-8');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'suppliers.json'), JSON.stringify(suppliers, null, 2), 'utf-8');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'media.json'), JSON.stringify(media, null, 2), 'utf-8');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'quality-report.json'), JSON.stringify({ media: mediaReport, suppliers: supplierReport }, null, 2), 'utf-8');
    console.log(`\n  \x1b[32m✓ Output written to ${OUTPUT_DIR}/\x1b[0m`);
  } else {
    console.log(`\n  \x1b[33m⚠ Dry-run — no files written.\x1b[0m`);
  }

  console.log(`\n\x1b[36m═══════════════════════════════════════════════\x1b[0m\n`);
}

// ── Category builder ──────────────────────────────────────────

function buildCategories(data) {
  const seen = new Set();
  const result = [];
  for (const [tid, term] of data.taxonomyTerms) {
    const type = VOCAB_TO_CATEGORY_TYPE[term.vid];
    if (!type) continue;
    const key = `${type}::${term.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      name: term.name,
      type,
    });
  }
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

function extractContactFromText(text) {
  if (!text) return {};
  const out = {};
  const m = text.match(EMAIL_RE);
  if (m) out.email = m[0];
  const pm = text.match(PHONE_LABEL_RE);
  if (pm) out.phone = pm[1].trim();
  const fm = text.match(FAX_LABEL_RE);
  if (fm) out.fax = fm[1].trim();
  return out;
}

// ── Supplier normalizer ───────────────────────────────────────

function normalizeSupplier(node, data) {
  const nid = node.nid;
  const body = getField(data.bodies, nid);
  const emailRow = getField(data.fieldEmails, nid);
  const phoneRow = getField(data.fieldPhones, nid);
  const faxRow = getField(data.fieldFaxes, nid);
  const logo = getField(data.fieldLogos, nid);

  let description = body ? body.body_value : null;
  const extracted = extractContactFromText(description || '');

  const structuredEmail = emailRow?.field_email_email || null;
  const structuredPhone = normalizePhone(phoneRow?.field_phone_value || null);
  const structuredFax = normalizePhone(faxRow?.field_fax_value || null);

  let firstUrl = null;
  if (description) {
    const allUrls = description.match(new RegExp(URL_RE.source, 'g'));
    if (allUrls) {
      firstUrl = allUrls.find(u => !/\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(u) && !/\/sites\/default\/files\//.test(u)) || null;
    }
  }

  const result = {
    companyName: node.title,
    tradingName: null,
    crn: null,
    vatNumber: null,
    billingAddress: null,
    website: firstUrl || null,
    email: structuredEmail || extracted.email || null,
    phone: structuredPhone || extracted.phone || null,
    fax: structuredFax || extracted.fax || null,
    logo: logo ? getFileUrl(data, logo.field_cover_or_logo_fid) : null,
    status: 'PENDING_VERIFICATION',
    description: cleanText(description),
  };

  result._quality = assessCompleteness(result, REQUIRED_SUPPLIER_FIELDS);
  return result;
}

// ── Media normalizer ──────────────────────────────────────────

function normalizeMedia(node, data, validSupplierIds) {
  const nid = node.nid;
  const body = getField(data.bodies, nid);
  const supplierField = getField(data.fieldSuppliers, nid);
  const star = getField(data.fieldStars, nid);
  const ratecards = getFieldArray(data.fieldRatecards, nid);
  const logo = getField(data.fieldLogos, nid);

  const tax4 = getField(data.taxVoc4, nid);
  const tax5 = getField(data.taxVoc5, nid);
  const tax1 = getField(data.taxVoc1, nid);
  const tax3 = getField(data.taxVoc3, nid);

  const taxTids = [];
  if (tax4) taxTids.push(tax4.taxonomy_vocabulary_4_tid);
  if (tax5) taxTids.push(tax5.taxonomy_vocabulary_5_tid);
  if (tax1) taxTids.push(tax1.taxonomy_vocabulary_1_tid);
  if (tax3) taxTids.push(tax3.taxonomy_vocabulary_3_tid);

  let supplierName = null;
  if (supplierField) {
    const supNode = data.nodes.get(supplierField.field_supplier_nid);
    if (supNode && validSupplierIds.has(supplierField.field_supplier_nid)) {
      supplierName = supNode.title;
    }
  }

  const result = {
    title: node.title,
    slug: slugify(node.title),
    mediaType: tax4 ? mediaTypeToEnum(getTaxonomyName(data, tax4.taxonomy_vocabulary_4_tid)) : null,
    category: tax5 ? getTaxonomyName(data, tax5.taxonomy_vocabulary_5_tid) : null,
    profile: tax1 ? getTaxonomyName(data, tax1.taxonomy_vocabulary_1_tid) : null,
    region: tax3 ? getTaxonomyName(data, tax3.taxonomy_vocabulary_3_tid) : null,
    description: cleanText(body ? body.body_value : null),
    summary: cleanText(body ? body.body_summary : null),
    ratecardFiles: ratecards.map(r => ({
      fid: r.field_ratecard_fid,
      url: getFileUrl(data, r.field_ratecard_fid),
      width: r.field_ratecard_width,
      height: r.field_ratecard_height,
    })),
    logoUrl: logo ? getFileUrl(data, logo.field_cover_or_logo_fid) : null,
    starRating: star ? star.field_star_rating : null,
    supplierName,
    categoryNames: taxTids.filter(t => t != null).map(t => {
      const term = data.taxonomyTerms.get(t);
      const type = VOCAB_TO_CATEGORY_TYPE[term?.vid];
      return type ? `${type}::${term.name}` : null;
    }).filter(Boolean),
    status: node.status === 1 ? 'published' : 'unpublished',
  };

  result._quality = assessCompleteness(result, REQUIRED_MEDIA_FIELDS);
  return result;
}

// ── SQL Parser (unchanged from earlier version) ────────────────

async function parseSqlDump(data) {
  const fileStream = fs.createReadStream(SQL_FILE, { encoding: 'utf-8', highWaterMark: 1024 * 1024 });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let currentTable = null;
  let currentColumns = null;
  let inValues = false;
  let valueBuffer = '';

  for await (const rawLine of rl) {
    const trimmed = rawLine.trimEnd();

    if (inValues) {
      valueBuffer += trimmed;
      if (valueBuffer.endsWith(';')) {
        const valuesStr = valueBuffer.slice(0, -1).trim();
        if (valuesStr) {
          const rows = parseValues(valuesStr, currentColumns.length);
          for (const row of rows) ingestRow(data, currentTable, currentColumns, row);
        }
        inValues = false; currentTable = null; currentColumns = null; valueBuffer = '';
      }
      continue;
    }

    const insertMatch = trimmed.match(/^INSERT INTO `(\w+)`\s*\((.*?)\)\s*VALUES\s*$/s);
    if (insertMatch) {
      currentTable = insertMatch[1];
      if (!TARGET_TABLES.has(currentTable)) { currentTable = null; continue; }
      currentColumns = parseColumns(insertMatch[2]);
      inValues = true; valueBuffer = '';
      continue;
    }

    const singleMatch = trimmed.match(/^INSERT INTO `(\w+)`\s*\((.*?)\)\s*VALUES\s*(.*);$/s);
    if (singleMatch) {
      currentTable = singleMatch[1];
      if (!TARGET_TABLES.has(currentTable)) continue;
      currentColumns = parseColumns(singleMatch[2]);
      const rows = parseValues(singleMatch[3], currentColumns.length);
      for (const row of rows) ingestRow(data, currentTable, currentColumns, row);
      currentTable = null; currentColumns = null;
      continue;
    }

    const altMatch = trimmed.match(/^INSERT INTO `(\w+)`\s*\((.*?)\)\s*VALUES\s*\((.*)\);$/s);
    if (altMatch) {
      currentTable = altMatch[1];
      if (!TARGET_TABLES.has(currentTable)) continue;
      currentColumns = parseColumns(altMatch[2]);
      const row = parseValueRow(altMatch[3], currentColumns.length);
      if (row) ingestRow(data, currentTable, currentColumns, row);
      currentTable = null; currentColumns = null;
      continue;
    }
  }
}

function parseColumns(colStr) {
  return colStr.split(',').map(c => c.trim().replace(/^`|`$/g, ''));
}

function parseValues(valuesStr, expectedCount) {
  const rows = []; let i = 0;
  while (i < valuesStr.length) {
    const start = valuesStr.indexOf('(', i);
    if (start === -1) break;
    let depth = 0, inStr = false, escaped = false, end = start;
    for (let j = start; j < valuesStr.length; j++) {
      const ch = valuesStr[j];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\' && inStr) { escaped = true; continue; }
      if (ch === "'" && !escaped) { inStr = !inStr; continue; }
      if (!inStr) {
        if (ch === '(') depth++;
        if (ch === ')') { depth--; if (depth === 0) { end = j; break; } }
      }
    }
    const rowStr = valuesStr.slice(start + 1, end);
    const row = parseValueRow(rowStr, expectedCount);
    if (row) rows.push(row);
    i = end + 1;
    while (i < valuesStr.length && (valuesStr[i] === ',' || valuesStr[i] === ' ' || valuesStr[i] === '\n' || valuesStr[i] === '\r')) i++;
  }
  return rows;
}

function parseValueRow(rowStr, expectedCount) {
  const values = [];
  let i = 0;
  let current = '';

  while (i < rowStr.length) {
    const ch = rowStr[i];

    if (ch === "'") {
      let str = '';
      i++;
      while (i < rowStr.length) {
        if (rowStr[i] === '\\' && i + 1 < rowStr.length) {
          const next = rowStr[i + 1];
          if (next === 'r') str += '\r';
          else if (next === 'n') str += '\n';
          else if (next === 't') str += '\t';
          else if (next === '\\') str += '\\';
          else str += next;
          i += 2;
          continue;
        }
        if (rowStr[i] === "'") {
          if (i + 1 < rowStr.length && rowStr[i + 1] === "'") {
            str += "'";
            i += 2;
            continue;
          }
          i++;
          break;
        }
        str += rowStr[i];
        i++;
      }
      values.push(str);
    } else if (ch === ',' || ch === ')') {
      const trimmed = current.trim();
      if (trimmed === 'NULL' || trimmed === '') {
        values.push(null);
      } else if (/^\d+(\.\d+)?$/.test(trimmed)) {
        values.push(trimmed.includes('.') ? parseFloat(trimmed) : parseInt(trimmed, 10));
      } else {
        values.push(trimmed);
      }
      current = '';
      if (ch === ')') break;
    } else if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
      current += ch;
    } else {
      current += ch;
    }
    i++;
  }

  if (current.trim()) {
    const trimmed = current.trim();
    if (trimmed === 'NULL') {
      values.push(null);
    } else if (/^\d+(\.\d+)?$/.test(trimmed)) {
      values.push(trimmed.includes('.') ? parseFloat(trimmed) : parseInt(trimmed, 10));
    } else {
      values.push(trimmed);
    }
  }

  return values;
}

function ingestRow(data, table, cols, row) {
  const obj = {};
  for (let i = 0; i < cols.length && i < row.length; i++) obj[cols[i]] = row[i];
  switch (table) {
    case 'drup_node': data.nodes.set(obj.nid, obj); break;
    case 'drup_field_data_body': data.bodies.set(obj.entity_id, obj); break;
    case 'drup_field_data_field_supplier': data.fieldSuppliers.set(obj.entity_id, obj); break;
    case 'drup_field_data_field_email': data.fieldEmails.set(obj.entity_id, obj); break;
    case 'drup_field_data_field_phone': data.fieldPhones.set(obj.entity_id, obj); break;
    case 'drup_field_data_field_fax': data.fieldFaxes.set(obj.entity_id, obj); break;
    case 'drup_field_data_field_ratecard': appendToMapArray(data.fieldRatecards, obj.entity_id, obj); break;
    case 'drup_field_data_field_cover_or_logo': data.fieldLogos.set(obj.entity_id, obj); break;
    case 'drup_field_data_field_star': data.fieldStars.set(obj.entity_id, obj); break;
    case 'drup_field_data_taxonomy_vocabulary_1': data.taxVoc1.set(obj.entity_id, obj); break;
    case 'drup_field_data_taxonomy_vocabulary_3': data.taxVoc3.set(obj.entity_id, obj); break;
    case 'drup_field_data_taxonomy_vocabulary_4': data.taxVoc4.set(obj.entity_id, obj); break;
    case 'drup_field_data_taxonomy_vocabulary_5': data.taxVoc5.set(obj.entity_id, obj); break;
    case 'drup_taxonomy_term_data': data.taxonomyTerms.set(obj.tid, obj); break;
    case 'drup_file_managed': data.files.set(obj.fid, obj); break;
  }
}

function appendToMapArray(map, key, val) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(val);
}

function getField(map, entityId) { return map.get(entityId) || null; }
function getFieldArray(map, entityId) { return map.get(entityId) || []; }

function getTaxonomyName(data, tid) {
  if (!tid) return null;
  const term = data.taxonomyTerms.get(tid);
  return term ? term.name : null;
}

function getFileUrl(data, fid) {
  if (!fid) return null;
  const file = data.files.get(fid);
  return file ? file.uri : null;
}

// ── Quality helpers ───────────────────────────────────────────

function assessCompleteness(record, requiredFields) {
  const missing = [];
  for (const field of requiredFields) {
    if (record[field] === null || record[field] === undefined || record[field] === '') missing.push(field);
  }
  const total = requiredFields.length;
  const filled = total - missing.length;
  return { completeness: total > 0 ? Math.round((filled / total) * 100) : 100, missing, filled, total };
}

function generateQualityReport(records, requiredFields, label) {
  const total = records.length;
  const complete = records.filter(r => r._quality.missing.length === 0).length;
  const partial = records.filter(r => r._quality.missing.length > 0 && r._quality.missing.length < requiredFields.length).length;
  const empty = records.filter(r => r._quality.missing.length === requiredFields.length).length;

  const fieldStats = {};
  for (const field of requiredFields) {
    fieldStats[field] = { present: 0, missing: 0 };
  }
  for (const r of records) {
    for (const m of r._quality.missing) {
      if (fieldStats[m]) fieldStats[m].missing++;
    }
  }
  for (const field of requiredFields) {
    fieldStats[field].present = total - fieldStats[field].missing;
    fieldStats[field].fillRate = total > 0 ? Math.round((fieldStats[field].present / total) * 100) : 0;
  }

  const avgCompleteness = total > 0 ? Math.round(records.reduce((sum, r) => sum + r._quality.completeness, 0) / total) : 0;
  return { label, total, complete, partial, empty, avgCompleteness, fieldStats };
}

function printReport(report) {
  const pct = (n) => `${n}%`;
  console.log(`    Total records:     ${report.total}`);
  console.log(`    Complete:          ${report.complete} (${pct(report.total ? Math.round(report.complete/report.total*100) : 0)})`);
  console.log(`    Partial:           ${report.partial}`);
  console.log(`    Empty:             ${report.empty}`);
  console.log(`    Avg completeness:  ${pct(report.avgCompleteness)}`);
  console.log(`    Field fill rates:`);
  for (const [field, stats] of Object.entries(report.fieldStats)) {
    const icon = stats.fillRate === 100 ? '\x1b[32m✓\x1b[0m' : stats.fillRate >= 50 ? '\x1b[33m⚠\x1b[0m' : '\x1b[31m✗\x1b[0m';
    console.log(`      ${icon} ${field}: ${stats.present}/${stats.present + stats.missing} (${pct(stats.fillRate)})`);
  }
  console.log();
}
