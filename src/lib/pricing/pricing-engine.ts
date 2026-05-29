import { prisma } from "@/lib/prisma";
import { resolveRateCard } from "./rate-card-resolver";
import { validatePromoCode } from "./promo-validator";
import { getAvailabilitySurge } from "./dynamic-pricing";
import type {
  PriceRequest,
  PriceBreakdown,
  PricingFactors,
  VolumeDiscountTier,
} from "./types";

const SEASONAL_MULTIPLIERS: Record<number, number> = {
  1: 0.9,
  2: 0.9,
  3: 1.0,
  4: 1.0,
  5: 1.1,
  6: 1.2,
  7: 1.3,
  8: 1.2,
  9: 1.0,
  10: 1.1,
  11: 1.0,
  12: 1.15,
};

const DAY_OF_WEEK_MULTIPLIERS: Record<number, number> = {
  0: 1.15,
  1: 0.95,
  2: 1.0,
  3: 1.0,
  4: 1.0,
  5: 1.1,
  6: 1.2,
};

const TIME_OF_DAY_MULTIPLIERS: Record<string, number> = {
  morning: 1.1,
  afternoon: 1.0,
  evening: 1.15,
  night: 0.85,
};

function getTimeOfDay(date: Date): string {
  const h = date.getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

function getSeasonalMultiplier(date: Date): number {
  return SEASONAL_MULTIPLIERS[date.getMonth() + 1] ?? 1.0;
}

function getDayOfWeekMultiplier(date: Date): number {
  return DAY_OF_WEEK_MULTIPLIERS[date.getDay()] ?? 1.0;
}

function getTimeOfDayMultiplier(date: Date): number {
  return TIME_OF_DAY_MULTIPLIERS[getTimeOfDay(date)] ?? 1.0;
}

function getVolumeDiscount(quantity: number, tiers: VolumeDiscountTier[]): number {
  let discount = 0;
  for (const tier of tiers) {
    if (quantity >= tier.minQuantity) {
      discount = tier.discountPercent;
    }
  }
  return discount;
}

function getDurationDays(start: Date, end: Date): number {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function round(value: number, decimals = 2): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

export class PricingEngine {
  async calculatePrice(request: PriceRequest): Promise<PriceBreakdown> {
    const { assetId, startDate, endDate, quantity, buyerId, promoCode } = request;

    const rateCard = await resolveRateCard(assetId, startDate, endDate);
    const surge = await getAvailabilitySurge(assetId, startDate, endDate);

    const seasonalMul = getSeasonalMultiplier(startDate);
    const dayOfWeekMul = getDayOfWeekMultiplier(startDate);
    const timeOfDayMul = getTimeOfDayMultiplier(startDate);

    const unitPriceBefore = round(rateCard.baseRate * seasonalMul * dayOfWeekMul * timeOfDayMul * surge);

    const volumeDiscountPct = getVolumeDiscount(quantity, rateCard.volumeDiscounts);
    const volumeDiscountAmount = round(unitPriceBefore * (volumeDiscountPct / 100));
    const afterVolume = round(unitPriceBefore - volumeDiscountAmount);

    const subtotal = round(afterVolume * quantity * getDurationDays(startDate, endDate));

    let promoDiscountAmount = 0;
    let promoId: string | null = null;
    let promoDiscountType: string | null = null;
    let promoDiscountValue = 0;

    if (promoCode) {
      const promoResult = await validatePromoCode(promoCode, buyerId, assetId, subtotal);
      if (promoResult.valid) {
        promoDiscountAmount = round(Math.min(promoResult.discountAmount, subtotal));
        promoId = promoResult.promoId;
        promoDiscountType = promoResult.discountType;
        promoDiscountValue = promoResult.discountValue;
      }
    }

    const afterPromo = round(subtotal - promoDiscountAmount);
    const platformFee = round(afterPromo * 0.125);
    const taxAmount = 0;
    const total = round(afterPromo + platformFee + taxAmount);

    const unitPriceAfter = round(afterPromo / (quantity * getDurationDays(startDate, endDate)));

    const now = new Date();
    const cacheKey = `price:${assetId}:${startDate.toISOString()}:${endDate.toISOString()}:${quantity}:${promoCode || "none"}`;

    const factors: PricingFactors = {
      baseRate: rateCard.baseRate,
      currency: rateCard.currency,
      pricingModel: rateCard.pricingModel,
      rateCardId: rateCard.id,
      rateCardName: rateCard.name,
      seasonalMultiplier: seasonalMul,
      dayOfWeekMultiplier: dayOfWeekMul,
      timeOfDayMultiplier: timeOfDayMul,
      volumeDiscount: volumeDiscountPct,
      promoDiscount: promoDiscountValue,
      availabilitySurge: surge,
      platformFeePercent: 12.5,
      taxPercent: 0,
    };

    return {
      unitPriceBeforeDiscounts: unitPriceBefore,
      unitPriceAfterDiscounts: unitPriceAfter,
      lineTotal: round(unitPriceBefore * quantity * getDurationDays(startDate, endDate)),
      subtotal,
      serviceFee: platformFee,
      taxAmount,
      discountTotal: round(volumeDiscountAmount + promoDiscountAmount),
      total,
      currency: rateCard.currency,
      factors,
      pricingSnapshot: {
        rateCardId: rateCard.id,
        promoId,
        promoDiscountType,
        volumeDiscountPct,
        surge,
        seasonalMul,
        dayOfWeekMul,
        timeOfDayMul,
        durationDays: getDurationDays(startDate, endDate),
      },
      computedAt: now.toISOString(),
      expiresIn: 300,
      cacheKey,
    };
  }
}
