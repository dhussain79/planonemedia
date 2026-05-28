import { prisma } from "@/lib/prisma";

export async function getSupplierByName(name: string) {
  return prisma.supplier.findFirst({
    where: { companyName: { contains: name, mode: "insensitive" } },
    include: {
      media: { orderBy: { title: "asc" } },
      contacts: true,
    },
  });
}

export async function searchSuppliers(query: string, limit = 20) {
  return prisma.supplier.findMany({
    where: { companyName: { contains: query, mode: "insensitive" } },
    take: limit,
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true, status: true },
  });
}
