import { prisma } from "@/lib/prisma";
import type { Prisma } from "prisma-planone/client";

export const mediaRepository = {
  findBySlug: (slug: string) =>
    prisma.media.findFirst({
      where: { slug },
      include: { supplier: true, categories: { include: { category: true } } },
    }),

  findMany: (where: Prisma.MediaWhereInput, options?: { take?: number; skip?: number }) =>
    prisma.media.findMany({
      where,
      orderBy: { title: "asc" },
      take: options?.take ?? 20,
      skip: options?.skip ?? 0,
      include: { supplier: { select: { companyName: true } } },
    }),

  count: (where?: Prisma.MediaWhereInput) => prisma.media.count({ where }),
};
