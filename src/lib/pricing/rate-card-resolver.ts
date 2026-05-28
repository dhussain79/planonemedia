import { prisma } from "@/lib/prisma";
import type { RateCardResult, VolumeDiscountTier } from "./types";

export async function resolveRateCard(
  assetId: string,
  startDate: Date,
  endDate: Date,
  requestedRateCardId?: string,
): Promise<RateCardResult> {
  const where: Record<string, unknown> = {
    mediaId: assetId,
    isActive: true,
    validFrom: { lte: endDate },
    ...(requestedRateCardId
      ? { id: requestedRateCardId }
      : { OR: [{ validTo: null }, { validTo: { gte: startDate } }] }),
  };

  const rateCards = await prisma.rateCard.findMany({
    where,
    orderBy: [
      { priority: "desc" },
      { validFrom: "desc" },
    ],
  });

  if (rateCards.length > 0) {
    const rc = rateCards[0];
    const volumeDiscounts: VolumeDiscountTier[] = (rc.volumeDiscounts as unknown as VolumeDiscountTier[]) || [];
    volumeDiscounts.sort((a, b) => a.minQuantity - b.minQuantity);

    return {
      id: rc.id,
      name: rc.name,
      baseRate: rc.baseRate,
      currency: rc.currency,
      pricingModel: rc.pricingModel,
      volumeDiscounts,
    };
  }

  const media = await prisma.media.findUnique({
    where: { id: assetId },
    select: { basePrice: true, currency: true, pricingModel: true },
  });

  return {
    id: null,
    name: null,
    baseRate: media?.basePrice ?? 0,
    currency: media?.currency ?? "SAR",
    pricingModel: media?.pricingModel ?? null,
    volumeDiscounts: [],
  };
}
