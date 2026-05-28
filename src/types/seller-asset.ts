import { z } from "zod";

export const mediaTypeEnum = z.enum([
  "NEWSPAPER", "MAGAZINE", "TV", "RADIO", "OUTDOOR", "ONLINE", "CINEMA", "OTHER",
]);

export const pricingModelEnum = z.enum(["CPM", "CPC", "FLAT_RATE", "DYNAMIC"]);

export const assetStatusEnum = z.enum(["DRAFT", "PENDING_REVIEW", "ACTIVE", "PAUSED", "ARCHIVED"]);

export const locationSchema = z.object({
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  governorate: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const specificationsSchema = z.object({
  width: z.coerce.number().positive().optional().nullable(),
  height: z.coerce.number().positive().optional().nullable(),
  displayArea: z.coerce.number().positive().optional().nullable(),
  resolution: z.string().optional(),
  orientation: z.string().optional(),
  isIlluminated: z.boolean().default(false),
  hasAudio: z.boolean().default(false),
  isInteractive: z.boolean().default(false),
});

export const pricingSchema = z.object({
  pricingModel: pricingModelEnum.optional().nullable(),
  basePrice: z.coerce.number().positive("Price must be positive").optional().nullable(),
  currency: z.string().default("SAR"),
  minimumSpend: z.coerce.number().positive().optional().nullable(),
  slotGranularity: z.string().optional(),
});

export const audienceSchema = z.object({
  dailyImpressions: z.coerce.number().int().nonnegative().optional().nullable(),
  monthlyImpressions: z.coerce.number().int().nonnegative().optional().nullable(),
  estimatedViews: z.coerce.number().int().nonnegative().optional().nullable(),
  audienceDemographics: z.any().optional(),
});

export const imageSchema = z.object({
  url: z.string().url(),
  key: z.string(),
  alt: z.string().optional(),
  sortOrder: z.number().int().nonnegative(),
  isThumbnail: z.boolean(),
});

export const createAssetSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  mediaType: mediaTypeEnum.optional().nullable(),
  format: z.string().optional(),
  location: locationSchema,
  ...specificationsSchema.shape,
  ...pricingSchema.shape,
  ...audienceSchema.shape,
  images: z.array(imageSchema),
});

export const updateAssetSchema = createAssetSchema.partial().extend({
  assetStatus: assetStatusEnum.optional(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type SpecificationsInput = z.infer<typeof specificationsSchema>;
export type PricingInput = z.infer<typeof pricingSchema>;
export type AudienceInput = z.infer<typeof audienceSchema>;
export type ImageInput = z.infer<typeof imageSchema>;

export interface SellerAsset {
  id: string;
  title: string;
  slug: string | null;
  mediaType: string | null;
  description: string | null;
  format: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  locationGovernorate: string | null;
  assetStatus: string;
  basePrice: number | null;
  currency: string | null;
  dailyImpressions: number | null;
  images: ImageInput[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerAssetsResponse {
  data: SellerAsset[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
