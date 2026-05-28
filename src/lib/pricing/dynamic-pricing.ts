import { prisma } from "@/lib/prisma";

export async function getAvailabilitySurge(
  assetId: string,
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const totalSlots = 100;

  const bookedCount = await prisma.booking.count({
    where: {
      mediaId: assetId,
      status: { in: ["CONFIRMED", "ACTIVE"] },
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
  });

  const utilization = totalSlots > 0 ? bookedCount / totalSlots : 0;

  if (utilization > 0.95) return 1.5;
  if (utilization > 0.90) return 1.35;
  if (utilization > 0.80) return 1.2;
  if (utilization < 0.50) return 0.95;
  return 1.0;
}
