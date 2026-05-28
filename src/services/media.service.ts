import { prisma } from "@/lib/prisma";

export async function getMediaBySlug(slug: string) {
  return prisma.media.findFirst({
    where: { slug },
    include: {
      supplier: true,
      categories: { include: { category: true } },
    },
  });
}

export async function listMedia(filters: {
  type?: string;
  region?: string;
  query?: string;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = { status: "published" };
  if (filters.type) where.mediaType = filters.type;
  if (filters.region) where.region = filters.region;
  if (filters.query) where.title = { contains: filters.query, mode: "insensitive" };

  return prisma.media.findMany({
    where,
    orderBy: { title: "asc" },
    take: filters.limit ?? 20,
    skip: filters.offset ?? 0,
    include: { supplier: { select: { companyName: true } } },
  });
}
