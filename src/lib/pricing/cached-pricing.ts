import { PricingEngine } from "./pricing-engine";
import type { PriceRequest, PriceBreakdown } from "./types";

export class CachedPricingEngine {
  private engine: PricingEngine;
  private cache: Map<string, { data: PriceBreakdown; expiresAt: number }>;
  private defaultTTL: number;

  constructor(ttlSeconds = 300) {
    this.engine = new PricingEngine();
    this.cache = new Map();
    this.defaultTTL = ttlSeconds * 1000;
  }

  private getCacheKey(request: PriceRequest): string {
    const { assetId, startDate, endDate, quantity, promoCode, bundleId, buyerId } = request;
    return [
      "price",
      assetId,
      startDate.toISOString(),
      endDate.toISOString(),
      quantity,
      promoCode || "",
      bundleId || "",
      buyerId,
    ].join(":");
  }

  async calculatePrice(request: PriceRequest): Promise<PriceBreakdown> {
    const cacheKey = this.getCacheKey(request);
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return { ...cached.data, cacheKey };
    }

    const result = await this.engine.calculatePrice(request);
    const pricedWithKey = { ...result, cacheKey };

    this.cache.set(cacheKey, {
      data: pricedWithKey,
      expiresAt: Date.now() + this.defaultTTL,
    });

    return pricedWithKey;
  }

  async getPrice(request: PriceRequest): Promise<PriceBreakdown> {
    return this.calculatePrice(request);
  }

  invalidateCache(assetId: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(assetId)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}
