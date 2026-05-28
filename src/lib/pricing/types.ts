export interface PriceRequest {
  assetId: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
  buyerId: string;
  promoCode?: string;
  bundleId?: string;
}

export interface PricingFactors {
  baseRate: number;
  currency: string;
  pricingModel: string | null;
  rateCardId: string | null;
  rateCardName: string | null;
  seasonalMultiplier: number;
  dayOfWeekMultiplier: number;
  timeOfDayMultiplier: number;
  volumeDiscount: number;
  promoDiscount: number;
  availabilitySurge: number;
  platformFeePercent: number;
  taxPercent: number;
}

export interface PriceBreakdown {
  unitPriceBeforeDiscounts: number;
  unitPriceAfterDiscounts: number;
  lineTotal: number;
  subtotal: number;
  serviceFee: number;
  taxAmount: number;
  discountTotal: number;
  total: number;
  currency: string;
  factors: PricingFactors;
  pricingSnapshot: Record<string, unknown>;
  computedAt: string;
  expiresIn: number;
  cacheKey: string;
}

export interface RateCardResult {
  id: string | null;
  name: string | null;
  baseRate: number;
  currency: string;
  pricingModel: string | null;
  volumeDiscounts: VolumeDiscountTier[];
}

export interface VolumeDiscountTier {
  minQuantity: number;
  discountPercent: number;
}

export interface PromoValidationResult {
  valid: boolean;
  reason?: string;
  discountType: string | null;
  discountValue: number;
  discountAmount: number;
  promoId: string | null;
}

export interface SeasonalMultiplier {
  month: number;
  multiplier: number;
  label: string;
}

export const PLATFORM_FEE_PERCENT = 12.5;
export const DEFAULT_TAX_PERCENT = 0;
export const CACHE_TTL_SECONDS = 300;
