import { prisma } from "@/lib/prisma";

export const supplierRepository = {
  findById: (id: string) =>
    prisma.supplier.findUnique({
      where: { id },
      include: { media: true, contacts: true },
    }),

  findByName: (name: string) =>
    prisma.supplier.findFirst({
      where: { companyName: { contains: name, mode: "insensitive" } },
      include: { media: true, contacts: true },
    }),

  search: (query: string, limit = 20) =>
    prisma.supplier.findMany({
      where: { companyName: { contains: query, mode: "insensitive" } },
      take: limit,
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true, status: true },
    }),
};
