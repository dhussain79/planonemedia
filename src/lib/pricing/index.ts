export interface PricingInput {
  baseRate: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
  seasonalMultiplier?: number;
  dayOfWeekMultiplier?: number;
  timeOfDayMultiplier?: number;
  volumeDiscountPercent?: number;
  promoDiscountPercent?: number;
  serviceFeePercent?: number;
  vatPercent?: number;
}

export interface PricingOutput {
  baseRate: number;
  seasonalAdjustment: number;
  dayOfWeekAdjustment: number;
  timeOfDayAdjustment: number;
  subtotal: number;
  volumeDiscount: number;
  promoDiscount: number;
  afterDiscounts: number;
  serviceFee: number;
  vat: number;
  total: number;
  currency: string;
  breakdown: Record<string, number>;
}

export function calculatePrice(input: PricingInput): PricingOutput {
  const seasonal = input.seasonalMultiplier ?? 1;
  const dayOfWeek = input.dayOfWeekMultiplier ?? 1;
  const timeOfDay = input.timeOfDayMultiplier ?? 1;

  const baseTotal = input.baseRate * input.quantity * seasonal * dayOfWeek * timeOfDay;
  const volumeDiscount = baseTotal * ((input.volumeDiscountPercent ?? 0) / 100);
  const afterVolume = baseTotal - volumeDiscount;
  const promoDiscount = afterVolume * ((input.promoDiscountPercent ?? 0) / 100);
  const afterDiscounts = afterVolume - promoDiscount;
  const serviceFee = afterDiscounts * ((input.serviceFeePercent ?? 12.5) / 100);
  const vat = (afterDiscounts + serviceFee) * ((input.vatPercent ?? 5) / 100);
  const total = afterDiscounts + serviceFee + vat;

  return {
    baseRate: input.baseRate,
    seasonalAdjustment: input.baseRate * (seasonal - 1),
    dayOfWeekAdjustment: input.baseRate * (dayOfWeek - 1),
    timeOfDayAdjustment: input.baseRate * (timeOfDay - 1),
    subtotal: baseTotal,
    volumeDiscount,
    promoDiscount,
    afterDiscounts,
    serviceFee,
    vat,
    total,
    currency: input.currency,
    breakdown: {
      base: input.baseRate,
      quantity: input.quantity,
      seasonal,
      dayOfWeek,
      timeOfDay,
      volumeDiscountPercent: input.volumeDiscountPercent ?? 0,
      promoDiscountPercent: input.promoDiscountPercent ?? 0,
      serviceFeePercent: input.serviceFeePercent ?? 12.5,
      vatPercent: input.vatPercent ?? 5,
    },
  };
}
