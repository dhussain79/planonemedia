import { prisma } from "@/lib/prisma";
import type { PromoValidationResult } from "./types";

export async function validatePromoCode(
  code: string,
  buyerId: string,
  assetId: string,
  currentSpend: number,
): Promise<PromoValidationResult> {
  const promo = await prisma.promoCode.findUnique({
    where: { code },
  });

  if (!promo) {
    return { valid: false, reason: "Promo code not found", discountType: null, discountValue: 0, discountAmount: 0, promoId: null };
  }

  if (!promo.isActive) {
    return { valid: false, reason: "Promo code is inactive", discountType: null, discountValue: 0, discountAmount: 0, promoId: null };
  }

  const now = new Date();
  if (now < promo.validFrom) {
    return { valid: false, reason: "Promo code is not yet valid", discountType: null, discountValue: 0, discountAmount: 0, promoId: null };
  }

  if (promo.validTo && now > promo.validTo) {
    return { valid: false, reason: "Promo code has expired", discountType: null, discountValue: 0, discountAmount: 0, promoId: null };
  }

  if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
    return { valid: false, reason: "Promo code usage limit reached", discountType: null, discountValue: 0, discountAmount: 0, promoId: null };
  }

  const usageByUser = await prisma.promoCode.findUnique({
    where: { id: promo.id },
  });

  const userBookingsWithPromo = await prisma.booking.count({
    where: {
      buyerId,
      // Note: in a real system you'd track promo usage per user in a separate table
      // For now we rely on the perUserLimit from the promo code
    },
  });

  if (promo.perUserLimit > 0 && userBookingsWithPromo >= promo.perUserLimit) {
    return { valid: false, reason: "Per-user limit reached for this promo code", discountType: null, discountValue: 0, discountAmount: 0, promoId: null };
  }

  if (promo.minSpend > 0 && currentSpend < promo.minSpend) {
    return { valid: false, reason: `Minimum spend of ${promo.minSpend} not met`, discountType: null, discountValue: 0, discountAmount: 0, promoId: null };
  }

  if (promo.assetTypes) {
    const media = await prisma.media.findUnique({ where: { id: assetId }, select: { mediaType: true } });
    const allowedTypes = promo.assetTypes as string[];
    if (media?.mediaType && allowedTypes.length > 0 && !allowedTypes.includes(media.mediaType)) {
      return { valid: false, reason: "Promo code not applicable for this asset type", discountType: null, discountValue: 0, discountAmount: 0, promoId: null };
    }
  }

  if (promo.sellerIds) {
    const media = await prisma.media.findUnique({ where: { id: assetId }, select: { supplierId: true } });
    const allowedSellers = promo.sellerIds as string[];
    if (media?.supplierId && allowedSellers.length > 0 && !allowedSellers.includes(media.supplierId)) {
      return { valid: false, reason: "Promo code not applicable for this seller", discountType: null, discountValue: 0, discountAmount: 0, promoId: null };
    }
  }

  let discountAmount = 0;
  if (promo.discountType === "PERCENTAGE") {
    discountAmount = currentSpend * (promo.discountValue / 100);
    if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
      discountAmount = promo.maxDiscount;
    }
  } else {
    discountAmount = promo.discountValue;
  }

  return {
    valid: true,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discountAmount,
    promoId: promo.id,
  };
}
