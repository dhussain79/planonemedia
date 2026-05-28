import { NextRequest, NextResponse } from "next/server";
import { getMeilisearch, MEDIA_INDEX } from "@/lib/search/client";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  const type = req.nextUrl.searchParams.get("type") || undefined;
  const region = req.nextUrl.searchParams.get("region") || undefined;
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "20", 10), 50);

  const ms = getMeilisearch();
  if (ms) {
    try {
      const index = ms.index(MEDIA_INDEX);
      const filter: string[] = [];
      if (type) filter.push(`mediaType = "${type}"`);
      if (region) filter.push(`region = "${region}"`);

      const results = await index.search(q, {
        limit,
        filter: filter.length > 0 ? filter : undefined,
        attributesToHighlight: ["title"],
        attributesToCrop: ["description"],
        cropLength: 80,
      });

      return NextResponse.json({
        hits: results.hits,
        query: q,
        processingTimeMs: results.processingTimeMs,
        estimatedTotalHits: results.estimatedTotalHits,
        source: "meilisearch",
      });
    } catch {
      // Meilisearch unavailable, fall through to Prisma
    }
  }

  // Fallback: Prisma ilike search
  const where: Record<string, unknown> = { status: "published" };
  if (q) where.title = { contains: q, mode: "insensitive" };
  if (type) where.mediaType = type;
  if (region) where.region = region;

  const media = await prisma.media.findMany({
    where,
    take: limit,
    orderBy: { title: "asc" },
    include: {
      supplier: { select: { companyName: true } },
      categories: { include: { category: { select: { name: true } } } },
    },
  });

  const hits = media.map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    mediaType: m.mediaType,
    region: m.region,
    description: m.description,
    starRating: m.starRating,
    supplierName: m.supplier?.companyName ?? null,
    categoryNames: m.categories.map((mc) => mc.category.name),
    status: m.status,
  }));

  return NextResponse.json({
    hits,
    query: q,
    processingTimeMs: 0,
    estimatedTotalHits: hits.length,
    source: "prisma",
  });
}
