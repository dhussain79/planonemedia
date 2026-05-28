import { z } from "zod";

export const mediaFilterSchema = z.object({
  type: z.string().optional(),
  region: z.string().optional(),
  query: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(20),
});

export const createMediaSchema = z.object({
  title: z.string().min(1).max(200),
  mediaType: z.enum(["NEWSPAPER", "MAGAZINE", "TV", "RADIO", "OUTDOOR", "ONLINE", "CINEMA", "OTHER"]).optional(),
  description: z.string().optional(),
  region: z.string().optional(),
  supplierId: z.string().optional(),
});
